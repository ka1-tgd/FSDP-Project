
// HTML elements
const recipientContent = document.getElementById("recipientContent");
const searchInput = document.getElementById("searchInput");
const tabs = document.querySelectorAll(".tab");
const paymentOptions = document.querySelectorAll(".payment-option");

let activeTab = "recent";
let recipients = [];
let requestId = 0;


// Load recipients
async function loadRecipients() {
    const currentRequest = ++requestId;

    // Recent tab: Hardcoded empty state
    if (activeTab === "recent") {
        recipients = [];
        displayRecipients();
        return;
    }

    // Contacts tab: Retrieve contacts from database
    recipientContent.textContent = "Loading contacts...";

    try {
        const response = await fetch("/api/paynow/contacts");

        if (!response.ok) {
            throw new Error("Failed to load contacts");
        }

        const data = await response.json();

        if (currentRequest !== requestId) return;

        if (!Array.isArray(data)) {
            throw new Error("Invalid contact data");
        }

        recipients = data;
        displayRecipients();

    } catch (error) {
        if (currentRequest !== requestId) return;

        console.error("Contacts error:", error);

        recipientContent.textContent =
            "Unable to load contacts. Please try again.";
    }
}


// Display recipients and filter search
function displayRecipients() {
    recipientContent.innerHTML = "";

    const keyword = searchInput.value.trim().toLowerCase();

    const filtered = recipients.filter(function(person) {
        const name = String(person.name || "").toLowerCase();
        const phone = String(person.phone || "").toLowerCase();

        return name.includes(keyword) || phone.includes(keyword);
    });

    // Empty state
    if (filtered.length === 0) {
        const noRecent = activeTab === "recent" && keyword === "";

        recipientContent.innerHTML = `
            <div class="empty-state">
                ${noRecent ? `
                    <img
                        src="../images/paynow-no-recent-icon.png"
                        alt=""
                        class="empty-state-icon">
                ` : ""}

                <p class="empty-title">
                    ${noRecent
                        ? "No recent PayNow transfers"
                        : "No recipients found"}
                </p>

                <p class="empty-subtitle">
                    ${noRecent
                        ? "Your 10 most recent payees will be shown here."
                        : "Try searching for another recipient"}
                </p>
            </div>
        `;
        return;
    }

    // Display contact list
    filtered.forEach(function(person) {
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

        const phone = document.createElement("p");
        phone.textContent = person.phone || "";

        info.append(name, phone);
        item.append(avatar, info);

        // Continue to Step 2
        item.addEventListener("click", function() {
            sessionStorage.setItem(
                "paynowRecipient",
                JSON.stringify(person)
            );

            window.location.href = "transferamount.html";
        });

        recipientContent.appendChild(item);
    });
}


// Switch Recent / Contacts tabs
tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
        tabs.forEach(function(item) {
            item.classList.remove("active");
        });

        tab.classList.add("active");
        activeTab = tab.dataset.tab;
        searchInput.value = "";

        loadRecipients();
    });
});


// Search by name or phone
searchInput.addEventListener("input", displayRecipients);


// NRIC/FIN and UEN/VPA buttons
paymentOptions.forEach(function(button) {
    button.addEventListener("click", function() {
        paymentOptions.forEach(function(item) {
            item.classList.remove("active");
        });

        button.classList.add("active");
    });
});


// Ask OCBC chatbot
document.getElementById("askBtn").addEventListener("click", function() {
    if (typeof openChatbot === "function") {
        openChatbot();
    } else {
        alert("Ask OCBC chatbot will be connected later.");
    }
});


// Need Help
document.getElementById("helpBtn").addEventListener("click", function() {
    alert("Help and Support will be connected later.");
});


// Back button
document.getElementById("backButton").addEventListener("click", function() {
    window.history.back();
});


// Initial load
loadRecipients();
