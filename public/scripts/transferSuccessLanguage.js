
/* =========================================
   PayNow Step 4 - Four Language Support
   ========================================= */

(function () {
    "use strict";

    const translations = {
        en: {
            title: "OCBC PayNow - Transfer Successful",
            logout: "Log out",
            paid: "SGD paid",
            to: "To",
            when: "When",
            loading: "Loading...",
            seeDetails: "See transaction details",
            hideDetails: "Hide transaction details",
            reference: "Transaction reference:",
            status: "Payment status: Successful",
            transactionId: "Transaction ID:",
            transfers: "Go to Transfers",
            home: "Back to Home",
            recipient: "Recipient",
            unavailable: "Details unavailable",
            error: "Unable to retrieve your transaction details. Please check your transaction history."
        },

        zh: {
            title: "OCBC PayNow - 转账成功",
            logout: "登出",
            paid: "SGD 已支付",
            to: "收款人",
            when: "转账日期",
            loading: "加载中...",
            seeDetails: "查看交易详情",
            hideDetails: "隐藏交易详情",
            reference: "交易参考编号：",
            status: "付款状态：成功",
            transactionId: "交易编号：",
            transfers: "前往转账",
            home: "返回主页",
            recipient: "收款人",
            unavailable: "无法获取资料",
            error: "无法获取您的交易资料，请检查交易记录。"
        },

        ms: {
            title: "OCBC PayNow - Pindahan Berjaya",
            logout: "Log keluar",
            paid: "SGD dibayar",
            to: "Kepada",
            when: "Tarikh pindahan",
            loading: "Sedang dimuatkan...",
            seeDetails: "Lihat butiran transaksi",
            hideDetails: "Sembunyikan butiran transaksi",
            reference: "Rujukan transaksi:",
            status: "Status pembayaran: Berjaya",
            transactionId: "ID Transaksi:",
            transfers: "Pergi ke Pindahan",
            home: "Kembali ke Laman Utama",
            recipient: "Penerima",
            unavailable: "Butiran tidak tersedia",
            error: "Tidak dapat mendapatkan butiran transaksi anda. Sila semak sejarah transaksi."
        },

        ta: {
            title: "OCBC PayNow - பணப் பரிமாற்றம் வெற்றி",
            logout: "வெளியேறு",
            paid: "SGD செலுத்தப்பட்டது",
            to: "பெறுநர்",
            when: "பரிமாற்ற தேதி",
            loading: "ஏற்றப்படுகிறது...",
            seeDetails: "பரிவர்த்தனை விவரங்களைக் காண்க",
            hideDetails: "பரிவர்த்தனை விவரங்களை மறைக்கவும்",
            reference: "பரிவர்த்தனை குறிப்பு எண்:",
            status: "கட்டண நிலை: வெற்றி",
            transactionId: "பரிவர்த்தனை ID:",
            transfers: "பரிமாற்றங்களுக்குச் செல்",
            home: "முகப்புக்குத் திரும்பு",
            recipient: "பெறுநர்",
            unavailable: "விவரங்கள் கிடைக்கவில்லை",
            error: "பரிவர்த்தனை விவரங்களைப் பெற முடியவில்லை. உங்கள் பரிவர்த்தனை வரலாற்றைச் சரிபார்க்கவும்."
        }
    };

    const language =
        localStorage.getItem("preferredLanguage") || "en";

    const selected =
        translations[language] || translations.en;

    const t = key =>
        selected[key] || translations.en[key] || key;

    document.documentElement.lang =
        translations[language] ? language : "en";

    document.title = t("title");

    function setText(selector, value) {
        const element = document.querySelector(selector);

        if (element && element.textContent !== value) {
            element.textContent = value;
        }
    }

    function translatePage() {

        // Log out
        setText(".success-top .logout", t("logout"));

        // Amount - preserve the dynamic amount span
        const amount = document.querySelector(".success-amount");

        if (amount) {
            const amountSpan =
                document.getElementById("successAmount");

            if (amountSpan) {
                // Remove only text nodes, not the amount element
                Array.from(amount.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        node.remove();
                    }
                });

                amount.appendChild(
                    document.createTextNode(" " + t("paid"))
                );
            }
        }

        // Recipient and date labels
        const labels =
            document.querySelectorAll(".success-label");

        if (labels[0]) {
            labels[0].textContent = t("to");
        }

        if (labels[1]) {
            labels[1].textContent = t("when");
        }

        // Transaction details
        const details =
            document.getElementById("transactionDetails");

        if (details) {
            const paragraphs = details.querySelectorAll("p");

            if (paragraphs[0]) {
                paragraphs[0].textContent = t("reference");
            }

            if (paragraphs[1]) {
                paragraphs[1].textContent = t("status");
            }
        }

        // Transaction ID - preserve the reference span
        const transactionReference =
            document.querySelector(".transaction-reference");

        if (transactionReference) {
            const idSpan =
                document.getElementById("successTransactionId");

            if (idSpan) {
                Array.from(transactionReference.childNodes)
                    .forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            node.remove();
                        }
                    });

                transactionReference.insertBefore(
                    document.createTextNode(
                        t("transactionId") + " "
                    ),
                    idSpan
                );
            }
        }

        // Navigation buttons
        setText("#goTransfers", t("transfers"));
        setText("#backHome", t("home"));

        // Toggle initial text
        updateToggleText();

        // Dynamic recipient / error text
        translateDynamicContent();
    }

    function updateToggleText() {
        const toggle =
            document.getElementById("transactionToggle");

        const details =
            document.getElementById("transactionDetails");

        if (!toggle || !details) return;

        const key = details.classList.contains("hidden")
            ? "seeDetails"
            : "hideDetails";

        setText("#transactionToggle", t(key));
    }

    function translateDynamicContent() {

        const recipient =
            document.getElementById("successRecipientName");

        const error =
            document.getElementById("successError");

        if (recipient) {
            const current = recipient.textContent.trim();

            if (current === "Details unavailable") {
                recipient.textContent = t("unavailable");
            } else if (current === "Recipient") {
                recipient.textContent = t("recipient");
            } else if (current === "Loading...") {
                recipient.textContent = t("loading");
            }
        }

        if (error) {
            const current = error.textContent.trim();

            if (
                current ===
                "Unable to retrieve your transaction details. Please check your transaction history."
            ) {
                error.textContent = t("error");
            }
        }
    }

    function initialize() {

        translatePage();

        // Keep transaction toggle translated after clicks.
        const toggle =
            document.getElementById("transactionToggle");

        if (toggle) {
            toggle.addEventListener("click", () => {
                // Run after the original click handler.
                queueMicrotask(updateToggleText);
            });
        }

        // Observe dynamic text from transferSuccess.js.
        const recipient =
            document.getElementById("successRecipientName");

        const error =
            document.getElementById("successError");

        [recipient, error].forEach(element => {
            if (!element) return;

            const observer = new MutationObserver(() => {
                translateDynamicContent();
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
