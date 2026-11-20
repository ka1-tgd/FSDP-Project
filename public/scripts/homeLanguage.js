
(function () {
    "use strict";

    const translations = {
        en: {
            ocbcTokens: "OCBC Tokens",
            logout: "logout",
            scanPay: "Scan & Pay",
            foreignExchange: "Foreign Exchange",
            customise: "Customise",
            balanceToggle: "Show or hide balance",
            accounts: "Accounts",
            cards: "Cards",
            investment: "Investment",
            availableBalance: "Available Balance",
            viewDetails: "view details",
            savingsGoals: "SAVINGS GOALS",
            viewGoals: "View/manage goals",
            moneyInsights: "MONEY INSIGHTS",
            takeControl: "Take control",
            recentTransactions: "Recent transactions",
            home: "Home",
            plan: "Plan",
            payTransfer: "Pay & Transfer",
            rewards: "Rewards",
            more: "More",
            account: "Account",
            accountUnavailable: "Account unavailable",
            noAccount: "No account found",
            transactionsError: "Unable to load transactions. Please try again.",
            noTransactions: "No recent transactions.",
            unknown: "Unknown"
        },

        zh: {
            ocbcTokens: "OCBC 令牌",
            logout: "登出",
            scanPay: "扫码付款",
            foreignExchange: "外汇兑换",
            customise: "自定义",
            balanceToggle: "显示或隐藏余额",
            accounts: "账户",
            cards: "银行卡",
            investment: "投资",
            availableBalance: "可用余额",
            viewDetails: "查看详情",
            savingsGoals: "储蓄目标",
            viewGoals: "查看／管理目标",
            moneyInsights: "财务分析",
            takeControl: "掌握财务状况",
            recentTransactions: "最近交易记录",
            home: "首页",
            plan: "规划",
            payTransfer: "付款与转账",
            rewards: "奖励",
            more: "更多",
            account: "账户",
            accountUnavailable: "账户暂时无法使用",
            noAccount: "未找到账户",
            transactionsError: "无法加载交易记录，请重试。",
            noTransactions: "暂无交易记录。",
            unknown: "未知"
        },

        ms: {
            ocbcTokens: "Token OCBC",
            logout: "Log keluar",
            scanPay: "Imbas & Bayar",
            foreignExchange: "Pertukaran Asing",
            customise: "Sesuaikan",
            balanceToggle: "Tunjuk atau sembunyikan baki",
            accounts: "Akaun",
            cards: "Kad",
            investment: "Pelaburan",
            availableBalance: "Baki Tersedia",
            viewDetails: "Lihat butiran",
            savingsGoals: "MATLAMAT SIMPANAN",
            viewGoals: "Lihat/urus matlamat",
            moneyInsights: "ANALISIS KEWANGAN",
            takeControl: "Urus kewangan anda",
            recentTransactions: "Transaksi terkini",
            home: "Utama",
            plan: "Pelan",
            payTransfer: "Bayar & Pindah",
            rewards: "Ganjaran",
            more: "Lagi",
            account: "Akaun",
            accountUnavailable: "Akaun tidak tersedia",
            noAccount: "Tiada akaun ditemui",
            transactionsError: "Tidak dapat memuatkan transaksi. Sila cuba lagi.",
            noTransactions: "Tiada transaksi terkini.",
            unknown: "Tidak diketahui"
        },

        ta: {
            ocbcTokens: "OCBC டோக்கன்கள்",
            logout: "வெளியேறு",
            scanPay: "ஸ்கேன் செய்து செலுத்து",
            foreignExchange: "அந்நியச் செலாவணி",
            customise: "தனிப்பயனாக்கு",
            balanceToggle: "இருப்பைக் காட்டு அல்லது மறை",
            accounts: "கணக்குகள்",
            cards: "அட்டைகள்",
            investment: "முதலீடு",
            availableBalance: "கிடைக்கும் இருப்பு",
            viewDetails: "விவரங்களைக் காண்க",
            savingsGoals: "சேமிப்பு இலக்குகள்",
            viewGoals: "இலக்குகளைப் பார்க்க / நிர்வகிக்க",
            moneyInsights: "நிதிப் பகுப்பாய்வு",
            takeControl: "உங்கள் நிதியை நிர்வகிக்கவும்",
            recentTransactions: "சமீபத்திய பரிவர்த்தனைகள்",
            home: "முகப்பு",
            plan: "திட்டம்",
            payTransfer: "பணம் செலுத்து & பரிமாற்று",
            rewards: "வெகுமதிகள்",
            more: "மேலும்",
            account: "கணக்கு",
            accountUnavailable: "கணக்கு கிடைக்கவில்லை",
            noAccount: "கணக்கு எதுவும் இல்லை",
            transactionsError: "பரிவர்த்தனைகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
            noTransactions: "சமீபத்திய பரிவர்த்தனைகள் இல்லை.",
            unknown: "தெரியவில்லை"
        }
    };

    const supportedLanguages = ["en", "zh", "ms", "ta"];

    function getLanguage() {
        const saved = localStorage.getItem("preferredLanguage");
        return supportedLanguages.includes(saved) ? saved : "en";
    }

    function t(key) {
        const language = getLanguage();
        return translations[language][key] || translations.en[key] || key;
    }

    function translateHome() {
        const language = getLanguage();

        document.documentElement.lang = language;

        document.querySelectorAll("[data-i18n]").forEach(function (element) {
            const key = element.dataset.i18n;
            element.textContent = t(key);
        });

        document.querySelectorAll("[data-i18n-aria]").forEach(function (element) {
            element.setAttribute("aria-label", t(element.dataset.i18nAria));
        });
    }

    window.homeI18n = {
        t: t,
        getLanguage: getLanguage,
        translate: translateHome
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", translateHome);
    } else {
        translateHome();
    }
})();
