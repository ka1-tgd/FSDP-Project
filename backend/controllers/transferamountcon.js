const transferAmountModel = require("../models/transferamountmodel");

// Recipient (looked up by phone number)
async function getRecipientByPhone(req, res) {
  try {
    const recipient = await transferAmountModel.getRecipientByPhone(
      req.params.phone
    );
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }
    res.json(recipient);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving recipient" });
  }
}

// Sender account (the logged-in user, taken from the JWT)
async function getSender(req, res) {
  try {
    const account = await transferAmountModel.getAccountByNric(req.user.nric);
    if (!account) {
      return res.status(404).json({ error: "Sender account not found" });
    }
    res.json(account);
    } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getRecipientByPhone,
  getSender,
};