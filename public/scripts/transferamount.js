/* =====================================
  PAYNOW PAGE DATA
===================================== */
// Temporary data for frontend testing.
// The API will replace this data when the backend is ready.
const DEMO_DATA = {
   sender: {
       name: "John Tan",
       phoneNo: "12345678",
       accountNo: "111-1-111111",
       accountType: "Savings",
       balance: 3100.00,
       dailyLimitRemaining: 3000.00
   },
   recipient: {
       name: "Alex Tan",
       phoneNo: "87872341",
       displayInfo: "+6587872341 • AIXX TAX"
   }
};

// Store application data
let sender = null;
let recipient = null;
let selectedAmount = 0;
let isBalanceVisible = false;

/* =====================================
  INITIALISE PAGE
===================================== */
async function initialisePage() {
   try {
       // Try retrieving information from backend
       const response = await fetch("/api/paynow/context");
       if (!response.ok) {
           throw new Error("Unable to retrieve account information");
       }
       const data = await response.json();
       sender = data.sender;
       recipient = data.recipient;
   } catch (error) {
       // Use temporary data if backend is unavailable
       console.log("Using temporary demo data:", error.message);
       sender = { ...DEMO_DATA.sender };
       recipient = { ...DEMO_DATA.recipient };
   }
   displayAccountDetails();
   displayRecipientDetails();
   displayDailyLimit();
}

/* =====================================
  DISPLAY RECIPIENT DETAILS
===================================== */
function displayRecipientDetails() {
   document.getElementById("recipientName").textContent =
       recipient.name;
   document.getElementById("recipientInfo").textContent =
       recipient.displayInfo ||
       "+65" + recipient.phoneNo;
}

/* =====================================
  DISPLAY SENDER ACCOUNT DETAILS
===================================== */
function displayAccountDetails() {
   document.getElementById("accountType").textContent =
       sender.accountType + " Account";
   document.getElementById("accountNumber").textContent =
       sender.accountNo;
}

/* =====================================
  DISPLAY DAILY TRANSFER LIMIT
===================================== */
function displayDailyLimit() {
   document.getElementById("dailyLimit").textContent =
       Number(sender.dailyLimitRemaining).toLocaleString(
           "en-SG",
           {
               minimumFractionDigits: 2,
               maximumFractionDigits: 2
           }
       ) + " SGD";
}

/* =====================================
  FORMAT AMOUNT
===================================== */
function formatAmount(amount) {
   return Number(amount).toLocaleString("en-SG", {
       minimumFractionDigits: 2,
       maximumFractionDigits: 2
   });
}

/* =====================================
  QUICK AMOUNT BUTTONS
===================================== */
const quickButtons = document.querySelectorAll(
   ".quick-amounts button"
);
const amountInput = document.getElementById("amountInput");
const quickHint = document.getElementById("quickHint");

quickButtons.forEach(function(button) {
   button.addEventListener("click", function() {
       const amount = Number(this.dataset.amount);
       // Check if the same amount was selected
       if (
           this.classList.contains("selected") &&
           selectedAmount === amount
       ) {
           // Remove selected amount
           selectedAmount = 0;
           amountInput.value = "";
           this.classList.remove("selected");
           quickHint.classList.add("hidden");
           return;
       }
       // Remove previous selection
       clearQuickSelection();
       // Set new selected amount
       selectedAmount = amount;
       amountInput.value = amount.toFixed(2);
       this.classList.add("selected");
       quickHint.classList.remove("hidden");
   });
});

/* =====================================
  CLEAR QUICK AMOUNT SELECTION
===================================== */
function clearQuickSelection() {
   quickButtons.forEach(function(button) {
       button.classList.remove("selected");
   });
   quickHint.classList.add("hidden");
}

/* =====================================
  CUSTOM AMOUNT INPUT
===================================== */
amountInput.addEventListener("input", function() {
   selectedAmount = Number(this.value) || 0;
   // Remove quick amount selection
   clearQuickSelection();
   // Reset dropdown selection
   document.getElementById("moreAmounts").value = "";
});

/* =====================================
  MORE AMOUNTS DROPDOWN
===================================== */
const moreAmounts = document.getElementById("moreAmounts");
moreAmounts.addEventListener("change", function() {
   const amount = Number(this.value);
   if (!amount) {
       return;
   }
   // Clear previous quick amount selection
   clearQuickSelection();
   // Set selected amount
   selectedAmount = amount;
   amountInput.value = amount.toFixed(2);
});

/* =====================================
  SHOW / HIDE AVAILABLE BALANCE
===================================== */
const balanceButton = document.getElementById("balanceButton");
const availableBalance = document.getElementById(
   "availableBalance"
);
balanceButton.addEventListener("click", function() {
   isBalanceVisible = !isBalanceVisible;
   if (isBalanceVisible) {
       availableBalance.textContent =
           "Available balance: S$" +
           formatAmount(sender.balance);
       availableBalance.classList.remove("hidden");
       balanceButton.innerHTML =
           '<span class="eye-icon">◎</span> Hide available balance';
   } else {
       availableBalance.classList.add("hidden");
       balanceButton.innerHTML =
           '<span class="eye-icon">◎</span> Show available balance';
   }
});

/* =====================================
  VALIDATE TRANSFER AMOUNT
===================================== */
function validateAmount() {
   const errorMessage = document.getElementById(
       "errorMessage"
   );
   errorMessage.textContent = "";
   const inputValue = amountInput.value.trim();
   const amount = Number(inputValue);
   // Check empty amount
   if (inputValue === "") {
       errorMessage.textContent =
           "Please enter an amount.";
       return false;
   }
   // Check valid amount format
   if (
       !/^\d+(\.\d{1,2})?$/.test(inputValue) ||
       !Number.isFinite(amount) ||
       amount <= 0
   ) {
       errorMessage.textContent =
           "Please enter a valid amount.";
       return false;
   }
   // Check available balance
   if (amount > sender.balance) {
       errorMessage.textContent =
           "Insufficient available balance.";
       return false;
   }
   // Check daily transfer limit
   if (amount > sender.dailyLimitRemaining) {
       errorMessage.textContent =
           "You have exceeded your daily transfer limit.";
       return false;
   }
   return true;
}

/* =====================================
  NEXT BUTTON
===================================== */
document.getElementById("nextButton").addEventListener(
   "click",
   function() {
       if (!validateAmount()) {
           return;
       }
       selectedAmount = Number(amountInput.value);
       // Prepare transfer details for the next page
       const transferDetails = {
           sender: {
               name: sender.name,
               accountNo: sender.accountNo,
               accountType: sender.accountType
           },
           recipient: {
               name: recipient.name,
               phoneNo: recipient.phoneNo,
               displayInfo: recipient.displayInfo
           },
           amount: selectedAmount,
           description: "",
           currency: "SGD"
       };
       // Save transfer details for friend's confirmation page
       sessionStorage.setItem(
           "payNowTransferDraft",
           JSON.stringify(transferDetails)
       );
       // Notify other frontend components
       window.dispatchEvent(
           new CustomEvent("paynow:continue", {
               detail: transferDetails
           })
       );
       console.log(
           "Transfer details ready:",
           transferDetails
       );
       alert("Transfer details are ready for the confirmation page.");
   }
);

/* =====================================
  BACK BUTTON
===================================== */
document.getElementById("backButton").addEventListener(
   "click",
   function() {
       // Return to previous recipient selection page
       // Change this filename when integrating with
       // your friend's recipient selection page.
       window.location.href = "recipient.html";
   }
);

/* =====================================
  START APPLICATION
===================================== */
initialisePage();