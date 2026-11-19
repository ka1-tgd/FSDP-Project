const token = sessionStorage.getItem("token");
const authHeaders = { Authorization: `Bearer ${token}` };
// HTML elements
const recipientContent = document.getElementById("recipientContent");
const searchInput = document.getElementById("searchInput");
const tabs = document.querySelectorAll(".tab");
const paymentOptions = document.querySelectorAll(".payment-option");

let activeTab = "recent";
let recipients = [];
let requestId = 0;

// Load recipients from database
async function loadRecipients() {
    const currentRequest = ++requestId;

    const apiUrl = activeTab === "recent"
        ? "http://localhost:3000/api/paynow/recent"
        : "http://localhost:3000/api/paynow/contacts";

    recipientContent.textContent = "Loading recipients...";

    try {
        const response = await fetch(apiUrl, {
            cache: "no-store",
            headers: authHeaders
        });

        if (response.status === 401) {
            sessionStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load recipients");
        }

        const data = await response.json();

        if (currentRequest !== requestId) return;

        if (!Array.isArray(data)) {
            throw new Error("Invalid recipient data");
        }

        recipients = data;
        displayRecipients();

    } catch (error) {
        if (currentRequest !== requestId) return;

        console.error("PayNow error:", error);

        recipientContent.textContent =
            "Unable to load recipients. Please try again.";
    }
}

// Display recipient list
function displayRecipients() {
    recipientContent.innerHTML = "";

    if (recipients.length === 0) {
        showEmptyState();
        return;
    }

    recipients.forEach(function(person) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "contact-item";

        const avatar = document.createElement("div");
        avatar.className = "contact-avatar";
        avatar.textContent = String(person.name || "U")
            .charAt(0).toUpperCase();

        const info = document.createElement("div");
        info.className = "contact-info";

        const name = document.createElement("h4");
        name.textContent = person.name || "Unknown recipient";

        const details = document.createElement("p");

        // Show actual identifier, not NRIC/UEN labels
        details.textContent =
            person.phone || person.recipientIdentifier || "";

        info.append(name, details);
        item.append(avatar, info);

        item.addEventListener("click", function() {
            selectRecipient(person);
        });

        recipientContent.appendChild(item);
    });
}

// Display default empty state
function showEmptyState() {
    recipientContent.innerHTML = "";

    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const title = document.createElement("p");
    title.className = "empty-title";

    const subtitle = document.createElement("p");
    subtitle.className = "empty-subtitle";

    if (activeTab === "recent") {
        const image = document.createElement("img");
        image.src = "../images/paynow-no-recent-icon.png";
        image.alt = "";
        image.className = "empty-state-icon";
        emptyState.appendChild(image);

        title.textContent = "No recent PayNow transfers";
        subtitle.textContent =
            "Your 10 most recent payees will be shown here.";
    } else {
        title.textContent = "No saved contacts";
        subtitle.textContent =
            "Your saved PayNow contacts will appear here.";
    }

    emptyState.append(title, subtitle);
    recipientContent.appendChild(emptyState);
}

// Save selected recipient and continue
function selectRecipient(person) {
    const selectedRecipient = {
        id: person.id,
        name: person.name,
        phone: person.phone || "",
        recipientType: person.recipientType,
        recipientIdentifier: person.recipientIdentifier,
        source: activeTab
    };

    sessionStorage.setItem(
        "paynowRecipient",
        JSON.stringify(selectedRecipient)
    );

    const phone = String(person.phone || "")
        .replace(/\D/g, "")
        .slice(-8);

    if (phone.length === 8) {
        window.location.href =
            "transferamount.html?phone=" +
            encodeURIComponent(phone);
    } else {
        window.location.href = "transferamount.html";
    }
}

// Switch Recent and Contacts
tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
        tabs.forEach(function(item) {
            item.classList.remove("active");
        });

        tab.classList.add("active");
        activeTab = tab.dataset.tab;

        loadRecipients();
    });
});

// Open dedicated search page
searchInput.addEventListener("click", function() {
    window.location.href = "paynowSearch.html?mode=contacts";
});

// Open NRIC or UEN search page
paymentOptions.forEach(function(button) {
    button.addEventListener("click", function() {
        const mode = button.dataset.type;

        window.location.href =
            "paynowSearch.html?mode=" +
            encodeURIComponent(mode);
    });
});

// Refresh Recent after returning from another page
window.addEventListener("pageshow", function(event) {
    if (event.persisted) {
        loadRecipients();
    }
});

// Initial load
loadRecipients();
