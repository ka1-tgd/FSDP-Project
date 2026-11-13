
// Load successful transfer details
const successData = JSON.parse(
    sessionStorage.getItem("paynowSuccess") || "null"
);

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
    return digits.startsWith("65") ? `+${digits}` : `+65${digits}`;
}

// Display successful transfer
function displaySuccess() {
    if (!successData || !successData.transRef) {
        successError.textContent =
            "Unable to retrieve your transaction details. Please check your transaction history.";

        successError.classList.remove("hidden");

        successRecipientName.textContent = "Details unavailable";
        successRecipientInfo.textContent = "";
        successDate.textContent = "-";
        successAmount.textContent = "0.00";

        transactionToggle.disabled = true;
        return;
    }

    const recipient = successData.recipient || {};

    successAmount.textContent =
        Number(successData.amount).toFixed(2);

    successRecipientName.textContent =
        successData.recipientName ||
        recipient.savedName ||
        recipient.name ||
        "Recipient";

    const phone = successData.phone || recipient.phone || "";
    const maskedName = successData.maskedName || recipient.maskedName || "";

    successRecipientInfo.textContent =
    successData.recipientInfo ||
    [
        phone ? formatPhone(phone) : "",
        maskedName
    ].filter(Boolean).join(" · ");

    const transactionDate = successData.transactionDate
        ? new Date(successData.transactionDate)
        : new Date();

    successDate.textContent =
        transactionDate.toLocaleDateString("en-SG", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    successReference.textContent = successData.transRef;
    successTransactionId.textContent = successData.transRef;
}

// Show or hide transaction details
transactionToggle.addEventListener("click", () => {
    transactionDetails.classList.toggle("hidden");

    transactionToggle.textContent =
        transactionDetails.classList.contains("hidden")
            ? "See transaction details"
            : "Hide transaction details";
});

// Return to transfers
document.getElementById("goTransfers").addEventListener("click", () => {
    window.location.href = "paynowSent.html";
});

// Return to home
document.getElementById("backHome").addEventListener("click", () => {
    window.location.href = "ocbcHome.html";
});

// Load page
displaySuccess();
