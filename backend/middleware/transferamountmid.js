// middleware/transferMiddleware.js

// Validate PayNow transfer details
function validateTransfer(req, res, next) {
    const { phoneNo, amount, description } = req.body;

    // Check phone number
    if (!phoneNo) {
        return res.status(400).json({
            message: "Phone number is required."
        });
    }

    if (!/^\d{8}$/.test(phoneNo)) {
        return res.status(400).json({
            message: "Phone number must contain exactly 8 digits."
        });
    }

    // Check transfer amount
    if (amount === undefined || amount === null || amount === "") {
        return res.status(400).json({
            message: "Transfer amount is required."
        });
    }

    const transferAmount = Number(amount);

    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({
            message: "Please enter a valid transfer amount."
        });
    }

    // Store validated amount as a number
    req.body.amount = transferAmount;

    next();
}

module.exports = {
    validateTransfer
};