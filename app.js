// Require express, mssql, dotenv and path
const express = require("express");
const mssql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");

// Load env variables
dotenv.config();
const dbConfig = require("./dbConfig");

// Create express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON req bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded req bodies
const transferAmountMiddleware = require("./backend/middleware/transferamountmid");
//controllers
const chatbotController = require("../FSDP-Project/backend/controllers/chatbotController")
const transferAmountController = require("./backend/controllers/transferamountcon");
// Serve static files from public
app.use(express.static(path.join(__dirname, "public")));

// PayNow temporary demo user
function getDemoUser(req, res) {
    const ownerNRIC = process.env.DEMO_USER_NRIC;

    if (!ownerNRIC) {
        res.status(400).json({
            error: "Demo user NRIC not configured"
        });
        return null;
    }

    return ownerNRIC.trim();
}

// Reuse database connection

// PayNow database connection
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

// Routes
//transfer routes
app.get(
  "/api/transfer/recipient/:phone",
  transferAmountMiddleware.validatePhone,
  transferAmountController.getRecipientByPhone
);
app.get("/api/transfer/sender", transferAmountController.getSender);


// PayNow saved contacts
app.get("/api/paynow/contacts", async (req, res) => {
    try {
        const ownerNRIC = getDemoUser(req, res);
        if (!ownerNRIC) return;

        const pool = await getPool();

        const result = await pool.request()
            .input("OwnerNRIC", mssql.Char(9), ownerNRIC)
            .query(`
                SELECT
                    sc.ContactID AS id,
                    sc.SavedName AS name,
                    RTRIM(u.PhoneNo) AS phone,
                    sc.RecipientType AS recipientType,
                    sc.RecipientIdentifier AS recipientIdentifier
                FROM dbo.SavedContacts sc
                LEFT JOIN dbo.Users u
                    ON sc.RecipientType = 'NRIC'
                    AND sc.RecipientIdentifier = u.NRIC
                WHERE sc.OwnerNRIC = @OwnerNRIC
                ORDER BY sc.CreatedAt DESC
            `);

        res.json(result.recordset);

    } catch (error) {
        console.error("Contacts error:", error);
        res.status(500).json({
            error: "Unable to load contacts"
        });
    }
});

 // PayNow - Get 10 most recent unique recipients
app.get("/api/paynow/recent", async (req, res) => {
    try {
        const ownerNRIC = getDemoUser(req, res);
        if (!ownerNRIC) return;

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


// PayNow - Mask registered recipient name
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

// PayNow - Search by NRIC/FIN
app.get("/api/paynow/search/nric", async (req, res) => {
    try {
        const ownerNRIC = getDemoUser(req, res);
        if (!ownerNRIC) return;

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
            name: person.registeredName,
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

// PayNow - Search by UEN
app.get("/api/paynow/search/uen", async (req, res) => {
    try {
        const ownerNRIC = getDemoUser(req, res);
        if (!ownerNRIC) return;

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


// Get faqs
app.get("/api/chatbot", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "aiChatbot.html"));
});
app.post("/api/chatbot", chatbotController.handleChat);

// Start server
app.listen(port, () => {
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