
/* ========================================
   PayNow Step 1 - Multilingual Guided Tips
   ======================================== */

const translations = {
    en: {
        title: "Tips:",
        heading: "NRIC/FIN or UEN/VPA:",
        description: "Use this if you only know their ID or business number.",
        note: "Check the name shown on the next screen before you transfer."
    },

    zh: {
        title: "提示：",
        heading: "身份证／外国人身份证号码或企业编号：",
        description: "如果您只知道收款人的身份证号码或企业编号，可以使用这个选项。",
        note: "转账前，请在下一页确认收款人的姓名。"
    },

    ms: {
        title: "Petua:",
        heading: "NRIC/FIN atau UEN/VPA:",
        description: "Gunakan pilihan ini jika anda hanya mengetahui nombor pengenalan atau nombor perniagaan penerima.",
        note: "Semak nama penerima pada skrin seterusnya sebelum membuat pemindahan."
    },

    ta: {
        title: "உதவிக்குறிப்புகள்:",
        heading: "NRIC/FIN அல்லது UEN/VPA:",
        description: "பெறுநரின் அடையாள எண் அல்லது வணிக எண் மட்டுமே உங்களுக்குத் தெரிந்தால் இந்த விருப்பத்தைப் பயன்படுத்தவும்.",
        note: "பணத்தை அனுப்புவதற்கு முன் அடுத்த திரையில் பெறுநரின் பெயரைச் சரிபார்க்கவும்."
    }
};

function getGuidanceLanguage() {
    const language = localStorage.getItem("preferredLanguage") || "en";

    return translations[language] ? language : "en";
}

function createPaynowSentGuidance() {
    const language = getGuidanceLanguage();
    const text = translations[language];

    return [
        {
            target: "#guidedHelpBtn",

            title: text.title,

            tips: [
                {
                    heading: text.heading,
                    description: text.description
                }
            ],

            note: text.note
        }
    ];
}

export const paynowSentGuidance = createPaynowSentGuidance();
