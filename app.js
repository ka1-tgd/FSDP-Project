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
// Middleware
const transferMiddleware = require("./backend/middleware/transferamountmid");

// Controllers
const chatbotController = require("./backend/controllers/chatbotController");
const transferController = require("./backend/controllers/transferamountcon");
// Serve static files from public
app.use(express.static(path.join(__dirname, "public")));

// Routes
//transfer routes


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
app.get("/chatbot", (req, res) => {res.sendFile(path.join(__dirname, "public", "html", "aiChatbot.html"));});
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
    await mssql.close();
    console.log("Database connections closed");
    process.exit(0);
});