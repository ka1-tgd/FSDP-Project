
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const changeButton = document.getElementById("change-language-btn");
    const modal = document.getElementById("language-modal");
    const closeButton = document.getElementById("close-language-modal");
    const confirmButton = document.getElementById("confirm-language");
    const languageOptions = document.querySelectorAll('input[name="language"]');

    if (!changeButton || !modal || !closeButton || !confirmButton) {
        console.warn("Language Selection elements not found.");
        return;
    }

    const translations = {
        en: {
            more: "More",
            logout: "Logout",
            newFeatures: "New features for you",
            savingsGoals: "SAVINGS GOALS",
            viewGoals: "View/manage goals",
            moneyInsights: "MONEY INSIGHTS",
            takeControl: "Take control",
            apply: "Apply",
            accounts: "Accounts",
            cards: "Cards",
            investments: "Investments",
            insurance: "Insurance",
            loans: "Loans",
            services: "Services",
            cardServices: "Card services",
            manageCards: "Manage cards",
            cardActivation: "Card activation",
            cardReplacement: "Card replacement",
            documents: "Documents - Statements & Letters",
            accountStatements: "Account statements",
            bankLetters: "Bank letters",
            investmentServices: "Investment services",
            investmentPortfolio: "Investment portfolio",
            unitTrusts: "Unit trusts",
            payments: "Payments & transfers",
            transferHistory: "Transfer history",
            managePayees: "Manage payees",
            paymentSettings: "Payment settings",
            profile: "Profile & app settings",
            personalDetails: "Update personal details",
            loginDetails: "Manage login details",
            oneToken: "Manage OCBC OneToken",
            textSize: "Change text size",
            appTheme: "Change app theme",
            notifications: "Manage notifications",
            oneView: "Manage Your Financial OneView",
            mailbox: "Secured mailbox",
            changeLanguage: "Change language",
            quickSync: "Quick Sync",
            needHelp: "Need more help?",
            hotline: "Hotline",
            home: "Home",
            plan: "Plan",
            payTransfer: "Pay & Transfer",
            rewards: "Rewards",
            selectLanguage: "Select Language",
            chooseLanguage: "Choose your preferred language.",
            confirmLanguage: "Confirm Language"
        },

        zh: {
            more: "更多",
            logout: "登出",
            newFeatures: "为您推荐的新功能",
            savingsGoals: "储蓄目标",
            viewGoals: "查看／管理目标",
            moneyInsights: "财务分析",
            takeControl: "掌握财务状况",
            apply: "申请",
            accounts: "账户",
            cards: "银行卡",
            investments: "投资",
            insurance: "保险",
            loans: "贷款",
            services: "服务",
            cardServices: "银行卡服务",
            manageCards: "管理银行卡",
            cardActivation: "激活银行卡",
            cardReplacement: "更换银行卡",
            documents: "文件、账单与信件",
            accountStatements: "账户结单",
            bankLetters: "银行信件",
            investmentServices: "投资服务",
            investmentPortfolio: "投资组合",
            unitTrusts: "单位信托",
            payments: "付款与转账",
            transferHistory: "转账记录",
            managePayees: "管理收款人",
            paymentSettings: "付款设置",
            profile: "个人资料与应用设置",
            personalDetails: "更新个人资料",
            loginDetails: "管理登录资料",
            oneToken: "管理 OCBC OneToken",
            textSize: "更改字体大小",
            appTheme: "更改应用主题",
            notifications: "管理通知",
            oneView: "管理财务总览",
            mailbox: "安全信箱",
            changeLanguage: "更改语言",
            quickSync: "快速同步",
            needHelp: "需要更多帮助？",
            hotline: "服务热线",
            home: "首页",
            plan: "规划",
            payTransfer: "付款与转账",
            rewards: "奖励",
            selectLanguage: "选择语言",
            chooseLanguage: "请选择您偏好的语言。",
            confirmLanguage: "确认语言"
        },

        ms: {
            more: "Lagi",
            logout: "Log keluar",
            newFeatures: "Ciri baharu untuk anda",
            savingsGoals: "MATLAMAT SIMPANAN",
            viewGoals: "Lihat/urus matlamat",
            moneyInsights: "ANALISIS KEWANGAN",
            takeControl: "Urus kewangan anda",
            apply: "Permohonan",
            accounts: "Akaun",
            cards: "Kad",
            investments: "Pelaburan",
            insurance: "Insurans",
            loans: "Pinjaman",
            services: "Perkhidmatan",
            cardServices: "Perkhidmatan kad",
            manageCards: "Urus kad",
            cardActivation: "Aktifkan kad",
            cardReplacement: "Ganti kad",
            documents: "Dokumen, penyata dan surat",
            accountStatements: "Penyata akaun",
            bankLetters: "Surat bank",
            investmentServices: "Perkhidmatan pelaburan",
            investmentPortfolio: "Portfolio pelaburan",
            unitTrusts: "Amanah saham",
            payments: "Pembayaran dan pindahan",
            transferHistory: "Sejarah pindahan",
            managePayees: "Urus penerima",
            paymentSettings: "Tetapan pembayaran",
            profile: "Profil dan tetapan aplikasi",
            personalDetails: "Kemas kini maklumat peribadi",
            loginDetails: "Urus maklumat log masuk",
            oneToken: "Urus OCBC OneToken",
            textSize: "Ubah saiz teks",
            appTheme: "Tukar tema aplikasi",
            notifications: "Urus pemberitahuan",
            oneView: "Urus Financial OneView",
            mailbox: "Peti mel selamat",
            changeLanguage: "Tukar bahasa",
            quickSync: "Penyegerakan pantas",
            needHelp: "Perlukan bantuan lanjut?",
            hotline: "Talian bantuan",
            home: "Utama",
            plan: "Pelan",
            payTransfer: "Bayar & Pindah",
            rewards: "Ganjaran",
            selectLanguage: "Pilih Bahasa",
            chooseLanguage: "Pilih bahasa pilihan anda.",
            confirmLanguage: "Sahkan Bahasa"
        },

        ta: {
            more: "மேலும்",
            logout: "வெளியேறு",
            newFeatures: "உங்களுக்கான புதிய அம்சங்கள்",
            savingsGoals: "சேமிப்பு இலக்குகள்",
            viewGoals: "இலக்குகளைப் பார்க்க / நிர்வகிக்க",
            moneyInsights: "நிதிப் பகுப்பாய்வு",
            takeControl: "உங்கள் நிதியை நிர்வகிக்கவும்",
            apply: "விண்ணப்பிக்க",
            accounts: "கணக்குகள்",
            cards: "அட்டைகள்",
            investments: "முதலீடுகள்",
            insurance: "காப்பீடு",
            loans: "கடன்கள்",
            services: "சேவைகள்",
            cardServices: "அட்டை சேவைகள்",
            manageCards: "அட்டைகளை நிர்வகிக்கவும்",
            cardActivation: "அட்டையைச் செயல்படுத்தவும்",
            cardReplacement: "அட்டையை மாற்றவும்",
            documents: "ஆவணங்கள், அறிக்கைகள் மற்றும் கடிதங்கள்",
            accountStatements: "கணக்கு அறிக்கைகள்",
            bankLetters: "வங்கிக் கடிதங்கள்",
            investmentServices: "முதலீட்டுச் சேவைகள்",
            investmentPortfolio: "முதலீட்டுத் தொகுப்பு",
            unitTrusts: "யூனிட் அறக்கட்டளைகள்",
            payments: "பணம் செலுத்துதல் மற்றும் பரிமாற்றங்கள்",
            transferHistory: "பரிமாற்ற வரலாறு",
            managePayees: "பெறுநர்களை நிர்வகிக்கவும்",
            paymentSettings: "கட்டண அமைப்புகள்",
            profile: "சுயவிவரம் மற்றும் செயலி அமைப்புகள்",
            personalDetails: "தனிப்பட்ட விவரங்களைப் புதுப்பிக்கவும்",
            loginDetails: "உள்நுழைவு விவரங்களை நிர்வகிக்கவும்",
            oneToken: "OCBC OneToken-ஐ நிர்வகிக்கவும்",
            textSize: "எழுத்து அளவை மாற்றவும்",
            appTheme: "செயலியின் தோற்றத்தை மாற்றவும்",
            notifications: "அறிவிப்புகளை நிர்வகிக்கவும்",
            oneView: "நிதி OneView-ஐ நிர்வகிக்கவும்",
            mailbox: "பாதுகாப்பான அஞ்சல் பெட்டி",
            changeLanguage: "மொழியை மாற்று",
            quickSync: "விரைவு ஒத்திசைவு",
            needHelp: "மேலும் உதவி தேவையா?",
            hotline: "உதவி எண்",
            home: "முகப்பு",
            plan: "திட்டம்",
            payTransfer: "பணம் செலுத்து & பரிமாற்று",
            rewards: "வெகுமதிகள்",
            selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
            chooseLanguage: "உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்.",
            confirmLanguage: "மொழியை உறுதிப்படுத்தவும்"
        }
    };

    const supportedLanguages = ["en", "zh", "ms", "ta"];

    function getSavedLanguage() {
        const saved = localStorage.getItem("preferredLanguage");
        return supportedLanguages.includes(saved) ? saved : "en";
    }

    function translateElement(selector, key, words) {
        const element = document.querySelector(selector);

        if (element && words[key]) {
            element.textContent = words[key];
        }
    }

    function translateCollection(selector, keys, words) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(function (element, index) {
            const key = keys[index];

            if (key && words[key]) {
                element.textContent = words[key];
            }
        });
    }

    function translateSettingItems(words) {
        const keys = [
            "personalDetails",
            "loginDetails",
            "oneToken",
            "textSize",
            "appTheme",
            "notifications",
            "oneView",
            "mailbox",
            "changeLanguage",
            "quickSync"
        ];

        document.querySelectorAll(".settings-grid .setting-item").forEach(
            function (item, index) {
                const span = item.querySelector("span");
                const key = keys[index];

                if (span && key && words[key]) {
                    span.textContent = words[key];
                }
            }
        );
    }

    function translateMorePage(language) {
        const words = translations[language] || translations.en;

        const selectors = {
            ".more-header h1": "more",
            ".logout-button": "logout",
            ".more-features h3": "newFeatures",
            ".savings h4": "savingsGoals",
            ".savings p": "viewGoals",
            ".insights h4": "moneyInsights",
            ".insights p": "takeControl",
            ".more-apply h3": "apply",
            ".services-heading": "services",
            ".more-help h3": "needHelp",
            ".hotline span:nth-child(2)": "hotline",
            "#language-title": "selectLanguage",
            "#language-description": "chooseLanguage",
            "#confirm-language": "confirmLanguage"
        };

        Object.entries(selectors).forEach(function ([selector, key]) {
            translateElement(selector, key, words);
        });

        translateCollection(
            ".apply-item p",
            ["accounts", "cards", "investments", "insurance", "loans"],
            words
        );

        translateCollection(
            ".more-section > summary",
            ["cardServices", "documents", "investmentServices", "payments", "profile"],
            words
        );

        translateCollection(
            ".more-section .section-content a",
            [
                "manageCards",
                "cardActivation",
                "cardReplacement",
                "accountStatements",
                "bankLetters",
                "investmentPortfolio",
                "unitTrusts",
                "investmentServices",
                "transferHistory",
                "managePayees",
                "paymentSettings"
            ],
            words
        );

        translateSettingItems(words);

        translateCollection(
            ".bottom-nav .nav-item span",
            ["home", "plan", "payTransfer", "rewards", "more"],
            words
        );

        document.documentElement.lang = language;
    }

    function updateSelectedOption() {
        const currentLanguage = getSavedLanguage();

        languageOptions.forEach(function (option) {
            option.checked = option.value === currentLanguage;
        });
    }

    function openModal(event) {
        if (event) {
            event.preventDefault();
        }

        updateSelectedOption();
        modal.hidden = false;

        const selectedOption = modal.querySelector(
            'input[name="language"]:checked'
        );

        if (selectedOption) {
            selectedOption.focus();
        }
    }

    function closeModal() {
        modal.hidden = true;
        changeButton.focus();
    }

    changeButton.addEventListener("click", openModal);

    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });

    confirmButton.addEventListener("click", function () {
        const selectedOption = document.querySelector(
            'input[name="language"]:checked'
        );

        if (!selectedOption) {
            return;
        }

        const selectedLanguage = selectedOption.value;

        if (!supportedLanguages.includes(selectedLanguage)) {
            return;
        }

        localStorage.setItem("preferredLanguage", selectedLanguage);

        translateMorePage(selectedLanguage);

        console.log("Language preference saved:", selectedLanguage);

        closeModal();
    });

    translateMorePage(getSavedLanguage());
});
