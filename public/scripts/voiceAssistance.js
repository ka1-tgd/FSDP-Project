
 // Voice Assistance

const ttsEnabled = localStorage.getItem("ttsEnabled") === "true";
const speechSupported =
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

if (ttsEnabled && speechSupported) {

    const synth = window.speechSynthesis;

    // SVG Icons
    const icons = {
        ready: `<svg width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4V5Z"/>
            <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
            <path d="M19 5a10 10 0 0 1 0 14"/>
        </svg>`,

        speaking: `<svg width="28" height="28" viewBox="0 0 24 24"
            fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>`,

        paused: `<svg width="28" height="28" viewBox="0 0 24 24"
            fill="currentColor">
            <path d="M7 4v16l13-8L7 4Z"/>
        </svg>`
    };

    // Floating Voice Button
    const voiceButton = document.createElement("button");
    voiceButton.id = "voiceButton";
    voiceButton.type = "button";
    voiceButton.innerHTML = icons.ready;
    voiceButton.setAttribute("aria-label", "Read selected text");

    const paynowPage = document.querySelector(".phone-screen");

    if (paynowPage) {
        paynowPage.appendChild(voiceButton);
    }

    // Reading Speed Selector
    const speedSelector = document.createElement("select");
    speedSelector.id = "ttsSpeed";
    speedSelector.setAttribute("aria-label", "Reading speed");

    const speeds = [
        { value: "0.5", label: "0.5×" },
        { value: "1", label: "1×" },
        { value: "1.5", label: "1.5×" }
    ];

    speeds.forEach(function (speed) {
        const option = document.createElement("option");
        option.value = speed.value;
        option.textContent = speed.label;
        speedSelector.appendChild(option);
    });

    const savedSpeed = localStorage.getItem("ttsSpeed");

    speedSelector.value = speeds.some(
        speed => speed.value === savedSpeed
    ) ? savedSpeed : "1";

    if (paynowPage) {
        paynowPage.appendChild(speedSelector);
    }

    // Speech Variables
    let selectedText = "";
    let fullText = "";
    let currentSpeech = null;
    let speechState = "ready";

    // Current Reading Position
    let currentPosition = 0;
    let utteranceStart = 0;
    let lastBoundaryPosition = 0;

    // Update Button Icon
    function updateButton(state) {
        speechState = state;

        if (state === "speaking") {
            voiceButton.innerHTML = icons.speaking;
            voiceButton.setAttribute("aria-label", "Pause reading");

        } else if (state === "paused") {
            voiceButton.innerHTML = icons.paused;
            voiceButton.setAttribute("aria-label", "Resume reading");

        } else {
            voiceButton.innerHTML = icons.ready;
            voiceButton.setAttribute("aria-label", "Read selected text");
        }
    }

    // Remember Selected Text
    document.addEventListener("selectionchange", function () {
        const selection = window.getSelection();
        const text = selection ? selection.toString().trim() : "";

        if (text !== "") {
            selectedText = text;
        }
    });

    // Start Speech From Specific Position
    function startSpeech(startPosition) {

        // Ignore events from previous speech
        currentSpeech = null;
        synth.cancel();

        if (!fullText) {
            updateButton("ready");
            return;
        }

        currentPosition = Math.min(
            Math.max(startPosition, 0),
            fullText.length
        );

        if (currentPosition >= fullText.length) {
            updateButton("ready");
            return;
        }

        utteranceStart = currentPosition;
        lastBoundaryPosition = currentPosition;

        const remainingText = fullText.slice(currentPosition);

        const speech = new SpeechSynthesisUtterance(remainingText);
        currentSpeech = speech;

        speech.lang = "en-SG";
        speech.rate = Number(speedSelector.value);

        // Track Current Word Position
        speech.onboundary = function (event) {
            if (currentSpeech !== speech) {
                return;
            }

            if (typeof event.charIndex === "number") {
                const position = utteranceStart + event.charIndex;

                lastBoundaryPosition = Math.min(
                    position,
                    fullText.length
                );
            }
        };

        // Speech Finished
        speech.onend = function () {
            if (currentSpeech !== speech) {
                return;
            }

            currentPosition = fullText.length;
            currentSpeech = null;
            updateButton("ready");
        };

        // Speech Error
        speech.onerror = function () {
            if (currentSpeech !== speech) {
                return;
            }

            currentSpeech = null;
            updateButton("ready");
        };

        updateButton("speaking");
        synth.speak(speech);
    }
    // Custom Popup Modal
function showVoicePopup() {
    if (document.getElementById("voicePopup")) return;

    const popup = document.createElement("div");
    popup.id = "voicePopup";

    popup.innerHTML = `
        <div class="voice-popup-box" role="dialog"
             aria-modal="true"
             aria-labelledby="voicePopupTitle"
             aria-describedby="voicePopupDescription">

            <button class="voice-popup-close"
                    type="button"
                    aria-label="Close popup">×</button>

            <div class="voice-popup-icon">
                ${icons.ready}
            </div>

            <h2 id="voicePopupTitle">Select Text First</h2>

            <p id="voicePopupDescription">
                Please highlight the text you would like to hear,
                then tap the voice button to start reading.
            </p>

            <button class="voice-popup-confirm" type="button">
                Got It
            </button>
        </div>
    `;

    document.body.appendChild(popup);

    const closeButton = popup.querySelector(".voice-popup-close");
    const confirmButton = popup.querySelector(".voice-popup-confirm");

    const previousFocus = document.activeElement;

    function closePopup() {
        document.removeEventListener("keydown", handleKeydown);
        popup.remove();
        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }
    }

    function handleKeydown(event) {
        if (event.key === "Escape") {
            closePopup();
        }

        if (event.key === "Tab") {
            const buttons = [closeButton, confirmButton];
            const index = buttons.indexOf(document.activeElement);

            if (event.shiftKey && index <= 0) {
                event.preventDefault();
                confirmButton.focus();
            } else if (!event.shiftKey && index === buttons.length - 1) {
                event.preventDefault();
                closeButton.focus();
            }
        }
    }

    closeButton.addEventListener("click", closePopup);
    confirmButton.addEventListener("click", closePopup);

    popup.addEventListener("click", function (event) {
        if (event.target === popup) {
            closePopup();
        }
    });

    document.addEventListener("keydown", handleKeydown);
    confirmButton.focus();
}

    // Floating Voice Button Click
    voiceButton.addEventListener("click", function () {

        // Speaking -> Pause
        if (speechState === "speaking") {
            synth.pause();
            updateButton("paused");
            return;
        }

        // Paused -> Resume
        if (speechState === "paused") {
            synth.resume();
            updateButton("speaking");
            return;
        }

        // Ready -> Start Reading
        if (!selectedText) {
            showVoicePopup();
            return;
        }

        fullText = selectedText;
        currentPosition = 0;
        lastBoundaryPosition = 0;

        startSpeech(0);
    });

    // Change Reading Speed During Speech
    speedSelector.addEventListener("change", function () {

        localStorage.setItem("ttsSpeed", speedSelector.value);

        if (speechState === "speaking" ||
            speechState === "paused") {

            const wasPaused = speechState === "paused";

            // Continue From Latest Word Position
            currentPosition = lastBoundaryPosition;

            startSpeech(currentPosition);

            // Keep Paused State
            if (wasPaused) {
                synth.pause();
                updateButton("paused");
            }
        }
    });

    // Stop Speech When Leaving Page
    window.addEventListener("pagehide", function () {
        currentSpeech = null;
        synth.cancel();
    });
}
