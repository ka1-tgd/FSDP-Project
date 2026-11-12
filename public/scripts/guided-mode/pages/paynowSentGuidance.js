export const paynowSentGuidance = [
    {
        target: "#recipientContent",
        
        position: "afterend",

        condition: () => {
            return document.querySelector(
                '.tab[data-tab="recent"]'
            )?.classList.contains("active");
        },

        title: "Tips:",

        tips: [
            {
                heading: "Contacts:",
                description: "People you have saved in your phone"
            },
            {
                heading: "Recent:",
                description: "People you have paid before"
            },
            {
                heading: "NRIC/FIN or UEN/VPA:",
                description: "Use this if you only know their ID or business number"
            }
        ],

        note: "Check the name shown on the next screen before you transfer."
    }
];