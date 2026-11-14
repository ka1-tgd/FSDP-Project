
// Remove existing Guided Mode message boxes.
export function removeMessageBoxes() {
    document.querySelectorAll(".guided-popup").forEach(popup => {
        popup.remove();
    });
}

// Create a Guided Tips popup for each matching step.
export function createMessageBoxes(guidanceSteps) {
    removeMessageBoxes();

    guidanceSteps.forEach(step => {
        if (step.condition && !step.condition()) return;

        const target = document.querySelector(step.target);

        if (!target) return;

        const popup = document.createElement("div");
        popup.classList.add("guided-popup");

        // Heading with Voice Assistance controls
        const header = document.createElement("div");
        header.className = "guided-voice-header";

        const title = document.createElement("strong");
        title.textContent = step.title;

        header.appendChild(title);

        // Voice Assistance controls
        const controls = document.createElement("div");
        controls.className = "guided-voice-controls";

        // Speaker / Pause / Resume
        const play = document.createElement("button");
        play.type = "button";
        play.className = "guided-voice-play";
        play.textContent = "🔊";
        play.title = "Read tips aloud";
        play.setAttribute("aria-label", "Read tips aloud");

        // Replay
        const replay = document.createElement("button");
        replay.type = "button";
        replay.className = "guided-voice-replay";
        replay.textContent = "↻";
        replay.title = "Replay tips";
        replay.setAttribute("aria-label", "Replay tips");

        // Reading speed
        const speed = document.createElement("select");
        speed.className = "guided-voice-speed";
        speed.setAttribute("aria-label", "Reading speed");

        ["0.5", "1", "1.5"].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value + "×";
            speed.appendChild(option);
        });

        controls.append(play, replay, speed);
        header.appendChild(controls);
        popup.appendChild(header);

        // Tips content to be read aloud
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

        // Smaller note
        if (step.note) {
            const note = document.createElement("p");
            note.className = "guided-note";
            note.textContent = step.note;

            tipsText.appendChild(note);
        }

        popup.appendChild(tipsText);

        // Insert popup
        target.insertAdjacentElement("afterend", popup);

        // Toggle popup visibility
        target.addEventListener("click", () => {
            const isOpen = popup.classList.toggle("show");

            target.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        // Chatbot button
        const chatButton = document.createElement("button");
        chatButton.type = "button";
        chatButton.className = "guided-chat-button";
        chatButton.textContent = "Chat with an AI Assistant";

        // Chatbot container
        const chatContainer = document.createElement("div");
        chatContainer.className = "guided-chat-container";
        chatContainer.hidden = true;

        // Chatbot iframe
        const chatIframe = document.createElement("iframe");
        chatIframe.src = "/html/aiChatbot.html";
        chatIframe.title = "OCBC AI Assistant";

        chatIframe.style.width = "100%";
        chatIframe.style.height = "240px";
        chatIframe.style.border = "none";
        chatIframe.style.borderRadius = "12px";
        chatIframe.style.marginTop = "10px";

        chatContainer.appendChild(chatIframe);

        // Toggle chatbot
        chatButton.addEventListener("click", () => {
            chatContainer.hidden = !chatContainer.hidden;

            chatButton.textContent = chatContainer.hidden
                ? "Chat with an AI Assistant"
                : "Close chat";
        });

        // Add chatbot to popup
        popup.append(chatButton, chatContainer);
    });
}
