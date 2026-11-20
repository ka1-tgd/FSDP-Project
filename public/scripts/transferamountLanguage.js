
/* ========================================
   PayNow Step 2 - Four Languages
   ======================================== */

(function () {
    "use strict";

    const translations = {
        en: {
            pageTitle: "OCBC PayNow - Enter Amount",
            step: "Step 2 of 4",
            enterAmount: "Enter amount",
            payTo: "Pay to",
            quickHint: "Tap again to remove",
            moreAmounts: "More amounts",
            cancel: "Cancel",
            dailyLimit: "Daily limit remaining:",
            from: "From",
            showBalance: "Show available balance",
            hideBalance: "Hide available balance",
            next: "Next",
            done: "Done",
            back: "Go back",
            guidance: "Show guidance",
            amountLabel: "Enter transfer amount",
            keypadLabel: "Numeric amount keypad",
            account: "Account",
            accountUnavailable: "Account unavailable",
            unknownRecipient: "Unknown recipient",
            savedRecipient: "Saved recipient",
            noRecipient: "No recipient selected",
            recipientNotFound: "Recipient not found"
        },

        zh: {
            pageTitle: "OCBC PayNow - 输入金额",
            step: "第 2 步，共 4 步",
            enterAmount: "输入金额",
            payTo: "收款人",
            quickHint: "再次点击即可取消选择",
            moreAmounts: "更多金额",
            cancel: "取消",
            dailyLimit: "今日剩余转账限额：",
            from: "付款账户",
            showBalance: "显示可用余额",
            hideBalance: "隐藏可用余额",
            next: "下一步",
            done: "完成",
            back: "返回",
            guidance: "显示操作提示",
            amountLabel: "输入转账金额",
            keypadLabel: "金额数字键盘",
            account: "账户",
            accountUnavailable: "账户暂时无法使用",
            unknownRecipient: "未知收款人",
            savedRecipient: "已保存的收款人",
            noRecipient: "尚未选择收款人",
            recipientNotFound: "找不到收款人"
        },

        ms: {
            pageTitle: "OCBC PayNow - Masukkan Amaun",
            step: "Langkah 2 daripada 4",
            enterAmount: "Masukkan amaun",
            payTo: "Bayar kepada",
            quickHint: "Ketik sekali lagi untuk membatalkan",
            moreAmounts: "Amaun lain",
            cancel: "Batal",
            dailyLimit: "Baki had pindahan harian:",
            from: "Daripada",
            showBalance: "Tunjukkan baki tersedia",
            hideBalance: "Sembunyikan baki tersedia",
            next: "Seterusnya",
            done: "Selesai",
            back: "Kembali",
            guidance: "Tunjukkan panduan",
            amountLabel: "Masukkan amaun pindahan",
            keypadLabel: "Pad kekunci angka",
            account: "Akaun",
            accountUnavailable: "Akaun tidak tersedia",
            unknownRecipient: "Penerima tidak diketahui",
            savedRecipient: "Penerima disimpan",
            noRecipient: "Tiada penerima dipilih",
            recipientNotFound: "Penerima tidak ditemui"
        },

        ta: {
            pageTitle: "OCBC PayNow - தொகையை உள்ளிடவும்",
            step: "படி 2 / 4",
            enterAmount: "தொகையை உள்ளிடவும்",
            payTo: "பெறுநர்",
            quickHint: "நீக்க மீண்டும் தட்டவும்",
            moreAmounts: "மேலும் தொகைகள்",
            cancel: "ரத்துசெய்",
            dailyLimit: "மீதமுள்ள தினசரி பரிமாற்ற வரம்பு:",
            from: "அனுப்பும் கணக்கு",
            showBalance: "இருப்பைக் காட்டு",
            hideBalance: "இருப்பை மறை",
            next: "அடுத்து",
            done: "முடிந்தது",
            back: "திரும்பிச் செல்",
            guidance: "வழிகாட்டுதலைக் காட்டு",
            amountLabel: "பரிமாற்றத் தொகையை உள்ளிடவும்",
            keypadLabel: "எண் விசைப்பலகை",
            account: "கணக்கு",
            accountUnavailable: "கணக்கு கிடைக்கவில்லை",
            unknownRecipient: "தெரியாத பெறுநர்",
            savedRecipient: "சேமித்த பெறுநர்",
            noRecipient: "பெறுநர் தேர்ந்தெடுக்கப்படவில்லை",
            recipientNotFound: "பெறுநர் கிடைக்கவில்லை"
        }
    };

    const requestedLanguage =
        localStorage.getItem("preferredLanguage") || "en";

    const language = translations[requestedLanguage]
        ? requestedLanguage
        : "en";

    const t = (key) =>
        translations[language][key] ||
        translations.en[key] ||
        key;

    document.documentElement.lang = language;
    document.title = t("pageTitle");

    function setText(selector, value) {
        const element = document.querySelector(selector);

        if (element && element.textContent !== value) {
            element.textContent = value;
        }
    }

    function translateStaticPage() {
        const stepTitle = document.querySelector(".step-title");

        if (stepTitle) {
            const value = `${t("step")} · ${t("enterAmount")}`;

            if (stepTitle.textContent.trim() !== value) {
                stepTitle.textContent = value;
            }
        }

        setText(".recipient-section .section-label", t("payTo"));
        setText("#quickHint", t("quickHint"));
        setText(".account-section .section-label", t("from"));
        setText("#nextButton", t("next"));
        setText("#keypadDone", t("done"));

        const dailyLimit = document.querySelector(".daily-limit");

        if (dailyLimit) {
            const limit = document.getElementById("dailyLimit");

            if (limit) {
                const currentValue = limit.textContent;

                const expected =
                    `${t("dailyLimit")} ${currentValue}`;

                if (dailyLimit.textContent.trim() !==
                    expected.trim()) {

                    dailyLimit.replaceChildren(
                        document.createTextNode(
                            t("dailyLimit") + " "
                        ),
                        limit
                    );
                }
            }
        }

        const dropdown = document.getElementById("moreAmounts");

        if (dropdown) {
            const placeholder =
                dropdown.querySelector('option[value=""]');

            const cancel =
                dropdown.querySelector('option[value="cancel"]');

            if (placeholder) {
                placeholder.textContent = t("moreAmounts");
            }

            if (cancel) {
                cancel.textContent = t("cancel");
            }

            dropdown.setAttribute(
                "aria-label",
                t("moreAmounts")
            );
        }

        const back = document.getElementById("backButton");

        if (back) {
            back.setAttribute("aria-label", t("back"));
        }

        const help = document.getElementById("guidedHelpBtn");

        if (help) {
            help.setAttribute("aria-label", t("guidance"));
        }

        const amount = document.getElementById("amountInput");

        if (amount) {
            amount.setAttribute(
                "aria-label",
                t("amountLabel")
            );
        }

        const keypad = document.getElementById("customKeypad");

        if (keypad) {
            keypad.setAttribute(
                "aria-label",
                t("keypadLabel")
            );
        }
    }

    function translateDynamicPage() {
        const balanceText =
            document.getElementById("balanceButtonText");

        const balance =
            document.getElementById("availableBalance");

        if (balanceText && balance) {
            const isHidden =
                balance.classList.contains("hidden");

            const expected = isHidden
                ? t("showBalance")
                : t("hideBalance");

            if (balanceText.textContent.trim() !== expected) {
                balanceText.textContent = expected;
            }
        }

        const accountType =
            document.getElementById("accountType");

        if (accountType) {
            const original = accountType.textContent.trim();

            if (original === "Account unavailable") {
                accountType.textContent =
                    t("accountUnavailable");
            } else if (
                language !== "en" &&
                original.endsWith(" Account")
            ) {
                const type = original.slice(0, -8);

                accountType.textContent =
                    language === "zh"
                        ? `${type} ${t("account")}`
                        : `${t("account")} ${type}`;
            }
        }

        const recipientName =
            document.getElementById("recipientName");

        if (recipientName) {
            const original = recipientName.textContent.trim();

            const keys = {
                "Unknown recipient": "unknownRecipient",
                "Saved recipient": "savedRecipient",
                "No recipient selected": "noRecipient",
                "Recipient not found": "recipientNotFound"
            };

            if (keys[original]) {
                recipientName.textContent = t(keys[original]);
            }
        }
    }

    const errorTranslations = {
        "Recipient unavailable": {
            zh: "收款人资料无法使用",
            ms: "Maklumat penerima tidak tersedia",
            ta: "பெறுநர் விவரங்கள் கிடைக்கவில்லை"
        },
        "Account unavailable": {
            zh: "账户暂时无法使用",
            ms: "Akaun tidak tersedia",
            ta: "கணக்கு கிடைக்கவில்லை"
        },
        "Invalid amount": {
            zh: "金额无效",
            ms: "Amaun tidak sah",
            ta: "தவறான தொகை"
        },
        "Transfer limit exceeded": {
            zh: "超过转账限额",
            ms: "Had pindahan telah dilebihi",
            ta: "பரிமாற்ற வரம்பு மீறப்பட்டது"
        },
        "Invalid recipient": {
            zh: "收款人无效",
            ms: "Penerima tidak sah",
            ta: "தவறான பெறுநர்"
        },
        "Insufficient balance": {
            zh: "余额不足",
            ms: "Baki tidak mencukupi",
            ta: "போதுமான இருப்பு இல்லை"
        },
        "Please enter a valid transfer amount.": {
            zh: "请输入有效的转账金额。",
            ms: "Sila masukkan amaun pindahan yang sah.",
            ta: "சரியான பரிமாற்றத் தொகையை உள்ளிடவும்."
        },
        "Your transfer exceeds the daily limit of SGD 3,000.": {
            zh: "您的转账金额超过每日 SGD 3,000 的限额。",
            ms: "Pindahan anda melebihi had harian SGD 3,000.",
            ta: "உங்கள் பரிமாற்றம் SGD 3,000 தினசரி வரம்பை மீறுகிறது."
        },
        "Unable to retrieve your sender account. Please try again.": {
            zh: "无法获取您的付款账户，请重试。",
            ms: "Tidak dapat mendapatkan akaun penghantar. Sila cuba lagi.",
            ta: "அனுப்புநர் கணக்கைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
        },
        "Unable to retrieve your sender account. Please try again later.": {
            zh: "无法获取您的付款账户，请稍后再试。",
            ms: "Tidak dapat mendapatkan akaun penghantar. Sila cuba sebentar lagi.",
            ta: "அனுப்புநர் கணக்கைப் பெற முடியவில்லை. பின்னர் முயற்சிக்கவும்."
        },
        "Unable to retrieve the recipient account. Please check the details.": {
            zh: "无法获取收款账户，请检查资料。",
            ms: "Tidak dapat mendapatkan akaun penerima. Sila semak butiran.",
            ta: "பெறுநர் கணக்கைப் பெற முடியவில்லை. விவரங்களைச் சரிபார்க்கவும்."
        },
        "You cannot transfer money to your own account.": {
            zh: "您不能转账至自己的账户。",
            ms: "Anda tidak boleh memindahkan wang ke akaun sendiri.",
            ta: "உங்கள் சொந்தக் கணக்கிற்குப் பணம் மாற்ற முடியாது."
        },
        "You do not have enough available balance for this transfer.": {
            zh: "您的可用余额不足以完成此转账。",
            ms: "Baki tersedia anda tidak mencukupi untuk pindahan ini.",
            ta: "இந்தப் பரிமாற்றத்திற்கு போதுமான இருப்பு இல்லை."
        },
        "Unable to load the selected recipient. Please return to Step 1 and select again.": {
            zh: "无法加载收款人，请返回第 1 步重新选择。",
            ms: "Tidak dapat memuatkan penerima. Kembali ke Langkah 1 dan pilih semula.",
            ta: "பெறுநரை ஏற்ற முடியவில்லை. படி 1-க்குத் திரும்பி மீண்டும் தேர்ந்தெடுக்கவும்."
        },
        "Unable to retrieve the recipient details. Please check and try again.": {
            zh: "无法获取收款人资料，请检查后重试。",
            ms: "Tidak dapat mendapatkan butiran penerima. Sila semak dan cuba lagi.",
            ta: "பெறுநர் விவரங்களைப் பெற முடியவில்லை. சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
        }
    };

    function translateError(text) {
        return errorTranslations[text]?.[language] || text;
    }

    function translateErrorPopup() {
        if (
            typeof window.showAppError !== "function" ||
            window.showAppError.languageWrapped
        ) {
            return;
        }

        const originalShowAppError = window.showAppError;

        function translatedShowAppError(title, message) {
            return originalShowAppError(
                translateError(title),
                translateError(message)
            );
        }

        translatedShowAppError.languageWrapped = true;
        window.showAppError = translatedShowAppError;
    }

    function initialize() {
        translateStaticPage();
        translateDynamicPage();
        translateErrorPopup();

        // Update dynamic text after API data is loaded.
        const observer = new MutationObserver(function () {
            translateDynamicPage();
        });

        const account = document.getElementById("accountType");
        const recipient = document.getElementById("recipientName");
        const balance = document.getElementById("balanceButtonText");

        [account, recipient, balance].forEach(function (element) {
            if (element) {
                observer.observe(element, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
        });

        const availableBalance =
            document.getElementById("availableBalance");

        if (availableBalance) {
            observer.observe(availableBalance, {
                attributes: true,
                attributeFilter: ["class"]
            });
        }

        const balanceButton =
            document.getElementById("balanceButton");

        if (balanceButton) {
            balanceButton.addEventListener("click", function () {
                queueMicrotask(translateDynamicPage);
            });
        }
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
