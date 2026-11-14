// Function to remove existing message boxes
export function removeMessageBoxes() {
    document.querySelectorAll(".guided-popup").forEach(popup => {
        popup.remove();
    });
}

// Function to create message boxes
export function createMessageBoxes(guidanceSteps) {
    // Remove existing message boxes
    removeMessageBoxes();

    // Loop through guidance objects
    guidanceSteps.forEach(step => {
        // Check for condition and if is met
        if (step.condition && !step.condition()) return;

        // Find HTML element
        const target = document.querySelector(step.target);

        // If cannot find target, exit function
        if (!target) return;

        // Main message box
        const popup = document.createElement("div");
        popup.classList.add("guided-popup");

        // Title
        const title = document.createElement("strong");
        title.textContent = step.title;
        popup.appendChild(title);

        // Tips
        step.tips.forEach(tip => {
            const paragraph = document.createElement("p");

            const heading = document.createElement("strong");
            heading.textContent = tip.heading;

            paragraph.appendChild(heading);
            paragraph.append(" " + tip.description);

            popup.appendChild(paragraph);
        });

        // Smaller note outside the box
        if (step.note) {
            const note = document.createElement("p");
            note.classList.add("guided-note");
            note.textContent = step.note;
            popup.appendChild(note);
        }

        // Insert pop up
        target.insertAdjacentElement("afterend", popup);

        // Toggle popup visibility
        target.addEventListener("click", () => {
            const isOpen = popup.classList.toggle("show");

            target.setAttribute("aria-expanded", isOpen);
        });

        // Chat button
        const chatButton = document.createElement("button");
        chatButton.type = "button";
        chatButton.classList.add("guided-chat-button");
        chatButton.textContent = "Chat with an AI Assistant";

        // Chat container
        const chatContainer = document.createElement("div");
        chatContainer.classList.add("guided-chat-container");
        chatContainer.hidden = true;

        // Placeholder for chatbot integration
        const chatIframe = document.createElement("iframe");
        chatIframe.src = "http://localhost:3000/html/aiChatbot.html"; // Points straight to your Express server chatbot route
        chatIframe.style.width = "100%";
        chatIframe.style.height = "240px";       // Adjust height to fit nicely inside the popup box
        chatIframe.style.border = "none";
        chatIframe.style.borderRadius = "12px";
        chatIframe.style.marginTop = "10px";

        chatContainer.appendChild(chatIframe);

        // Show chat when button is clicked
        chatButton.addEventListener("click", () => {
            chatContainer.hidden = !chatContainer.hidden;

            chatButton.textContent = chatContainer.hidden
                ? "Chat with OCBC"
                : "Close chat";
        });

        // Add chat elements to popup
        popup.appendChild(chatButton);
        popup.appendChild(chatContainer);
    });
}