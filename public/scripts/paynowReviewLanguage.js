
/* =========================================
   PayNow Step 3 - Four Language Support
   ========================================= */

(function () {
    "use strict";

    const translations = {
        en: {
            title: "OCBC PayNow - Review Payment",
            step: "Step 3 of 4",
            heading: "Review and confirm",
            instruction: "Please check all details before proceeding.",
            sending: "You're sending",
            from: "From",
            to: "To",
            warning: "Transfers cannot be reversed once sent. Please check carefully.",
            reminder: "Please check that all details are correct before proceeding.",
            slide: "Slide to pay",
            confirm: "Confirm and pay",
            back: "Go back",
            guidance: "Show guidance",
            account: "Account",
            processing: "Processing...",
            processingMessage: "Please wait while your transfer is processed.",
            checkStatus: "Check transaction status",
            successful: "Transfer successful!",
            paymentSuccessful: "Payment successful"
        },

        zh: {
            title: "OCBC PayNow - 确认转账",
            step: "第 3 步，共 4 步",
            heading: "检查并确认",
            instruction: "继续之前，请仔细检查所有转账资料。",
            sending: "您将转账",
            from: "付款账户",
            to: "收款人",
            warning: "转账完成后无法撤销，请仔细检查。",
            reminder: "继续之前，请确认所有资料正确。",
            slide: "滑动付款",
            confirm: "确认并付款",
            back: "返回",
            guidance: "显示操作提示",
            account: "账户",
            processing: "处理中...",
            processingMessage: "正在处理您的转账，请稍候。",
            checkStatus: "检查交易状态",
            successful: "转账成功！",
            paymentSuccessful: "付款成功"
        },

        ms: {
            title: "OCBC PayNow - Semak Pembayaran",
            step: "Langkah 3 daripada 4",
            heading: "Semak dan sahkan",
            instruction: "Sila semak semua butiran sebelum meneruskan.",
            sending: "Anda menghantar",
            from: "Daripada",
            to: "Kepada",
            warning: "Pindahan tidak boleh dibatalkan selepas dihantar. Sila semak dengan teliti.",
            reminder: "Pastikan semua butiran betul sebelum meneruskan.",
            slide: "Leret untuk bayar",
            confirm: "Sahkan dan bayar",
            back: "Kembali",
            guidance: "Tunjukkan panduan",
            account: "Akaun",
            processing: "Sedang diproses...",
            processingMessage: "Sila tunggu sementara pindahan anda diproses.",
            checkStatus: "Semak status transaksi",
            successful: "Pindahan berjaya!",
            paymentSuccessful: "Pembayaran berjaya"
        },

        ta: {
            title: "OCBC PayNow - பணப் பரிமாற்றத்தைச் சரிபார்க்கவும்",
            step: "படி 3 / 4",
            heading: "சரிபார்த்து உறுதிப்படுத்தவும்",
            instruction: "தொடர்வதற்கு முன் அனைத்து விவரங்களையும் சரிபார்க்கவும்.",
            sending: "நீங்கள் அனுப்பும் தொகை",
            from: "அனுப்பும் கணக்கு",
            to: "பெறுநர்",
            warning: "அனுப்பிய பிறகு பணப் பரிமாற்றத்தை ரத்து செய்ய முடியாது. கவனமாகச் சரிபார்க்கவும்.",
            reminder: "தொடர்வதற்கு முன் அனைத்து விவரங்களும் சரியானவை என்பதை உறுதிப்படுத்தவும்.",
            slide: "பணம் செலுத்த ஸ்லைடு செய்யவும்",
            confirm: "உறுதிசெய்து பணம் செலுத்தவும்",
            back: "திரும்பிச் செல்",
            guidance: "வழிகாட்டுதலைக் காட்டு",
            account: "கணக்கு",
            processing: "செயலாக்கப்படுகிறது...",
            processingMessage: "உங்கள் பரிமாற்றம் செயலாக்கப்படும் வரை காத்திருக்கவும்.",
            checkStatus: "பரிவர்த்தனை நிலையைச் சரிபார்க்கவும்",
            successful: "பரிமாற்றம் வெற்றிகரமாக முடிந்தது!",
            paymentSuccessful: "பணம் செலுத்தப்பட்டது"
        }
    };

    const language = localStorage.getItem("preferredLanguage") || "en";
    const selected = translations[language] || translations.en;

    const t = key => selected[key] || translations.en[key] || key;

    document.documentElement.lang =
        translations[language] ? language : "en";

    document.title = t("title");

    function setText(selector, value) {
        const element = document.querySelector(selector);

        if (element && element.textContent !== value) {
            element.textContent = value;
        }
    }

    function translateStaticPage() {
        setText(
            ".step-title",
            `${t("step")} · ${t("heading")}`
        );

        setText(".review-instruction", t("instruction"));
        setText(".review-amount-section > p", t("sending"));

        const labels = document.querySelectorAll(".review-label");

        if (labels[0]) labels[0].textContent = t("from");
        if (labels[1]) labels[1].textContent = t("to");

        setText(".review-warning p", t("warning"));
        setText(".review-reminder", t("reminder"));

        const back = document.querySelector(".back-button");
        if (back) {
            back.setAttribute("aria-label", t("back"));
        }

        const help = document.getElementById("guidedHelpBtn");
        if (help) {
            help.setAttribute("aria-label", t("guidance"));
        }

        const slider = document.getElementById("slideToPay");
        if (slider) {
            slider.setAttribute("aria-label", t("slide"));
        }

        const handle = document.getElementById("slideHandle");
        if (handle) {
            handle.setAttribute("aria-label", t("confirm"));
        }
    }

    // Translate dynamically updated account names.
    function translateAccount() {
        const element = document.getElementById("reviewSenderType");
        if (!element) return;

        const original = element.textContent.trim();

        if (language === "en" || !original) return;

        if (original.endsWith(" Account")) {
            const type = original.slice(0, -8);

            element.textContent =
                language === "zh"
                    ? `${type} ${t("account")}`
                    : `${t("account")} ${type}`;
        }
    }

    // Translate slider and processing messages.
    const statusKeys = {
        "Slide to pay": "slide",
        "Processing...": "processing",
        "Check transaction status": "checkStatus",
        "Payment successful": "paymentSuccessful",
        "Please wait while your transfer is processed.": "processingMessage",
        "Transfer successful!": "successful"
    };

    function translateDynamicText(element) {
        if (!element) return;

        const original = element.textContent.trim();
        const key = statusKeys[original];

        if (key) {
            element.textContent = t(key);
        }
    }

    // Translate known error popup messages.
    const errorTranslations = {
        "Transfer details unavailable": {
            zh: "无法获取转账资料",
            ms: "Butiran pindahan tidak tersedia",
            ta: "பரிமாற்ற விவரங்கள் கிடைக்கவில்லை"
        },
        "Unable to load transfer": {
            zh: "无法加载转账资料",
            ms: "Tidak dapat memuatkan pindahan",
            ta: "பரிமாற்றத்தை ஏற்ற முடியவில்லை"
        },
        "Confirmation unavailable": {
            zh: "无法确认交易",
            ms: "Pengesahan tidak tersedia",
            ta: "உறுதிப்படுத்தல் கிடைக்கவில்லை"
        },
        "Transfer unsuccessful": {
            zh: "转账失败",
            ms: "Pindahan tidak berjaya",
            ta: "பரிமாற்றம் தோல்வியடைந்தது"
        },
        "Insufficient balance": {
            zh: "余额不足",
            ms: "Baki tidak mencukupi",
            ta: "போதுமான இருப்பு இல்லை"
        },
        "Recipient unavailable": {
            zh: "收款人资料无法使用",
            ms: "Penerima tidak tersedia",
            ta: "பெறுநர் கிடைக்கவில்லை"
        },
        "Account unavailable": {
            zh: "账户暂时无法使用",
            ms: "Akaun tidak tersedia",
            ta: "கணக்கு கிடைக்கவில்லை"
        },
        "Invalid recipient": {
            zh: "收款人无效",
            ms: "Penerima tidak sah",
            ta: "தவறான பெறுநர்"
        },
        "Connection error": {
            zh: "连接错误",
            ms: "Ralat sambungan",
            ta: "இணைப்புப் பிழை"
        },
        "Your transfer details could not be retrieved. Please return to Step 2.": {
            zh: "无法获取转账资料，请返回第 2 步。",
            ms: "Butiran pindahan tidak dapat diperoleh. Sila kembali ke Langkah 2.",
            ta: "பரிமாற்ற விவரங்களைப் பெற முடியவில்லை. படி 2-க்குத் திரும்பவும்."
        },
        "Your payment details are incomplete. Please return to Step 2 and try again.": {
            zh: "付款资料不完整，请返回第 2 步重试。",
            ms: "Butiran pembayaran tidak lengkap. Kembali ke Langkah 2 dan cuba lagi.",
            ta: "கட்டண விவரங்கள் முழுமையடையவில்லை. படி 2-க்குத் திரும்பி மீண்டும் முயற்சிக்கவும்."
        },
        "The payment response did not include a transaction reference. Please check your transaction history before attempting another transfer.": {
            zh: "付款结果没有交易参考编号。再次转账前，请先检查交易记录。",
            ms: "Respons pembayaran tiada nombor rujukan transaksi. Semak sejarah transaksi sebelum mencuba lagi.",
            ta: "கட்டணப் பதிலில் பரிவர்த்தனை குறிப்பு எண் இல்லை. மீண்டும் முயற்சிக்கும் முன் பரிவர்த்தனை வரலாற்றைச் சரிபார்க்கவும்."
        },
        "Your transfer could not be completed. Please try again.": {
            zh: "无法完成转账，请重试。",
            ms: "Pindahan tidak dapat diselesaikan. Sila cuba lagi.",
            ta: "பரிமாற்றத்தை முடிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
        },
        "You do not have enough available balance. Please enter a lower amount.": {
            zh: "可用余额不足，请输入较低的金额。",
            ms: "Baki tersedia tidak mencukupi. Sila masukkan amaun yang lebih rendah.",
            ta: "போதுமான இருப்பு இல்லை. குறைந்த தொகையை உள்ளிடவும்."
        },
        "We could not find the recipient's account. Please check the recipient details.": {
            zh: "找不到收款账户，请检查收款人资料。",
            ms: "Akaun penerima tidak ditemui. Sila semak butiran penerima.",
            ta: "பெறுநரின் கணக்கு கிடைக்கவில்லை. விவரங்களைச் சரிபார்க்கவும்."
        },
        "We could not access your sender account. Please try again later.": {
            zh: "无法访问您的付款账户，请稍后重试。",
            ms: "Akaun penghantar tidak dapat diakses. Sila cuba lagi kemudian.",
            ta: "அனுப்புநர் கணக்கை அணுக முடியவில்லை. பின்னர் முயற்சிக்கவும்."
        },
        "You cannot transfer money to your own account.": {
            zh: "您不能转账至自己的账户。",
            ms: "Anda tidak boleh memindahkan wang ke akaun sendiri.",
            ta: "உங்கள் சொந்தக் கணக்கிற்குப் பணம் மாற்ற முடியாது."
        },
        "Unable to connect to the PayNow service. Please check your connection and transaction status before trying again.": {
            zh: "无法连接 PayNow 服务。再次尝试前，请检查网络连接及交易状态。",
            ms: "Tidak dapat menyambung ke perkhidmatan PayNow. Semak sambungan dan status transaksi sebelum mencuba lagi.",
            ta: "PayNow சேவையுடன் இணைக்க முடியவில்லை. மீண்டும் முயற்சிக்கும் முன் இணைப்பையும் பரிவர்த்தனை நிலையையும் சரிபார்க்கவும்."
        }
    };

    function translateError(text) {
        return errorTranslations[text]?.[language] || text;
    }

    function wrapErrorPopup() {
        if (
            typeof window.showAppError !== "function" ||
            window.showAppError.reviewLanguageWrapped
        ) {
            return;
        }

        const original = window.showAppError;

        function translatedError(title, message) {
            return original(
                translateError(title),
                translateError(message)
            );
        }

        translatedError.reviewLanguageWrapped = true;
        window.showAppError = translatedError;
    }

    function initialize() {
        translateStaticPage();
        translateAccount();
        wrapErrorPopup();

        const sender = document.getElementById("reviewSenderType");
        const sliderText = document.getElementById("slideText");
        const status = document.getElementById("transferStatus");

        if (sender) {
            const senderObserver = new MutationObserver(() => {
                translateAccount();
            });

            senderObserver.observe(sender, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }

        [sliderText, status].forEach(element => {
            if (!element) return;

            translateDynamicText(element);

            const observer = new MutationObserver(() => {
                translateDynamicText(element);
            });

            observer.observe(element, {
                childList: true,
                characterData: true,
                subtree: true
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();
