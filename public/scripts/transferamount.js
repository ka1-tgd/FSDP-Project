
const API_URL = "http://localhost:3000/api";

// HTML elements
const token = sessionStorage.getItem("token");

const amountInput = document.getElementById("amountInput");
const quickButtons = document.querySelectorAll(".quick-amounts button");
const quickHint = document.getElementById("quickHint");
const moreAmounts = document.getElementById("moreAmounts");

const recipientName = document.getElementById("recipientName");
const recipientInfo = document.getElementById("recipientInfo");
const accountType = document.getElementById("accountType");
const accountNumber = document.getElementById("accountNumber");

const balanceButton = document.getElementById("balanceButton");
const balanceButtonText = document.getElementById("balanceButtonText");
const availableBalance = document.getElementById("availableBalance");
const nextButton = document.getElementById("nextButton");

// Custom keypad elements
const customKeypad = document.getElementById("customKeypad");
const keypadDone = document.getElementById("keypadDone");
const keypadAmount = document.getElementById("keypadAmount");
const keypadButtons = document.querySelectorAll("[data-key]");

// Variables
let senderBalance = null;
let recipientData = null;
let senderData = null;
let enteredAmount = "";


// Get authentication headers
function getAuthHeaders() {
    const currentToken = sessionStorage.getItem("token");

    if (!currentToken) {
        window.location.href = "login.html";
        return null;
    }

    return {
        "Authorization": `Bearer ${currentToken}`
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


// Format phone number
function formatPhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");

    return digits.startsWith("65")
        ? `+${digits}`
        : `+65${digits}`;
}


// Mask official registered name
function maskName(fullName) {
    return String(fullName || "")
        .trim()
        .split(/\s+/)
        .map(part => {
            if (part.length <= 2) return part.toUpperCase();

            return part.substring(0, 2).toUpperCase() +
                "X".repeat(part.length - 2);
        })
        .join(" ");
}


// Find saved contact
async function findSavedContact(person) {
    const headers = getAuthHeaders();

    if (!headers) return null;

    try {
        const response = await fetch(`${API_URL}/paynow/contacts`, {
            cache: "no-store",
            headers: headers
        });

        if (handleUnauthorized(response)) return null;

        if (!response.ok) {
            return null;
        }

        const contacts = await response.json();

        return contacts.find(contact =>
            contact.recipientType === person.recipientType &&
            String(contact.recipientIdentifier).trim().toUpperCase() ===
            String(person.recipientIdentifier || "").trim().toUpperCase()
        ) || null;

    } catch (error) {
        console.error("Saved contacts lookup error:", error);
        return null;
    }
}


// Get masked registered name
async function getMaskedRegisteredName(person) {

    if (person.maskedName) return person.maskedName;

    if (person.registeredName) {
        return maskName(person.registeredName);
    }

    if (
        person.recipientType !== "NRIC" ||
        !person.recipientIdentifier
    ) {
        return "";
    }

    const headers = getAuthHeaders();

    if (!headers) return "";

    try {
        const response = await fetch(
            `${API_URL}/paynow/search/nric?value=${encodeURIComponent(person.recipientIdentifier)}`,
            {
                cache: "no-store",
                headers: headers
            }
        );

        if (handleUnauthorized(response)) return "";

        if (!response.ok) return "";

        const results = await response.json();

        return results[0]?.name || "";

    } catch (error) {
        console.error("Registered name lookup error:", error);
        return "";
    }
}


// Display recipient information
async function displayRecipient(person, source) {
    const type = String(person.recipientType || "").toUpperCase();
    const identifier = String(person.recipientIdentifier || "").trim();

    const savedContact = await findSavedContact(person);

    if (savedContact) {
        const savedName =
            savedContact.name ||
            savedContact.SavedName ||
            person.savedName ||
            person.name ||
            "Saved recipient";

        recipientName.textContent = savedName;

        if (type === "NRIC") {
            const phone =
                person.phone ||
                person.PhoneNo ||
                savedContact.phone ||
                "";

            const maskedName =
                await getMaskedRegisteredName(person);

            recipientInfo.textContent =
                `${phone ? formatPhone(phone) + " · " : ""}${maskedName}`;

        } else {
            recipientInfo.textContent =
                `UEN/VPA · ${identifier}`;
        }

        return;
    }

    // Recipient is not saved
    if (type === "NRIC") {
        const maskedName =
            person.maskedName ||
            person.name ||
            person.registeredName ||
            "Unknown recipient";

        recipientName.textContent =
            person.maskedName || maskName(maskedName);

        recipientInfo.textContent =
            `NRIC/FIN · ${identifier}`;

    } else if (type === "UEN") {
        recipientName.textContent =
            person.name || `UEN ${identifier}`;

        recipientInfo.textContent =
            `UEN/VPA · ${identifier}`;

    } else {
        recipientName.textContent =
            person.name || "Unknown recipient";

        recipientInfo.textContent = "";
    }
}


// Load selected recipient
async function loadRecipient() {
    const storedRecipient =
        sessionStorage.getItem("paynowRecipient");

    if (storedRecipient) {
        try {
            recipientData = JSON.parse(storedRecipient);

            await displayRecipient(
                recipientData,
                sessionStorage.getItem("paynowRecipientSource") || "recent"
            );

            return;

        } catch (error) {
            console.error("Recipient storage error:", error);

            showAppError(
                "Recipient unavailable",
                "Unable to load the selected recipient. Please return to Step 1 and select again."
            );

            return;
        }
    }

    // Fallback for existing phone-based transfers
    const phone = new URLSearchParams(
        window.location.search
    ).get("phone");

    if (!phone) {
        recipientName.textContent = "No recipient selected";
        recipientInfo.textContent = "";
        return;
    }

    const headers = getAuthHeaders();

    if (!headers) return;

    try {
        const response = await fetch(
            `${API_URL}/transfer/recipient/${encodeURIComponent(phone)}`,
            {
                headers: headers
            }
        );

        if (handleUnauthorized(response)) return;

        if (!response.ok) {
            throw new Error("Recipient not found");
        }

        recipientData = await response.json();

        const fullName =
            recipientData.Name || "Unknown recipient";

        recipientName.textContent = maskName(fullName);

        recipientInfo.textContent =
            `NRIC/FIN · ${recipientData.NRIC || ""}`;

    } catch (error) {
        console.error("Recipient error:", error);

        recipientName.textContent = "Recipient not found";
        recipientInfo.textContent = "";

        showAppError(
            "Recipient unavailable",
            "Unable to retrieve the recipient details. Please check and try again."
        );
    }
}


// Load logged-in customer's sender account
async function loadSender() {
    const headers = getAuthHeaders();

    if (!headers) return;

    try {
        const response = await fetch(`${API_URL}/transfer/sender`, {
            cache: "no-store",
            headers: headers
        });

        if (handleUnauthorized(response)) return;

        if (!response.ok) {
            throw new Error("Unable to retrieve sender account");
        }

        senderData = await response.json();

        if (!senderData || !senderData.AccNo) {
            throw new Error("Sender account details are missing");
        }

        accountType.textContent =
            `${senderData.AccType} Account`;

        accountNumber.textContent =
            senderData.AccNo;

        senderBalance = Number(senderData.Balance);

    } catch (error) {
        console.error("Sender account error:", error);

        senderData = null;
        senderBalance = null;

        accountType.textContent = "Account unavailable";
        accountNumber.textContent = "";

        showAppError(
            "Account unavailable",
            "Unable to retrieve your sender account. Please try again later."
        );
    }
}


// Clear quick amount selection
function clearQuickSelection() {
    quickButtons.forEach(button =>
        button.classList.remove("selected")
    );

    quickHint.classList.add("hidden");
}


// Quick amount selection
quickButtons.forEach(button => {
    button.addEventListener("click", () => {
        const isSelected =
            button.classList.contains("selected");

        clearQuickSelection();

        moreAmounts.value = "";
        customKeypad.classList.add("hidden");

        if (isSelected) {
            enteredAmount = "";
            amountInput.value = "";

        } else {
            enteredAmount =
                Number(button.dataset.amount).toFixed(2);

            amountInput.value = enteredAmount;

            button.classList.add("selected");

            quickHint.classList.remove("hidden");
        }
    });
});


// Update amount display
function updateAmount() {
    amountInput.value = enteredAmount;

    keypadAmount.textContent =
        enteredAmount || "0.00";

    clearQuickSelection();

    moreAmounts.value = "";
}


// Open keypad
amountInput.addEventListener("click", () => {
    customKeypad.classList.remove("hidden");

    keypadAmount.textContent =
        enteredAmount || "0.00";
});


// Keypad number buttons
keypadButtons.forEach(button => {
    button.addEventListener("click", () => {
        const key = button.dataset.key;

        // Delete last digit
        if (key === "delete") {
            enteredAmount =
                enteredAmount.slice(0, -1);
        }

        // Decimal point
        else if (key === ".") {
            if (!enteredAmount.includes(".")) {
                enteredAmount =
                    enteredAmount || "0";

                enteredAmount += ".";
            }
        }

        // Number buttons
        else {
            const decimalPart =
                enteredAmount.split(".")[1];

            if (decimalPart && decimalPart.length >= 2) {
                return;
            }

            if (
                enteredAmount.replace(".", "").length >= 9
            ) {
                return;
            }

            enteredAmount += key;
        }

        updateAmount();
    });
});


// Done button
keypadDone.addEventListener("click", () => {

    if (enteredAmount.endsWith(".")) {
        enteredAmount = enteredAmount.slice(0, -1);
    }

    if (enteredAmount !== "") {
        enteredAmount =
            Number(enteredAmount).toFixed(2);
    }

    amountInput.value = enteredAmount;

    keypadAmount.textContent =
        enteredAmount || "0.00";

    customKeypad.classList.add("hidden");
});


// More amounts dropdown
moreAmounts.addEventListener("change", () => {

    // Cancel selection
    if (moreAmounts.value === "cancel") {
        enteredAmount = "";

        amountInput.value = "";
        keypadAmount.textContent = "0.00";

        moreAmounts.value = "";

        clearQuickSelection();

        customKeypad.classList.add("hidden");

        return;
    }

    // Select dropdown amount
    if (moreAmounts.value) {
        enteredAmount =
            Number(moreAmounts.value).toFixed(2);

        amountInput.value = enteredAmount;
        keypadAmount.textContent = enteredAmount;

        clearQuickSelection();

        customKeypad.classList.add("hidden");
    }
});


// Show / hide available balance
balanceButton.addEventListener("click", () => {
    const isHidden =
        availableBalance.classList.contains("hidden");

    if (isHidden && senderBalance !== null) {
        availableBalance.textContent =
            `${Number(senderBalance).toLocaleString("en-SG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })} SGD`;

        availableBalance.classList.remove("hidden");

        balanceButtonText.textContent =
            "Hide available balance";

    } else {
        availableBalance.classList.add("hidden");

        balanceButtonText.textContent =
            "Show available balance";
    }
});


// Go to Step 3 - Review Payment
nextButton.addEventListener("click", () => {

    const amount = Number(enteredAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
        showAppError(
            "Invalid amount",
            "Please enter a valid transfer amount."
        );
        return;
    }

    if (amount > 3000) {
        showAppError(
            "Transfer limit exceeded",
            "Your transfer exceeds the daily limit of SGD 3,000."
        );
        return;
    }

    if (!senderData || !senderData.AccNo) {
        showAppError(
            "Account unavailable",
            "Unable to retrieve your sender account. Please try again."
        );
        return;
    }

    if (!recipientData || !recipientData.id) {
        showAppError(
            "Recipient unavailable",
            "Unable to retrieve the recipient account. Please check the details."
        );
        return;
    }

    if (
        String(senderData.AccNo).trim() ===
        String(recipientData.id).trim()
    ) {
        showAppError(
            "Invalid recipient",
            "You cannot transfer money to your own account."
        );
        return;
    }

    if (
        senderBalance !== null &&
        amount > Number(senderBalance)
    ) {
        showAppError(
            "Insufficient balance",
            "You do not have enough available balance for this transfer."
        );
        return;
    }

    // Save transfer details for Step 3
    const transferDetails = {
        amount: amount.toFixed(2),
        senderAccNo: senderData.AccNo,
        senderName: senderData.Name || "",
        senderType: senderData.AccType,
        recipientAccNo: recipientData.id,
        recipientName: recipientName.textContent,
        recipientInfo: recipientInfo.textContent,
        recipientType: recipientData.recipientType,
        recipientIdentifier: recipientData.recipientIdentifier
    };

    sessionStorage.setItem(
        "paynowTransfer",
        JSON.stringify(transferDetails)
    );

    window.location.href = "paynowReview.html";
});


// Initial loading
if (!token) {
    sessionStorage.removeItem("userName");
    window.location.href = "login.html";
} else {
    loadRecipient();
    loadSender();
}
