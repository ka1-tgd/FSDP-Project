const token = sessionStorage.getItem("token");

// Not logged in: go to the login page
if (!token) {
    window.location.href = "login.html";
}

const authHeaders = { Authorization: `Bearer ${token}` };

// HTML elements
const accountType = document.getElementById("accountType");
const accountNumber = document.getElementById("accountNumber");
const accountBalance = document.getElementById("accountBalance");
const transactionList = document.getElementById("transactionList");
const logoutButton = document.querySelector(".logout-link");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMoney(value) {
    return Number(value).toLocaleString("en-SG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// The database time has no timezone, so read it as stored (UTC getters)
function formatDate(value) {
    const date = new Date(value);
    return date.getUTCDate() + " " +
        MONTHS[date.getUTCMonth()] + " " +
        date.getUTCFullYear();
}

// Load home data from the backend
async function loadHome() {
    try {
        const response = await fetch("/api/home", {
            cache: "no-store",
            headers: authHeaders
        });

        // Token missing or expired: back to login
        if (response.status === 401) {
            sessionStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load home data");
        }

        const data = await response.json();

        displayAccount(data.accounts);
        displayTransactions(data.transactions);

    } catch (error) {
        console.error("Home error:", error);

        accountType.textContent = "Account unavailable";
        transactionList.textContent =
            "Unable to load transactions. Please try again.";
    }
}

// Savings account card (shows the first account)
function displayAccount(accounts) {
    if (!Array.isArray(accounts) || accounts.length === 0) {
        accountType.textContent = "No account found";
        return;
    }

    const account = accounts[0];

    accountType.textContent = account.AccType + " Account";
    accountNumber.textContent = account.AccNo;
    accountBalance.textContent = "SGD " + formatMoney(account.Balance);
}

// Recent transactions list
function displayTransactions(transactions) {
    transactionList.innerHTML = "";

    if (!Array.isArray(transactions) || transactions.length === 0) {
        transactionList.textContent = "No recent transactions.";
        return;
    }

    transactions.forEach(function(item) {
        const isOut = item.Direction === "out";

        const row = document.createElement("button");
        row.type = "button";
        row.className = "transaction-row";

        const icon = document.createElement("img");
        icon.src = "../images/john.png";
        icon.alt = "";
        icon.className = "transaction-icon";

        const info = document.createElement("div");
        info.className = "transaction-info";

        const name = document.createElement("h4");
        name.textContent = item.CounterpartyName || "Unknown";

        const date = document.createElement("p");
        date.textContent = formatDate(item.TransDateTime);

        info.append(name, date);

        const amount = document.createElement("span");
        amount.className = "amount " + (isOut ? "negative" : "positive");
        amount.textContent =
            (isOut ? "-" : "+") + "$" + formatMoney(item.Amount);

        const chevron = document.createElement("span");
        chevron.className = "chevron";
        chevron.innerHTML = "&#8250;";

        row.append(icon, info, amount, chevron);
        transactionList.appendChild(row);
    });
}

// Log out
logoutButton.addEventListener("click", function() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userName");
    window.location.href = "login.html";
});

// Initial load
loadHome();