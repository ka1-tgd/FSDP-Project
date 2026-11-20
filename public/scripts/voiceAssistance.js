
 // Voice Assistance for Guided Tips popups.
(function () {
    "use strict";

    const supported =
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window;

    const synth = supported ? window.speechSynthesis : null;

    const speeds = [0.5, 1, 1.5];

    let activePopup = null;
    let activeSpeech = null;
    let fullText = "";
    let startOffset = 0;
    let lastBoundary = 0;
    let state = "ready";
    let speechToken = 0;
    let availableVoices = [];

    // Save and load reading speed
    function savedSpeed() {
        const value = Number(localStorage.getItem("ttsSpeed"));
        return speeds.includes(value) ? value : 1;
    }

    function formatSpeed(speed) {
        return speed.toFixed(1) + "x";
    }

    // Load available browser voices
    function loadVoices() {
        if (!supported) return;
        availableVoices = synth.getVoices();
    }

    // Choose the most natural English voice available
    function chooseVoice() {
        loadVoices();

        const englishVoices = availableVoices.filter(
            voice => voice.lang.toLowerCase().startsWith("en")
        );

        if (!englishVoices.length) return null;

        // Preferred natural English voices
        const preferredNames = [
            "Microsoft Jenny Online (Natural)",
            "Microsoft Aria Online (Natural)",
            "Microsoft Sonia Online (Natural)",
            "Microsoft Jenny",
            "Microsoft Aria",
            "Microsoft Sonia",
            "Google UK English Female",
            "Google US English"
        ];

        // Find a preferred voice
        for (const name of preferredNames) {
            const voice = englishVoices.find(v =>
                v.name.toLowerCase().includes(name.toLowerCase())
            );

            if (voice) return voice;
        }

        // Find another natural or neural voice
        const naturalVoice = englishVoices.find(v =>
            /natural|neural|online/i.test(v.name)
        );

        if (naturalVoice) return naturalVoice;

        // Fall back to standard English voices
        return (
            englishVoices.find(
                v => v.lang.toLowerCase() === "en-sg"
            ) ||
            englishVoices.find(
                v => v.lang.toLowerCase() === "en-gb"
            ) ||
            englishVoices.find(
                v => v.lang.toLowerCase() === "en-us"
            ) ||
            englishVoices[0]
        );
    }

    if (supported) {
        loadVoices();

        if (typeof synth.addEventListener === "function") {
            synth.addEventListener("voiceschanged", loadVoices);
        }
    }

    // Update buttons and speed display
    function updateControls() {
        document.querySelectorAll(".guided-voice-controls")
            .forEach(controls => {
                const popup = controls.closest(".guided-popup");
                const isActive = popup === activePopup;

                const play = controls.querySelector(
                    ".guided-voice-play"
                );

                const replayButton = controls.querySelector(
                    ".guided-voice-replay"
                );

                const minus = controls.querySelector(
                    ".guided-voice-minus"
                );

                const plus = controls.querySelector(
                    ".guided-voice-plus"
                );

                const speedValue = controls.querySelector(
                    ".guided-voice-speed-value"
                );

                if (play) {
                    const isSpeaking =
                        isActive && state === "speaking";

                    const isPaused =
                        isActive && state === "paused";

                    play.textContent = isSpeaking ? "⏸" : "▶";

                    const label = isSpeaking
                        ? "Pause reading"
                        : isPaused
                            ? "Resume reading"
                            : "Read tips aloud";

                    play.setAttribute("aria-label", label);
                    play.title = label;
                    play.disabled = !supported;
                }

                if (replayButton) {
                    replayButton.disabled = !supported;
                }

                if (speedValue) {
                    speedValue.textContent =
                        formatSpeed(savedSpeed());
                }

                if (minus) {
                    minus.disabled =
                        savedSpeed() <= speeds[0];
                }

                if (plus) {
                    plus.disabled =
                        savedSpeed() >= speeds[speeds.length - 1];
                }
            });
    }

    // Stop speech and reset state
    function stop() {
        speechToken++;

        if (synth) {
            synth.cancel();
        }

        activePopup = null;
        activeSpeech = null;
        fullText = "";
        startOffset = 0;
        lastBoundary = 0;
        state = "ready";

        updateControls();
    }

    // Start reading from a specific position
    function readFrom(position) {
        if (!supported || !activePopup || !fullText) return;

        speechToken++;
        const token = speechToken;

        synth.cancel();

        startOffset = Math.max(
            0,
            Math.min(position, fullText.length)
        );

        lastBoundary = startOffset;

        if (startOffset >= fullText.length) {
            stop();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(
            fullText.slice(startOffset)
        );

        activeSpeech = utterance;

        const selectedVoice = chooseVoice();

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
        } else {
            utterance.lang = "en-SG";
        }

        utterance.rate = savedSpeed();
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onboundary = event => {
            if (
                token !== speechToken ||
                activeSpeech !== utterance
            ) return;

            if (typeof event.charIndex === "number") {
                lastBoundary = Math.min(
                    fullText.length,
                    startOffset + event.charIndex
                );
            }
        };

        utterance.onend = () => {
            if (
                token === speechToken &&
                activeSpeech === utterance
            ) {
                stop();
            }
        };

        utterance.onerror = event => {
            if (
                token !== speechToken ||
                activeSpeech !== utterance
            ) return;

            if (
                event.error !== "canceled" &&
                event.error !== "interrupted"
            ) {
                console.error(
                    "Voice Assistance error:",
                    event.error
                );
            }

            stop();
        };

        state = "speaking";
        updateControls();

        synth.speak(utterance);
    }

    // Get text from Guided Tips
    function getTipsText(popup) {
        const content = popup.querySelector(
            ".guided-voice-text"
        );

        return content
            ? content.innerText.trim()
            : "";
    }

    // Play, Pause or Resume
    function playOrPause(popup) {
        if (!supported) return;

        if (activePopup === popup && state === "speaking") {
            synth.pause();
            state = "paused";
            updateControls();
            return;
        }

        if (activePopup === popup && state === "paused") {
            synth.resume();
            state = "speaking";
            updateControls();
            return;
        }

        stop();

        activePopup = popup;
        fullText = getTipsText(popup);

        readFrom(0);
    }

    // Replay from the beginning
    function replay(popup) {
        if (!supported) return;

        stop();

        activePopup = popup;
        fullText = getTipsText(popup);

        readFrom(0);
    }

    // Increase or decrease reading speed
    function changeSpeed(popup, direction) {
        const currentIndex = speeds.indexOf(savedSpeed());

        const nextIndex = Math.max(
            0,
            Math.min(
                speeds.length - 1,
                currentIndex + direction
            )
        );

        const newSpeed = speeds[nextIndex];

        localStorage.setItem(
            "ttsSpeed",
            String(newSpeed)
        );

        if (activePopup === popup && state !== "ready") {
            const wasPaused = state === "paused";
            const resumePosition = lastBoundary;

            readFrom(resumePosition);

            if (wasPaused && activeSpeech) {
                const utterance = activeSpeech;
                const originalOnStart = utterance.onstart;

                utterance.onstart = event => {
                    if (originalOnStart) {
                        originalOnStart(event);
                    }

                    if (activeSpeech === utterance) {
                        synth.pause();
                        state = "paused";
                        updateControls();
                    }
                };
            }
        }

        updateControls();
    }

    // Attach button events
    function attach(popup) {
        if (popup.dataset.voiceAttached === "true") return;

        const controls = popup.querySelector(
            ".guided-voice-controls"
        );

        if (!controls) return;

        const play = controls.querySelector(
            ".guided-voice-play"
        );

        const replayButton = controls.querySelector(
            ".guided-voice-replay"
        );

        const minus = controls.querySelector(
            ".guided-voice-minus"
        );

        const plus = controls.querySelector(
            ".guided-voice-plus"
        );

        if (!play || !replayButton || !minus || !plus) return;

        popup.dataset.voiceAttached = "true";

        play.addEventListener("click", event => {
            event.stopPropagation();
            playOrPause(popup);
        });

        replayButton.addEventListener("click", event => {
            event.stopPropagation();
            replay(popup);
        });

        minus.addEventListener("click", event => {
            event.stopPropagation();
            changeSpeed(popup, -1);
        });

        plus.addEventListener("click", event => {
            event.stopPropagation();
            changeSpeed(popup, 1);
        });

        updateControls();
    }

    // Find new popups and stop speech when closed
    function scan() {
        document.querySelectorAll(".guided-popup").forEach(attach);

        if (
            activePopup &&
            (
                !activePopup.isConnected ||
                !activePopup.classList.contains("show")
            )
        ) {
            stop();
        }
    }

    const observer = new MutationObserver(scan);

    function initialize() {
        if (!document.body) return;

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });

        scan();
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

    window.addEventListener("pagehide", stop);
})();
