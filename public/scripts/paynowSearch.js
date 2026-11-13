
// Search elements
const searchInput = document.getElementById("recipientSearchInput");
const searchResults = document.getElementById("searchResults");
const searchMode = new URLSearchParams(window.location.search)
    .get("mode");

const mode = ["nric", "uen", "contacts"].includes(searchMode)
    ? searchMode
    : "contacts";

let savedContacts = [];
let searchRequestId = 0;

// Set search placeholder
const placeholders = {
    nric: "Search by NRIC/FIN",
    uen: "Search by UEN/VPA",
    contacts: "Search by name or mobile number"
};

searchInput.placeholder = placeholders[mode];

// Display search message
function showMessage(message) {
    searchResults.innerHTML = "";

    const text = document.createElement("p");
    text.className = "search-message";
    text.textContent = message;

    searchResults.appendChild(text);
}

// Display search results
function displayResults(people) {
    searchResults.innerHTML = "";

    if (people.length === 0) {
        showMessage("No recipients found.");
        return;
    }

    people.forEach(function(person) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "search-result-item";

        const avatar = document.createElement("div");
        avatar.className = "search-result-avatar";
        avatar.textContent = String(person.name || "U")
            .charAt(0).toUpperCase();

        const info = document.createElement("div");
        info.className = "search-result-info";

        const name = document.createElement("h4");
        name.textContent = person.name || "Unknown recipient";

        const details = document.createElement("p");
        details.textContent =
            person.phone || person.recipientIdentifier || "";

        info.append(name, details);
        item.append(avatar, info);

        item.addEventListener("click", function() {
            selectRecipient(person);
        });

        searchResults.appendChild(item);
    });
}

// Save recipient for Step 2
function selectRecipient(person) {
    const selected = {
        id: person.id,
        name: person.name,
        phone: person.phone || "",
        recipientType: person.recipientType,
        recipientIdentifier: person.recipientIdentifier,
        source: mode
    };

    sessionStorage.setItem(
        "paynowRecipient",
        JSON.stringify(selected)
    );

    const phone = String(selected.phone)
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

// Load saved contacts for contact search
async function loadSavedContacts() {
    try {
        const response = await fetch("/api/paynow/contacts", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Unable to load contacts");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid contacts response");
        }

        savedContacts = data;

    } catch (error) {
        console.error("Search contacts error:", error);
        showMessage("Unable to load contacts. Please try again.");
    }
}

// Search database by exact NRIC or UEN
async function searchDatabase(value) {
    const currentRequest = ++searchRequestId;

    if (!value) {
        searchResults.innerHTML = "";
        return;
    }

    const endpoint = mode === "nric"
        ? "/api/paynow/search/nric"
        : "/api/paynow/search/uen";

    showMessage("Searching...");

    try {
        const response = await fetch(
            endpoint + "?value=" + encodeURIComponent(value),
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Search request failed");
        }

        const data = await response.json();

        if (currentRequest !== searchRequestId) return;

        if (!Array.isArray(data)) {
            throw new Error("Invalid search response");
        }

        displayResults(data);

    } catch (error) {
        if (currentRequest !== searchRequestId) return;

        console.error("Recipient search error:", error);
        showMessage("Unable to search. Please try again.");
    }
}

// Handle search input
searchInput.addEventListener("input", function() {
    const value = searchInput.value.trim();
    const keyword = value.toLowerCase();

    if (mode === "contacts") {
        if (!keyword) {
            searchResults.innerHTML = "";
            return;
        }

        const filtered = savedContacts.filter(function(person) {
            const name = String(person.name || "").toLowerCase();
            const identifier = String(
                person.recipientIdentifier || ""
            ).toLowerCase();

            return name.includes(keyword) ||
                   identifier.includes(keyword);
        });

        displayResults(filtered);
        return;
    }

    if (!value) {
        searchRequestId++;
        searchResults.innerHTML = "";
        return;
    }

    // Search only when an identifier has been fully entered
    if (mode === "nric" && !/^[A-Za-z][0-9]{7}[A-Za-z]$/.test(value)) {
        searchRequestId++;
        searchResults.innerHTML = "";
        return;
    }

    if (mode === "uen" && value.length < 9) {
        searchRequestId++;
        searchResults.innerHTML = "";
        return;
    }

    searchDatabase(value.toUpperCase());
});

// Load contacts when needed
if (mode === "contacts") {
    loadSavedContacts();
}
