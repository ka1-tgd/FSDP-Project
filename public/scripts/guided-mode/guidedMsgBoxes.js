
/* ========================================
   Guided Message Boxes - Multilingual
   ======================================== */

const guidedTranslations = {
    en: {
        readAloud: "Read tips aloud",
        replay: "Replay tips",
        decreaseSpeed: "Decrease reading speed",
        increaseSpeed: "Increase reading speed",
        chatbot: "Chat with an AI Assistant"
    },

    zh: {
        readAloud: "朗读提示",
        replay: "重新朗读",
        decreaseSpeed: "降低朗读速度",
        increaseSpeed: "提高朗读速度",
        chatbot: "与 AI 助手聊天"
    },

    ms: {
        readAloud: "Baca petua dengan kuat",
        replay: "Baca semula petua",
        decreaseSpeed: "Kurangkan kelajuan bacaan",
        increaseSpeed: "Tingkatkan kelajuan bacaan",
        chatbot: "Berbual dengan Pembantu AI"
    },

    ta: {
        readAloud: "உதவிக்குறிப்புகளை உரக்கப் படிக்கவும்",
        replay: "மீண்டும் படிக்கவும்",
        decreaseSpeed: "வாசிப்பு வேகத்தைக் குறைக்கவும்",
        increaseSpeed: "வாசிப்பு வேகத்தை அதிகரிக்கவும்",
        chatbot: "AI உதவியாளருடன் உரையாடுங்கள்"
    }
};

function getGuidedLanguage() {
    const language = localStorage.getItem("preferredLanguage") || "en";

    return guidedTranslations[language] ? language : "en";
}

function getGuidedText() {
    return guidedTranslations[getGuidedLanguage()];
}

/* ========================================
   Remove Existing Popups
   ======================================== */

export function removeMessageBoxes() {
    document.querySelectorAll(".guided-popup").forEach(popup => {
        popup.remove();
    });
}

/* ========================================
   Create Guided Popups
   ======================================== */

export function createMessageBoxes(guidanceSteps) {
    removeMessageBoxes();

    const languageText = getGuidedText();

    guidanceSteps.forEach(step => {
        if (step.condition && !step.condition()) return;

        const target = document.querySelector(step.target);

        if (!target) return;

        /* Create Popup */
        const popup = document.createElement("div");
        popup.classList.add("guided-popup");

        /* ========================================
           Header
           ======================================== */

        const header = document.createElement("div");
        header.className = "guided-voice-header";

        const title = document.createElement("strong");
        title.textContent = step.title;

        header.appendChild(title);

        /* ========================================
           Voice Controls
           ======================================== */

        const controls = document.createElement("div");
        controls.className = "guided-voice-controls";

        /* Play */
        const play = document.createElement("button");
        play.type = "button";
        play.className = "guided-voice-play";
        play.textContent = "🔊";
        play.title = languageText.readAloud;
        play.setAttribute("aria-label", languageText.readAloud);

        /* Replay */
        const replay = document.createElement("button");
        replay.type = "button";
        replay.className = "guided-voice-replay";
        replay.textContent = "↻";
        replay.title = languageText.replay;
        replay.setAttribute("aria-label", languageText.replay);

        /* Speed Control */
        const speedControl = document.createElement("div");
        speedControl.className = "guided-voice-speed-control";

        /* Minus */
        const minus = document.createElement("button");
        minus.type = "button";
        minus.className = "guided-voice-minus";
        minus.textContent = "−";
        minus.title = languageText.decreaseSpeed;
        minus.setAttribute("aria-label", languageText.decreaseSpeed);

        /* Speed Value */
        const speedValue = document.createElement("span");
        speedValue.className = "guided-voice-speed-value";
        speedValue.textContent = "1.0x";
        speedValue.setAttribute("aria-live", "polite");

        /* Plus */
        const plus = document.createElement("button");
        plus.type = "button";
        plus.className = "guided-voice-plus";
        plus.textContent = "+";
        plus.title = languageText.increaseSpeed;
        plus.setAttribute("aria-label", languageText.increaseSpeed);

        speedControl.append(minus, speedValue, plus);

        controls.append(play, replay, speedControl);

        header.appendChild(controls);
        popup.appendChild(header);

        /* ========================================
           Guided Tips Text
           ======================================== */

        const tipsText = document.createElement("div");
        tipsText.className = "guided-voice-text";

        (step.tips || []).forEach(tip => {
            const paragraph = document.createElement("p");

            const heading = document.createElement("strong");
            heading.textContent = tip.heading;

            paragraph.appendChild(heading);
            paragraph.append(" " + tip.description);

            tipsText.appendChild(paragraph);
        });

        /* Note */
        if (step.note) {
            const note = document.createElement("p");
            note.className = "guided-note";
            note.textContent = step.note;

            tipsText.appendChild(note);
        }

        popup.appendChild(tipsText);

        /* ========================================
           Insert Popup
           ======================================== */

        target.insertAdjacentElement("afterend", popup);

        /* Toggle Popup */
        target.addEventListener("click", () => {
            const isOpen = popup.classList.toggle("show");

            target.setAttribute("aria-expanded", String(isOpen));
        });

        /* Prevent Popup Click Propagation */
        popup.addEventListener("click", event => {
            event.stopPropagation();
        });

        /* ========================================
           Chatbot Button
           ======================================== */

        const chatButton = document.createElement("button");
        chatButton.type = "button";
        chatButton.className = "guided-chat-button";
        chatButton.textContent = languageText.chatbot;

        /* Chatbot Container */
        const chatContainer = document.createElement("div");
        chatContainer.className = "guided-chat-container";
        chatContainer.hidden = true;

        const chatIframe = document.createElement("iframe");

        chatIframe.src = "/html/aiChatbot.html";
        chatIframe.title = "OCBC AI Assistant";

        chatIframe.style.width = "100%";
        chatIframe.style.height = "240px";
        chatIframe.style.border = "none";
        chatIframe.style.borderRadius = "12px";
        chatIframe.style.marginTop = "10px";

        chatContainer.appendChild(chatIframe);

        /* Open Chatbot Page */
        chatButton.addEventListener("click", () => {
            window.location.href = "../../html/aiChatbot.html";
        });

        popup.append(chatButton, chatContainer);
    });
}
