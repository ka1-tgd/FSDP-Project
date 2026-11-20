const ocbcHomeModel = require("../models/ocbcHomeModel");

const RECENT_LIMIT = 4;

// Home page data for the logged-in user (req.user comes from verifyToken)
async function getHome(req, res) {
  try {
    const nric = req.user.nric;

    // One after the other, because the models share one database connection
    const accounts = await ocbcHomeModel.getAccountsByNric(nric);
    const transactions = await ocbcHomeModel.getRecentTransactions(
      nric,
      RECENT_LIMIT
    );

    res.json({ accounts, transactions });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving home data" });
  }
}

module.exports = {
  getHome,
};