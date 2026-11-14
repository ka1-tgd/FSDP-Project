
const transferAmountModel = require("../models/transferamountmodel");

// Get PayNow transfer details
async function getTransferDetails(req, res) {
    try {
        const { phoneNo, amount, description } = req.body;

        const sender = await transferAmountModel.getSenderAccount();

        if (!sender) {
            return res.status(404).json({
                message: "Sender account not found."
            });
        }

        const recipient = await transferAmountModel.getRecipientByPhone(phoneNo);

        if (!recipient) {
            return res.status(404).json({
                message: "Recipient not found. Please check the phone number."
            });
        }

        if (amount > sender.Balance) {
            return res.status(400).json({
                message: "Insufficient balance."
            });
        }

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

// Recipient (looked up by phone number)
async function getRecipientByPhone(req, res) {
    try {
        const recipient = await transferAmountModel.getRecipientByPhone(
            req.params.phone
        );

        if (!recipient) {
            return res.status(404).json({
                error: "Recipient not found"
            });
        }

        res.json(recipient);

    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            error: "Error retrieving recipient"
        });
    }
}

// Sender account (the logged-in user, taken from the JWT)
async function getSender(req, res) {
    try {
        const account = await transferAmountModel.getAccountByNric(
            req.user.nric
        );

        if (!account) {
            return res.status(404).json({
                error: "Sender account not found"
            });
        }

        res.json(account);

    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            error: error.message
        });
    }
}

module.exports = {
    getTransferDetails,
    getRecipientByPhone,
    getSender
};
