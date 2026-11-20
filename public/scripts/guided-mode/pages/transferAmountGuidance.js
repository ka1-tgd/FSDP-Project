
const preferredLanguage =
    localStorage.getItem("preferredLanguage") || "en";

const translations = {
    en: {
        title: "Choosing How Much to Send",
        heading: "Quick Amounts:",
        description: "Tap a suggested amount or enter your own",
        note: "Check the recipient name before proceeding"
    },

    zh: {
        title: "选择转账金额",
        heading: "快捷金额：",
        description: "点击建议金额，或自行输入金额",
        note: "继续之前，请确认收款人的姓名"
    },

    ms: {
        title: "Pilih Jumlah untuk Dihantar",
        heading: "Amaun Pantas:",
        description: "Ketik amaun yang dicadangkan atau masukkan amaun sendiri",
        note: "Semak nama penerima sebelum meneruskan"
    },

    ta: {
        title: "அனுப்ப வேண்டிய தொகையைத் தேர்ந்தெடுக்கவும்",
        heading: "விரைவுத் தொகைகள்:",
        description: "பரிந்துரைக்கப்பட்ட தொகையைத் தட்டவும் அல்லது உங்கள் சொந்தத் தொகையை உள்ளிடவும்",
        note: "தொடர்வதற்கு முன் பெறுநரின் பெயரைச் சரிபார்க்கவும்"
    }
};

const t = translations[preferredLanguage] || translations.en;

export const transferAmountGuidance = [
    {
        target: "#guidedHelpBtn",

        title: t.title,

        tips: [
            {
                heading: t.heading,
                description: t.description
            }
        ],

        note: t.note
    }
];
