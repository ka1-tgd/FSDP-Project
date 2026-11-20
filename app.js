// Require express, mssql, dotenv and path
const express = require("express");
const mssql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");
const crypto = require("crypto");
const cors = require("cors");

// Load env variables
dotenv.config();
const dbConfig = require("./dbConfig");

// Create express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
// Log every incoming request
app.use((req, res, next) => {
    console.log("REQUEST RECEIVED:", req.method, req.path);
    console.log("ORIGIN:", req.headers.origin);
    next();
});

// Temporary simplified CORS configuration
app.use(cors());
app.use(express.json()); // Parse JSON req bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded req bodies

const transferAmountMiddleware = require("./backend/middleware/transferamountmid");
const userLoginMiddleware = require("./backend/middleware/userloginMiddle");

// Controllers
const chatbotController = require("./backend/controllers/chatbotController");
const transferAmountController = require("./backend/controllers/transferamountcon");
const userLoginController = require("./backend/controllers/userloginController");
const ocbcHomeController = require("./backend/controllers/ocbcHomeController");

// Serve static files from public
app.use(express.static(path.join(__dirname, "public")));

// Reuse database connection
let poolPromise;

async function getPool() {
    if (!poolPromise) {
        poolPromise = mssql.connect(dbConfig);
    }

    try {
        const pool = await poolPromise;

        if (!pool.connected) {
            poolPromise = null;
            return getPool();
        }

        return pool;
    } catch (error) {
        poolPromise = null;
        throw error;
    }
}


// PayNow saved contacts
app.get("/api/paynow/contacts", userLoginMiddleware.verifyToken, async (req, res) => {
    try {
        const ownerNRIC = req.user.nric;

        const pool = await getPool();

        const result = await pool.request()
            .input("OwnerNRIC", mssql.Char(9), ownerNRIC)
            .query(`
                SELECT
                    sc.ContactID AS contactId,
                    a.AccNo AS id,
                    sc.SavedName AS name,
                    RTRIM(u.PhoneNo) AS phone,
                    sc.RecipientType AS recipientType,
                    RTRIM(sc.RecipientIdentifier) AS recipientIdentifier
                FROM dbo.SavedContacts sc
                LEFT JOIN dbo.Users u
                    ON sc.RecipientType = 'NRIC'
                    AND sc.RecipientIdentifier = u.NRIC
                OUTER APPLY (
                    SELECT TOP 1 account.AccNo
                    FROM dbo.Account account
                    WHERE
                        (
                            sc.RecipientType = 'NRIC'
                            AND account.NRIC = sc.RecipientIdentifier
                        )
                        OR
                        (
                            sc.RecipientType = 'UEN'
                            AND RTRIM(account.UEN) =
                                RTRIM(sc.RecipientIdentifier)
                        )
                    ORDER BY account.AccNo
                ) a
                WHERE sc.OwnerNRIC = @OwnerNRIC
                ORDER BY sc.CreatedAt DESC;
            `);

        res.json(result.recordset);

    } catch (error) {
        console.error("Contacts error:", error);

        res.status(500).json({
            error: "Unable to load contacts"
        });
    }
});

// PayNow recent recipients
app.get("/api/paynow/recent", userLoginMiddleware.verifyToken, async (req, res) => {
    try {
        const ownerNRIC = req.user.nric;

        const pool = await getPool();

        const result = await pool.request()
            .input("OwnerNRIC", mssql.Char(9), ownerNRIC)
            .query(`
                WITH RecentPayments AS (
                    SELECT
                        t.RecipientAccNo,
                        t.TransDateTime,
                        ROW_NUMBER() OVER (
                            PARTITION BY t.RecipientAccNo
                            ORDER BY t.TransDateTime DESC, t.TransRef DESC
                        ) AS RowNum
                    FROM dbo.Transactions t
                    INNER JOIN dbo.Account sender
                        ON t.PayerAccNo = sender.AccNo
                    WHERE sender.NRIC = @OwnerNRIC
                      AND t.Status = 'completed'
                )
                SELECT TOP 10
                    recipient.AccNo AS id,
                    COALESCE(
                        NULLIF(RTRIM(u.Name), ''),
                        NULLIF(RTRIM(recipient.UEN), ''),
                        'Unknown recipient'
                    ) AS name,
                    RTRIM(u.PhoneNo) AS phone,
                    CASE
                        WHEN NULLIF(RTRIM(recipient.UEN), '') IS NOT NULL
                            THEN 'UEN'
                        ELSE 'NRIC'
                    END AS recipientType,
                    CASE
                        WHEN NULLIF(RTRIM(recipient.UEN), '') IS NOT NULL
                            THEN RTRIM(recipient.UEN)
                        ELSE RTRIM(recipient.NRIC)
                    END AS recipientIdentifier,
                    recent.TransDateTime AS transactionDate
                FROM RecentPayments recent
                INNER JOIN dbo.Account recipient
                    ON recent.RecipientAccNo = recipient.AccNo
                LEFT JOIN dbo.Users u
                    ON recipient.NRIC = u.NRIC
                WHERE recent.RowNum = 1
                ORDER BY recent.TransDateTime DESC, recipient.AccNo;
            `);

        res.json(result.recordset);

    } catch (error) {
        console.error("Recent recipients error:", error);

        res.status(500).json({
            error: "Unable to load recent recipients"
        });
    }
});

// PayNow mask registered recipient name
function maskPayNowName(fullName) {
    return String(fullName || "")
        .trim()
        .split(/\s+/)
        .map(part => {
            if (part.length <= 2) return part.toUpperCase();

            return part.substring(0, 2).toUpperCase() +
                "X".repeat(part.length - 2);
        })
        .join(" ");
}

// PayNow search NRIC/FIN
app.get("/api/paynow/search/nric", userLoginMiddleware.verifyToken, async (req, res) => {
    try {
        const ownerNRIC = req.user.nric;

        const value = String(req.query.value || "")
            .trim()
            .toUpperCase();

        if (!/^[A-Z][0-9]{7}[A-Z]$/.test(value)) {
            return res.json([]);
        }

        const pool = await getPool();

        const result = await pool.request()
            .input("NRIC", mssql.Char(9), value)
            .input("OwnerNRIC", mssql.Char(9), ownerNRIC)
            .query(`
                SELECT TOP 1
                    a.AccNo AS id,
                    RTRIM(u.Name) AS registeredName,
                    RTRIM(u.PhoneNo) AS phone,
                    RTRIM(u.NRIC) AS recipientIdentifier
                FROM dbo.Users u
                INNER JOIN dbo.Account a
                    ON a.NRIC = u.NRIC
                WHERE u.NRIC = @NRIC
                  AND u.NRIC <> @OwnerNRIC
                ORDER BY a.AccNo;
            `);

        const recipients = result.recordset.map(person => ({
            id: person.id,
            name: maskPayNowName(person.registeredName),
            phone: person.phone,
            recipientType: "NRIC",
            recipientIdentifier: person.recipientIdentifier
        }));

        res.json(recipients);

    } catch (error) {
        console.error("NRIC search error:", error);

        res.status(500).json({
            error: "Unable to search recipient"
        });
    }
});

// PayNow search UEN
app.get("/api/paynow/search/uen", userLoginMiddleware.verifyToken, async (req, res) => {
    try {
        const ownerNRIC = req.user.nric;

        const value = String(req.query.value || "")
            .trim()
            .toUpperCase();

        if (!/^[A-Z0-9]{9,10}$/.test(value)) {
            return res.json([]);
        }

        const pool = await getPool();

        const result = await pool.request()
            .input("UEN", mssql.Char(10), value)
            .input("OwnerNRIC", mssql.Char(9), ownerNRIC)
            .query(`
                SELECT TOP 1
                    a.AccNo AS id,
                    RTRIM(a.UEN) AS recipientIdentifier
                FROM dbo.Account a
                WHERE RTRIM(a.UEN) = @UEN
                  AND a.NRIC <> @OwnerNRIC
                ORDER BY a.AccNo;
            `);

        const recipients = result.recordset.map(person => ({
            id: person.id,
            name: "UEN " + person.recipientIdentifier,
            phone: "",
            recipientType: "UEN",
            recipientIdentifier: person.recipientIdentifier
        }));

        res.json(recipients);

    } catch (error) {
        console.error("UEN search error:", error);

        res.status(500).json({
            error: "Unable to search recipient"
        });
    }
});

// PayNow complete transfer
app.post("/api/paynow/transfer", userLoginMiddleware.verifyToken, async (req, res) => {
    const ownerNRIC = req.user.nric;

    const recipientAccNo = String(
        req.body.recipientAccNo || ""
    ).trim();

    const amount = Number(req.body.amount);

    console.log("PAYNOW DEBUG");
    console.log("Sender NRIC:", ownerNRIC);
    console.log("Recipient account:", JSON.stringify(recipientAccNo));
    console.log("Amount:", amount);

    if (
        !recipientAccNo ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        Math.round(amount * 100) !== amount * 100
    ) {
        return res.status(400).json({
            error: "Invalid transfer details."
        });
    }

    let transaction;
    let transactionStarted = false;

    try {
        const pool = await getPool();

        transaction = new mssql.Transaction(pool);
        await transaction.begin();
        transactionStarted = true;

        // Find sender account
        const senderResult = await new mssql.Request(transaction)
            .input("OwnerNRIC", mssql.Char(9), ownerNRIC)
            .query(`
                SELECT TOP 1 AccNo, Balance
                FROM dbo.Account WITH (UPDLOCK, HOLDLOCK)
                WHERE NRIC = @OwnerNRIC
                ORDER BY AccNo;
            `);

        if (senderResult.recordset.length === 0) {
            throw new Error("Sender account not found.");
        }

        const sender = senderResult.recordset[0];

        // Find recipient account
        const recipientResult = await new mssql.Request(transaction)
            .input("RecipientAccNo", mssql.VarChar(50), recipientAccNo)
            .query(`
                SELECT AccNo
                FROM dbo.Account WITH (UPDLOCK, HOLDLOCK)
                WHERE LTRIM(RTRIM(AccNo)) =
                      LTRIM(RTRIM(@RecipientAccNo));
            `);

        console.log("Recipient lookup:", recipientResult.recordset);

        if (recipientResult.recordset.length === 0) {
            throw new Error("Recipient account not found.");
        }

        const actualRecipientAccNo =
            recipientResult.recordset[0].AccNo;

        // Prevent transfers to own account
        if (sender.AccNo.trim() === actualRecipientAccNo.trim()) {
            throw new Error("You cannot transfer to your own account.");
        }

        // Check available balance
        if (Number(sender.Balance) < amount) {
            throw new Error("Insufficient account balance.");
        }

        // Deduct sender balance
        const deductResult = await new mssql.Request(transaction)
            .input("Amount", mssql.Decimal(19, 2), amount)
            .input("SenderAccNo", mssql.VarChar(50), sender.AccNo)
            .query(`
                UPDATE dbo.Account
                SET Balance = Balance - @Amount
                WHERE AccNo = @SenderAccNo
                  AND Balance >= @Amount;
            `);

        if (deductResult.rowsAffected[0] !== 1) {
            throw new Error("Unable to deduct sender balance.");
        }

        // Credit recipient balance
        const creditResult = await new mssql.Request(transaction)
            .input("Amount", mssql.Decimal(19, 2), amount)
            .input("RecipientAccNo", mssql.VarChar(50), actualRecipientAccNo)
            .query(`
                UPDATE dbo.Account
                SET Balance = Balance + @Amount
                WHERE AccNo = @RecipientAccNo;
            `);

        if (creditResult.rowsAffected[0] !== 1) {
            throw new Error("Unable to update recipient balance.");
        }

        // Record completed transaction
        const transRef = crypto.randomUUID();

        await new mssql.Request(transaction)
            .input("TransRef", mssql.VarChar(50), transRef)
            .input("PayerAccNo", mssql.VarChar(50), sender.AccNo)
            .input("RecipientAccNo", mssql.VarChar(50), actualRecipientAccNo)
            .input("Amount", mssql.Decimal(19, 2), amount)
            .query(`
                INSERT INTO dbo.Transactions (
                    TransRef,
                    PayerAccNo,
                    RecipientAccNo,
                    Description,
                    Amount,
                    Status,
                    TransDateTime
                )
                VALUES (
                    @TransRef,
                    @PayerAccNo,
                    @RecipientAccNo,
                    'PayNow Transfer',
                    @Amount,
                    'completed',
                    SYSDATETIME()
                );
            `);

        await transaction.commit();
        transactionStarted = false;

        console.log("PayNow transfer completed:", transRef);

        res.json({
            success: true,
            message: "Transfer completed successfully.",
            transRef: transRef,
            amount: amount.toFixed(2)
        });

    } catch (error) {
        if (transaction && transactionStarted) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
        }

        console.error("PayNow transfer error:", error);

        res.status(400).json({
            error: error.message || "Unable to complete transfer."
        });
    }
});

//login routes
// Login (public)
app.post(
  "/api/auth/login",
  userLoginMiddleware.validateLogin,
  userLoginController.login
);

// Home page data (login required)
app.get(
  "/api/home",
  userLoginMiddleware.verifyToken,
  ocbcHomeController.getHome
);

// Transfer (login required)
app.get(
  "/api/transfer/recipient/:phone",
  userLoginMiddleware.verifyToken,
  transferAmountMiddleware.validatePhone,
  transferAmountController.getRecipientByPhone
);
app.get(
  "/api/transfer/sender",
  userLoginMiddleware.verifyToken,
  transferAmountController.getSender
);


// Get faqs
app.get("/api/chatbot", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "aiChatbot.html"));
});
app.post("/api/chatbot", chatbotController.handleChat);

// Start server
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});

// Graceful shutdown
// Listen for termination signals
process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");

    // Close any open connections
    await mssql.close();
    console.log("Database connections closed");
    process.exit(0);
});