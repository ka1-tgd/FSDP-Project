export function createMessageBoxes(guidanceSteps) {

    removeMessageBoxes();

    guidanceSteps.forEach(step => {

        if (step.condition && !step.condition()) return;

        const target = document.querySelector(step.target);

        if (!target) return;

        // Main message box
        const messageBox = document.createElement("div");
        messageBox.classList.add("guided-message");

        // Title
        const title = document.createElement("strong");
        title.textContent = step.title;
        messageBox.appendChild(title);

        // Tips
        step.tips.forEach(tip => {
            const paragraph = document.createElement("p");

            const heading = document.createElement("strong");
            heading.textContent = tip.heading;

            paragraph.appendChild(heading);
            paragraph.append(" " + tip.description);

            messageBox.appendChild(paragraph);
        });

        // Smaller note outside the box
        const note = document.createElement("p");
        note.classList.add("guided-note");
        note.textContent = step.note;

        // Insert elements
        target.insertAdjacentElement(
            step.position || "afterend",
            messageBox
        );

        messageBox.insertAdjacentElement("afterend", note);
    });
}

export function removeMessageBoxes() {
    document.querySelectorAll(".guided-message, .guided-note").forEach(element => {
        element.remove();
    });
}