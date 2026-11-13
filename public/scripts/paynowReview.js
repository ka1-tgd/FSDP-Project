
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

// Load transfer details
let transferDetails = null;
let isProcessing = false;
let startX = 0;
let currentX = 0;
let isDragging = false;

function loadTransferDetails() {
    const stored = sessionStorage.getItem("paynowTransfer");

    if (!stored) {
        transferStatus.textContent =
            "Transfer details not found. Please return to Step 2.";

        transferStatus.classList.add("error");
        slideToPay.classList.add("processing");
        return false;
    }

    try {
        transferDetails = JSON.parse(stored);

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

        transferStatus.textContent =
            "Unable to load transfer details.";

        transferStatus.classList.add("error");
        slideToPay.classList.add("processing");

        return false;
    }
}


// Reset slider position
function resetSlider() {
    slideHandle.style.left = "5px";
    currentX = 0;
}


// Show status
function showStatus(message, type) {
    transferStatus.textContent = message;
    transferStatus.className = `transfer-status ${type}`;
}


// Submit transfer
async function submitTransfer() {

    if (isProcessing || !transferDetails) return;

    isProcessing = true;

    slideToPay.classList.add("processing");
    slideText.textContent = "Processing...";

    showStatus("Please wait while your transfer is processed.", "");

    try {
        const response = await fetch(`${API_URL}/paynow/transfer`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                recipientAccNo: transferDetails.recipientAccNo,
                amount: transferDetails.amount
            })
        });

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (error) {
            console.error("Server returned HTML instead of JSON:");
            console.error(responseText);
            throw new Error(
        "Unable to reach the PayNow transfer API. Check your server route."
    );
}

if (!response.ok) {
    throw new Error(
        result.error || "Unable to complete transfer."
    );
}

        if (!response.ok) {
            throw new Error(
                result.error || "Unable to complete transfer."
            );
        }
        
        showStatus("Transfer successful!", "success");
        slideText.textContent = "Payment successful";
        
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

// Prevent another submission
slideHandle.disabled = true;

// Navigate to Step 4
setTimeout(() => {
    window.location.href = "transferSuccess.html";
}, 800);


    
    } catch (error) {

        console.error("Transfer error:", error);

        let userMessage = error.message;

        // Friendly error messages
        if (userMessage.includes("Insufficient")) {
            userMessage =
                "Insufficient balance. Please enter a lower amount.";

        } else if (userMessage.includes("Recipient account")) {
            userMessage =
                "Unable to find recipient. Please check the details.";

        } else if (userMessage.includes("Sender account")) {
            userMessage =
                "Unable to access your account. Please try again.";

        } else if (userMessage.includes("own account")) {
            userMessage =
                "You cannot transfer money to your own account.";

        } else if (
            userMessage.includes("fetch") ||
            userMessage.includes("API")
        ) {
            userMessage =
                "Connection error. Please try again later.";

        } else if (!userMessage) {
            userMessage =
                "Something went wrong. Please try again.";
        }

        showStatus(userMessage, "error");

        slideText.textContent = "Slide to pay";

        isProcessing = false;

        slideToPay.classList.remove("processing");

        resetSlider();
    }
}


// Slider pointer events
slideHandle.addEventListener("pointerdown", event => {

    if (isProcessing || !transferDetails) return;

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
loadTransferDetails();
