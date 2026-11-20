
(function () {
    "use strict";

    const translations = {
        en: {
            goBack: "Go back",
            step: "Step 1 of 4",
            chooseRecipient: "Choose who to pay",
            showGuidance: "Show guidance",
            whoToPay: "Who are you sending to?",
            searchPlaceholder: "Search by name or mobile number",
            openSearch: "Open recipient search",
            recent: "Recent",
            contacts: "Contacts",
            noRecent: "No recent PayNow transfers",
            recentDescription: "Your 10 most recent payees will be shown here.",
            noContacts: "No saved contacts",
            contactsDescription: "Your saved PayNow contacts will appear here.",
            loading: "Loading recipients...",
            loadError: "Unable to load recipients. Please try again.",
            unknownRecipient: "Unknown recipient"
        },

        zh: {
            goBack: "返回",
            step: "第 1 步，共 4 步",
            chooseRecipient: "选择收款人",
            showGuidance: "显示操作指引",
            whoToPay: "你要转账给谁？",
            searchPlaceholder: "按姓名或手机号码搜索",
            openSearch: "打开收款人搜索",
            recent: "最近",
            contacts: "联系人",
            noRecent: "暂无最近的 PayNow 转账",
            recentDescription: "这里将显示你最近的 10 位收款人。",
            noContacts: "暂无已保存的联系人",
            contactsDescription: "你保存的 PayNow 联系人将显示在这里。",
            loading: "正在加载收款人...",
            loadError: "无法加载收款人，请重试。",
            unknownRecipient: "未知收款人"
        },

        ms: {
            goBack: "Kembali",
            step: "Langkah 1 daripada 4",
            chooseRecipient: "Pilih penerima bayaran",
            showGuidance: "Tunjukkan panduan",
            whoToPay: "Kepada siapa anda ingin menghantar wang?",
            searchPlaceholder: "Cari mengikut nama atau nombor telefon",
            openSearch: "Buka carian penerima",
            recent: "Terkini",
            contacts: "Kenalan",
            noRecent: "Tiada pindahan PayNow terkini",
            recentDescription: "10 penerima bayaran terkini anda akan dipaparkan di sini.",
            noContacts: "Tiada kenalan disimpan",
            contactsDescription: "Kenalan PayNow anda yang disimpan akan dipaparkan di sini.",
            loading: "Memuatkan penerima...",
            loadError: "Tidak dapat memuatkan penerima. Sila cuba lagi.",
            unknownRecipient: "Penerima tidak diketahui"
        },

        ta: {
            goBack: "திரும்பிச் செல்",
            step: "படி 1 / 4",
            chooseRecipient: "பணம் பெறுபவரைத் தேர்ந்தெடுக்கவும்",
            showGuidance: "வழிகாட்டுதலைக் காட்டு",
            whoToPay: "யாருக்குப் பணம் அனுப்ப விரும்புகிறீர்கள்?",
            searchPlaceholder: "பெயர் அல்லது கைபேசி எண்ணால் தேடுங்கள்",
            openSearch: "பெறுநர் தேடலைத் திறக்கவும்",
            recent: "சமீபத்தியவை",
            contacts: "தொடர்புகள்",
            noRecent: "சமீபத்திய PayNow பரிமாற்றங்கள் இல்லை",
            recentDescription: "சமீபத்திய 10 பணம் பெறுநர்கள் இங்கே காட்டப்படுவார்கள்.",
            noContacts: "சேமிக்கப்பட்ட தொடர்புகள் இல்லை",
            contactsDescription: "சேமிக்கப்பட்ட PayNow தொடர்புகள் இங்கே தோன்றும்.",
            loading: "பெறுநர்களை ஏற்றுகிறது...",
            loadError: "பெறுநர்களை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
            unknownRecipient: "தெரியாத பெறுநர்"
        }
    };

    const supportedLanguages = ["en", "zh", "ms", "ta"];

    function getLanguage() {
        const savedLanguage = localStorage.getItem("preferredLanguage");

        return supportedLanguages.includes(savedLanguage)
            ? savedLanguage
            : "en";
    }

    function t(key) {
        const language = getLanguage();

        return translations[language][key]
            || translations.en[key]
            || key;
    }

    function translatePage() {
        document.documentElement.lang = getLanguage();

        // Translate visible text
        document.querySelectorAll("[data-i18n]").forEach(function (element) {
            const key = element.getAttribute("data-i18n");
            element.textContent = t(key);
        });

        // Translate placeholders
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
            const key = element.getAttribute("data-i18n-placeholder");
            element.placeholder = t(key);
        });

        // Translate accessibility labels
        document.querySelectorAll("[data-i18n-aria]").forEach(function (element) {
            const key = element.getAttribute("data-i18n-aria");
            element.setAttribute("aria-label", t(key));
        });
    }

    // Make translations available to paynow_sent.js
    window.paynowStep1I18n = {
        t: t,
        getLanguage: getLanguage,
        translate: translatePage
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", translatePage);
    } else {
        translatePage();
    }
})();
