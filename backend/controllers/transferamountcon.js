const transferAmountModel = require("../models/transferamountmodel");

// No login yet so this is just for reference
const SENDER_ACC_NO = "123-4-567890";

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

async function getSender(req, res) {
  try {
    const account = await transferAmountModel.getAccountByAccNo(SENDER_ACC_NO);
    if (!account) {
      return res.status(404).json({ error: "Sender account not found" });
    }
    res.json(account);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving sender account" });
  }
}

module.exports = {
  getRecipientByPhone,
  getSender,
};