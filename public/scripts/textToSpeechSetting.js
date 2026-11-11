
const textToSpeechToggle = document.getElementById("textToSpeechToggle");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const backButton = document.getElementById("backButton");

// Load saved Text-to-Speech setting
const savedSetting = localStorage.getItem("ttsEnabled");

textToSpeechToggle.checked = savedSetting === "true";

// Update message based on toggle
function updateMessage() {
    if (textToSpeechToggle.checked) {
        messageTitle.textContent = "Text-to-Speech is on!";
        messageText.textContent =
            "You can now select text and use the voice button to hear it.";
    } else {
        messageTitle.textContent = "How It Helps";
        messageText.textContent =
            "Enable Text-to-Speech to listen to instructions and other text.";
    }
}

// Save setting when user changes toggle
textToSpeechToggle.addEventListener("change", function () {
    localStorage.setItem("ttsEnabled", textToSpeechToggle.checked);

    // Stop any speech when Text-to-Speech is disabled
    if (!textToSpeechToggle.checked && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    updateMessage();
});

// Display the correct message when page loads
updateMessage();

// Back button
backButton.addEventListener("click", function () {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "ocbcHome.html";
    }
});
