
const API_URL = "http://localhost:3000/api";

// Elements
const reviewAmount = document.getElementById("reviewAmount");
const reviewSenderType = document.getElementById("reviewSenderType");
const reviewSenderNumber = document.getElementById("reviewSenderNumber");
const reviewRecipientName = document.getElementById("reviewRecipientName");
const reviewRecipientInfo = document.getElementById("reviewRecipientInfo");

const slideToPay = document.getElementById("slideToPay");
const slideHandle = document.getElementById("slideHandle");
const slideText = document.getElementById("slideText");
const transferStatus = document.getElementById("transferStatus");

// Variables
let transferDetails = null;
let isProcessing = false;
let startX = 0;
let currentX = 0;
let isDragging = false;


// Get authentication headers
function getAuthHeaders() {
    const token = sessionStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return null;
    }

    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}


// Handle expired login session
function handleUnauthorized(response) {
    if (response.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userName");
        window.location.href = "login.html";
        return true;
    }

    return false;
}


// Show payment error popup
function showTransferError(title, message) {
    if (typeof window.showAppError === "function") {
        window.showAppError(title, message);
    } else {
        showStatus(message, "error");
    }
}


// Load transfer details
function loadTransferDetails() {
    const stored = sessionStorage.getItem("paynowTransfer");

    if (!stored) {
        showTransferError(
            "Transfer details unavailable",
            "Your transfer details could not be retrieved. Please return to Step 2."
        );

        slideToPay.classList.add("processing");
        slideHandle.disabled = true;

        return false;
    }

    try {
        transferDetails = JSON.parse(stored);

        if (
            !transferDetails ||
            !transferDetails.amount ||
            !transferDetails.recipientAccNo
        ) {
            throw new Error("Incomplete transfer details");
        }

        reviewAmount.textContent =
            Number(transferDetails.amount).toFixed(2);

        reviewSenderType.textContent =
            `${transferDetails.senderType} Account`;

        reviewSenderNumber.textContent =
            transferDetails.senderAccNo;

        reviewRecipientName.textContent =
            transferDetails.recipientName;

        reviewRecipientInfo.textContent =
            transferDetails.recipientInfo || "";

        return true;

    } catch (error) {
        console.error("Transfer details error:", error);

        transferDetails = null;

        showTransferError(
            "Unable to load transfer",
            "Your payment details are incomplete. Please return to Step 2 and try again."
        );

        slideToPay.classList.add("processing");
        slideHandle.disabled = true;

        return false;
    }
}


// Reset slider position
function resetSlider() {
    slideHandle.style.left = "5px";
    currentX = 0;
}


// Show processing status
function showStatus(message, type) {
    transferStatus.textContent = message;
    transferStatus.className = `transfer-status ${type}`;
}


// Submit transfer
async function submitTransfer() {

    if (isProcessing || !transferDetails) return;

    const headers = getAuthHeaders();

    if (!headers) return;

    isProcessing = true;

    slideToPay.classList.add("processing");
    slideText.textContent = "Processing...";

    showStatus(
        "Please wait while your transfer is processed.",
        ""
    );

    try {
        const response = await fetch(`${API_URL}/paynow/transfer`, {
            method: "POST",

            headers: headers,

            body: JSON.stringify({
                recipientAccNo: transferDetails.recipientAccNo,
                amount: transferDetails.amount
            })
        });

        // Check login session
        if (handleUnauthorized(response)) return;

        const responseText = await response.text();

        let result;

        try {
            result = JSON.parse(responseText);

        } catch (error) {
            console.error("Server returned HTML instead of JSON:");
            console.error(responseText);

            throw new Error(
                "Unable to reach the PayNow transfer API."
            );
        }

        if (!response.ok || !result.success) {
            throw new Error(
                result.error || "Unable to complete transfer."
            );
        }

        // Check transaction reference
        if (!result.transRef) {

            // Avoid duplicate transfer attempts
            slideHandle.disabled = true;

            slideText.textContent = "Check transaction status";

            showStatus("", "");

            showTransferError(
                "Confirmation unavailable",
                "The payment response did not include a transaction reference. Please check your transaction history before attempting another transfer."
            );

            return;
        }

        // Save successful transfer details for Step 4
        const recipient = JSON.parse(
            sessionStorage.getItem("paynowRecipient") || "{}"
        );

        sessionStorage.setItem("paynowSuccess", JSON.stringify({
            transRef: result.transRef,
            amount: result.amount || transferDetails.amount,
            recipient: recipient,
            recipientName: transferDetails.recipientName,
            recipientInfo: transferDetails.recipientInfo,
            phone: recipient.phone || recipient.PhoneNo || "",
            maskedName: recipient.maskedName || "",
            transactionDate: new Date().toISOString()
        }));

        showStatus("Transfer successful!", "success");

        slideText.textContent = "Payment successful";

        // Prevent duplicate submission
        slideHandle.disabled = true;

        // Navigate to Step 4
        setTimeout(() => {
            window.location.href = "transferSuccess.html";
        }, 800);

    } catch (error) {

        console.error("Transfer error:", error);

        const userMessage = error.message || "";

        let errorTitle = "Transfer unsuccessful";
        let errorDescription =
            "Your transfer could not be completed. Please try again.";

        // Friendly error messages
        if (userMessage.includes("Insufficient")) {
            errorTitle = "Insufficient balance";
            errorDescription =
                "You do not have enough available balance. Please enter a lower amount.";

        } else if (userMessage.includes("Recipient account")) {
            errorTitle = "Recipient unavailable";
            errorDescription =
                "We could not find the recipient's account. Please check the recipient details.";

        } else if (userMessage.includes("Sender account")) {
            errorTitle = "Account unavailable";
            errorDescription =
                "We could not access your sender account. Please try again later.";

        } else if (userMessage.includes("own account")) {
            errorTitle = "Invalid recipient";
            errorDescription =
                "You cannot transfer money to your own account.";

        } else if (
            userMessage.includes("fetch") ||
            userMessage.includes("API") ||
            userMessage.includes("network") ||
            userMessage.includes("JSON")
        ) {
            errorTitle = "Connection error";
            errorDescription =
                "Unable to connect to the PayNow service. Please check your connection and transaction status before trying again.";
        }

        showStatus("", "");

        showTransferError(
            errorTitle,
            errorDescription
        );

        slideText.textContent = "Slide to pay";

        isProcessing = false;

        slideToPay.classList.remove("processing");

        resetSlider();
    }
}


// Slider pointer events
slideHandle.addEventListener("pointerdown", event => {

    if (
        isProcessing ||
        !transferDetails ||
        slideHandle.disabled
    ) return;

    isDragging = true;
    startX = event.clientX;

    slideHandle.setPointerCapture(event.pointerId);
});


slideHandle.addEventListener("pointermove", event => {

    if (!isDragging || isProcessing) return;

    const containerWidth = slideToPay.clientWidth;
    const handleWidth = slideHandle.offsetWidth;

    const maxDistance =
        containerWidth - handleWidth - 10;

    currentX = Math.max(
        0,
        Math.min(event.clientX - startX, maxDistance)
    );

    slideHandle.style.left = `${5 + currentX}px`;
});


slideHandle.addEventListener("pointerup", async () => {

    if (!isDragging || isProcessing) return;

    isDragging = false;

    const containerWidth = slideToPay.clientWidth;
    const handleWidth = slideHandle.offsetWidth;

    const maxDistance =
        containerWidth - handleWidth - 10;

    if (currentX >= maxDistance * 0.85) {

        await submitTransfer();

    } else {

        resetSlider();
    }
});


slideHandle.addEventListener("pointercancel", () => {

    isDragging = false;

    if (!isProcessing) {
        resetSlider();
    }
});


// Initial loading
if (!sessionStorage.getItem("token")) {
    window.location.href = "login.html";
} else {
    loadTransferDetails();
}
