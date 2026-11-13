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
let poolPromise;

function getPool() {
    if (!poolPromise) {
        poolPromise = mssql.connect(dbConfig).catch(error => {
            poolPromise = null;
            throw error;
        });
    }

    return poolPromise;
}

// Routes
//transfer routes
app.get(
  "/api/transfer/recipient/:phone",
  transferAmountMiddleware.validatePhone,
  transferAmountController.getRecipientByPhone
);
app.get("/api/transfer/sender", transferAmountController.getSender);


// PayNow - Get saved contacts
app.get("/api/paynow/contacts", async (req, res) => {
    try {
        const ownerNRIC = getDemoUser(req, res);
        if (!ownerNRIC) return;

        const pool = await getPool();

        const result = await pool.request()
            .input("OwnerNRIC", mssql.Char(9), ownerNRIC)
            .query(`
                SELECT
                    ContactID AS id,
                    SavedName AS name,
                    RecipientType AS recipientType,
                    RecipientIdentifier AS recipientIdentifier
                FROM dbo.SavedContacts
                WHERE OwnerNRIC = @OwnerNRIC
                ORDER BY CreatedAt DESC
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