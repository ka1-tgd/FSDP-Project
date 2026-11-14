// controllers/transferController.js



const transferModel = require("../models/transferamountmodel");

// Get PayNow transfer details
async function getTransferDetails(req, res) {
    try {
        const { phoneNo, amount, description } = req.body;
        // Get sender account details
        const sender = await transferModel.getSenderAccount();
        if (!sender) {
            return res.status(404).json({
                message: "Sender account not found."
            });
        }

        // Get recipient details using phone number
        const recipient = await transferModel.getRecipientByPhone(phoneNo);
        if (!recipient) {
            return res.status(404).json({
                message: "Recipient not found. Please check the phone number."
            });
        }


        // Check available balance
        if (amount > sender.Balance) {
            return res.status(400).json({
                message: "Insufficient balance."
            });
        }

        // Return transfer details to frontend
        return res.status(200).json({
            message: "Transfer details retrieved successfully.",
            transfer: {
                senderName: sender.Name,
                senderAccount: sender.AccNo,
                senderAccountType: sender.AccType,
                availableBalance: sender.Balance,

                recipientName: recipient.Name,
                recipientPhone: recipient.PhoneNo,

                amount: amount,
                description: description || null
            }
        });

    } catch (error) {
        console.error("Transfer controller error:", error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
}

module.exports = {
    getTransferDetails
};