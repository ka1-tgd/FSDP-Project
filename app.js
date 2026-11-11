// Require express, mssql, dotenv and path
const express = require("express");
const sql = require("mssql");
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
const transferMiddleware = require("../middleware/transferamountmid");

//controllers
const transferController = require("../controllers/transferamountcon");
const chatbotController = require("../FSDP-Project/backend/controllers/chatbotController");
// Serve static files from public
app.use(express.static(path.join(__dirname, "public")));

// Routes
//transfer routes
app.post(
    "/api/transfer/details",
    transferMiddleware.validateTransfer,
    transferController.getTransferDetails
);

// Get contacts from SQL Server
app.get("/api/paynow/contacts", async (req, res) => {
    try {
        const pool = await mssql.connect(dbConfig);

        const result = await pool.request().query(`
            SELECT
                a.AccNo AS id,
                u.Name AS name,
                RTRIM(u.PhoneNo) AS phone
            FROM Users u
            INNER JOIN Account a ON u.NRIC = a.NRIC
            ORDER BY u.Name
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error("Contacts error:", error);
        res.status(500).json({
            error: "Unable to load contacts"
        });
    }
});

// Get faqs
app.post("/chatbot", chatbotController.handleChat);

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Graceful shutdown
// Listen for termination signals
process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");

    // Close any open connections
    await sql.close();
    console.log("Database connections closed");
    process.exit(0);
});