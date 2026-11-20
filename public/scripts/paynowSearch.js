
const API_URL = "http://localhost:3000/api";

/* ========================================
   Language Settings
   ======================================== */

const searchTranslations = {
    en: {
        nric: "Search by NRIC/FIN",
        uen: "Search by UEN/VPA",
        contacts: "Search by name or mobile number",
        cancel: "Cancel",
        searchRecipient: "Search recipient",
        noResults: "No recipients found.",
        searching: "Searching...",
        loadError: "Unable to load contacts. Please try again.",
        searchError: "Unable to search. Please try again.",
        unknown: "Unknown recipient",
        title: "OCBC PayNow - Search Recipient"
    },
    zh: {
        nric: "通过身份证／FIN 搜索",
        uen: "通过 UEN/VPA 搜索",
        contacts: "通过姓名或手机号码搜索",
        cancel: "取消",
        searchRecipient: "搜索收款人",
        noResults: "找不到收款人。",
        searching: "正在搜索……",
        loadError: "无法加载联系人，请重试。",
        searchError: "搜索失败，请重试。",
        unknown: "未知收款人",
        title: "OCBC PayNow - 搜索收款人"
    },
    ms: {
        nric: "Cari melalui NRIC/FIN",
        uen: "Cari melalui UEN/VPA",
        contacts: "Cari mengikut nama atau nombor telefon",
        cancel: "Batal",
        searchRecipient: "Cari penerima",
        noResults: "Tiada penerima ditemui.",
        searching: "Sedang mencari...",
        loadError: "Tidak dapat memuatkan kenalan. Sila cuba lagi.",
        searchError: "Carian gagal. Sila cuba lagi.",
        unknown: "Penerima tidak diketahui",
        title: "OCBC PayNow - Cari Penerima"
    },
    ta: {
        nric: "NRIC/FIN மூலம் தேடவும்",
        uen: "UEN/VPA மூலம் தேடவும்",
        contacts: "பெயர் அல்லது கைபேசி எண் மூலம் தேடவும்",
        cancel: "ரத்துசெய்",
        searchRecipient: "பெறுநரைத் தேடவும்",
        noResults: "பெறுநர்கள் யாரும் கிடைக்கவில்லை.",
        searching: "தேடுகிறது...",
        loadError: "தொடர்புகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        searchError: "தேட முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        unknown: "தெரியாத பெறுநர்",
        title: "OCBC PayNow - பெறுநரைத் தேடவும்"
    }
};

const preferredSearchLanguage =
    localStorage.getItem("preferredLanguage") || "en";

const currentSearchLanguage =
    searchTranslations[preferredSearchLanguage]
        ? preferredSearchLanguage
        : "en";

const searchText = searchTranslations[currentSearchLanguage];

function t(key) {
    return searchText[key] || searchTranslations.en[key] || key;
}

document.documentElement.lang = currentSearchLanguage;
document.title = t("title");

/* ========================================
   Search Elements
   ======================================== */

const searchInput = document.getElementById("recipientSearchInput");
const searchResults = document.getElementById("searchResults");
const cancelButton = document.querySelector(".search-cancel");

const searchMode = new URLSearchParams(window.location.search)
    .get("mode");

const mode = ["nric", "uen", "contacts"].includes(searchMode)
    ? searchMode
    : "contacts";

let savedContacts = [];
let searchRequestId = 0;

const placeholders = {
    nric: t("nric"),
    uen: t("uen"),
    contacts: t("contacts")
};

searchInput.placeholder = placeholders[mode];
searchInput.setAttribute("aria-label", t("searchRecipient"));

if (cancelButton) {
    cancelButton.textContent = t("cancel");
}

/* ========================================
   Authentication
   ======================================== */

function getAuthHeaders() {
    const token = sessionStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return null;
    }

    return {
        "Authorization": `Bearer ${token}`
    };
}

function handleUnauthorized(response) {
    if (response.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userName");

        window.location.href = "login.html";
        return true;
    }

    return false;
}

/* ========================================
   Search Messages
   ======================================== */

function showMessage(message) {
    searchResults.innerHTML = "";

    const text = document.createElement("p");
    text.className = "search-message";
    text.textContent = message;

    searchResults.appendChild(text);
}

/* ========================================
   Display Results
   ======================================== */

function displayResults(people) {
    searchResults.innerHTML = "";

    if (people.length === 0) {
        showMessage(t("noResults"));
        return;
    }

    people.forEach(function(person) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "search-result-item";

        const avatar = document.createElement("div");
        avatar.className = "search-result-avatar";

        avatar.textContent = String(person.name || "U")
            .charAt(0)
            .toUpperCase();

        const info = document.createElement("div");
        info.className = "search-result-info";

        const name = document.createElement("h4");
        name.textContent = person.name || t("unknown");

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

/* ========================================
   Select Recipient
   ======================================== */

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

/* ========================================
   Load Saved Contacts
   ======================================== */

async function loadSavedContacts() {
    const headers = getAuthHeaders();

    if (!headers) return;

    try {
        const response = await fetch(`${API_URL}/paynow/contacts`, {
            method: "GET",
            cache: "no-store",
            headers: headers
        });

        if (handleUnauthorized(response)) return;

        if (!response.ok) {
            throw new Error("Unable to load contacts");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid contacts response");
        }

        savedContacts = data;

        const keyword = searchInput.value.trim().toLowerCase();

        if (keyword) {
            const filtered = savedContacts.filter(function(person) {
                const name = String(person.name || "").toLowerCase();

                const identifier = String(
                    person.recipientIdentifier || ""
                ).toLowerCase();

                const phone = String(person.phone || "");

                return name.includes(keyword) ||
                       identifier.includes(keyword) ||
                       phone.includes(keyword);
            });

            displayResults(filtered);
        }

    } catch (error) {
        console.error("Search contacts error:", error);
        showMessage(t("loadError"));
    }
}

/* ========================================
   Search Database
   ======================================== */

async function searchDatabase(value) {
    const currentRequest = ++searchRequestId;

    if (!value) {
        searchResults.innerHTML = "";
        return;
    }

    const headers = getAuthHeaders();

    if (!headers) return;

    const endpoint = mode === "nric"
        ? "/paynow/search/nric"
        : "/paynow/search/uen";

    showMessage(t("searching"));

    try {
        const response = await fetch(
            `${API_URL}${endpoint}?value=${encodeURIComponent(value)}`,
            {
                method: "GET",
                cache: "no-store",
                headers: headers
            }
        );

        if (handleUnauthorized(response)) return;

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
        showMessage(t("searchError"));
    }
}

/* ========================================
   Search Input
   ======================================== */

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

            const phone = String(person.phone || "");

            return name.includes(keyword) ||
                   identifier.includes(keyword) ||
                   phone.includes(keyword);
        });

        displayResults(filtered);
        return;
    }

    if (!value) {
        searchRequestId++;
        searchResults.innerHTML = "";
        return;
    }

    if (
        mode === "nric" &&
        !/^[A-Za-z][0-9]{7}[A-Za-z]$/.test(value)
    ) {
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

/* ========================================
   Initialization
   ======================================== */

if (mode === "contacts") {
    loadSavedContacts();
}
