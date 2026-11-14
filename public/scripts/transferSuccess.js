
"use strict";

// Load successful transfer details
let successData = null;

try {
    successData = JSON.parse(
        sessionStorage.getItem("paynowSuccess") || "null"
    );
} catch (error) {
    console.error("Transaction storage error:", error);
}

// HTML elements
const successAmount = document.getElementById("successAmount");
const successRecipientName = document.getElementById("successRecipientName");
const successRecipientInfo = document.getElementById("successRecipientInfo");
const successDate = document.getElementById("successDate");
const successReference = document.getElementById("successReference");
const successTransactionId = document.getElementById("successTransactionId");

const transactionToggle = document.getElementById("transactionToggle");
const transactionDetails = document.getElementById("transactionDetails");
const successError = document.getElementById("successError");


// Format recipient phone
function formatPhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");

    return digits.startsWith("65")
        ? `+${digits}`
        : `+65${digits}`;
}


// Display transaction error
function displayError(message) {
    successError.textContent = message;
    successError.classList.remove("hidden");

    successRecipientName.textContent = "Details unavailable";
    successRecipientInfo.textContent = "";
    successDate.textContent = "-";
    successAmount.textContent = "0.00";
    successReference.textContent = "-";
    successTransactionId.textContent = "-";

    transactionToggle.disabled = true;
}


// Display successful transfer
function displaySuccess() {

    if (
        !successData ||
        !successData.transRef ||
        !Number.isFinite(Number(successData.amount)) ||
        Number(successData.amount) <= 0
    ) {
        displayError(
            "Unable to retrieve your transaction details. Please check your transaction history."
        );

        return;
    }

    const recipient = successData.recipient || {};

    // Display transfer amount
    successAmount.textContent =
        Number(successData.amount).toLocaleString("en-SG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    // Display recipient name
    successRecipientName.textContent =
        successData.recipientName ||
        recipient.savedName ||
        recipient.name ||
        "Recipient";

    // Display recipient information
    const phone =
        successData.phone ||
        recipient.phone ||
        recipient.PhoneNo ||
        "";

    const maskedName =
        successData.maskedName ||
        recipient.maskedName ||
        "";

    successRecipientInfo.textContent =
        successData.recipientInfo ||
        [
            phone ? formatPhone(phone) : "",
            maskedName
        ].filter(Boolean).join(" · ");

    // Display transaction date and time
    const transactionDate = successData.transactionDate
        ? new Date(successData.transactionDate)
        : new Date();

    if (!Number.isNaN(transactionDate.getTime())) {

        successDate.textContent =
            transactionDate.toLocaleString("en-SG", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });

    } else {
        successDate.textContent = "-";
    }

    // Display transaction reference
    successReference.textContent = successData.transRef;
    successTransactionId.textContent = successData.transRef;

    // Hide error message
    successError.classList.add("hidden");
}


// Show or hide transaction details
transactionToggle.addEventListener("click", () => {

    transactionDetails.classList.toggle("hidden");

    transactionToggle.textContent =
        transactionDetails.classList.contains("hidden")
            ? "See transaction details"
            : "Hide transaction details";
});


// Return to PayNow transfers
document.getElementById("goTransfers").addEventListener("click", () => {
    window.location.href = "paynowSent.html";
});


// Return to home
document.getElementById("backHome").addEventListener("click", () => {
    window.location.href = "ocbcHome.html";
});


// Load page
displaySuccess();
