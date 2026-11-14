
// Voice Assistance for Guided Tips popups.
// This script is loaded as a normal (non-module) script on PayNow pages.
(function () {
    "use strict";

    const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    const synth = supported ? window.speechSynthesis : null;
    const speeds = ["0.5", "1", "1.5"];
    let activePopup = null;
    let activeSpeech = null;
    let fullText = "";
    let startOffset = 0;
    let lastBoundary = 0;
    let state = "ready";
    let speechToken = 0;

    function savedSpeed() {
        const value = localStorage.getItem("ttsSpeed");
        return speeds.includes(value) ? value : "1";
    }

    function updateControls() {
        document.querySelectorAll(".guided-voice-controls").forEach(controls => {
            const popup = controls.closest(".guided-popup");
            const isActive = popup === activePopup;
            const play = controls.querySelector(".guided-voice-play");
            const replay = controls.querySelector(".guided-voice-replay");
            const speed = controls.querySelector(".guided-voice-speed");

            if (!play || !replay || !speed) return;

            play.textContent = isActive && state === "speaking"
                ? "⏸"
                : isActive && state === "paused"
                    ? "▶"
                    : "🔊";

            play.setAttribute(
                "aria-label",
                isActive && state === "speaking"
                    ? "Pause reading"
                    : isActive && state === "paused"
                        ? "Resume reading"
                        : "Read tips aloud"
            );

            play.title = play.getAttribute("aria-label");
            replay.disabled = !supported;
            play.disabled = !supported;
            speed.value = savedSpeed();
        });
    }

    function stop() {
        speechToken++;
        activeSpeech = null;

        if (synth) synth.cancel();

        activePopup = null;
        fullText = "";
        startOffset = 0;
        lastBoundary = 0;
        state = "ready";

        updateControls();
    }

    function readFrom(position) {
        if (!supported || !activePopup || !fullText) return;

        speechToken++;
        const token = speechToken;

        activeSpeech = null;
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
        utterance.lang = "en-SG";
        utterance.rate = Number(savedSpeed());

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

        utterance.onerror = () => {
            if (
                token === speechToken &&
                activeSpeech === utterance
            ) {
                stop();
            }
        };

        state = "speaking";
        updateControls();

        synth.speak(utterance);
    }

    function getTipsText(popup) {
        const content = popup.querySelector(".guided-voice-text");

        return content
            ? content.innerText.trim()
            : "";
    }

    function playOrPause(popup) {
        if (!supported) return;

        if (
            activePopup === popup &&
            state === "speaking"
        ) {
            synth.pause();
            state = "paused";
            updateControls();
            return;
        }

        if (
            activePopup === popup &&
            state === "paused"
        ) {
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

    function replay(popup) {
        if (!supported) return;

        stop();

        activePopup = popup;
        fullText = getTipsText(popup);

        readFrom(0);
    }

    function attach(popup) {
        if (popup.dataset.voiceAttached === "true") return;

        const controls = popup.querySelector(
            ".guided-voice-controls"
        );

        if (!controls) return;

        popup.dataset.voiceAttached = "true";

        const play = controls.querySelector(
            ".guided-voice-play"
        );

        const replayButton = controls.querySelector(
            ".guided-voice-replay"
        );

        const speed = controls.querySelector(
            ".guided-voice-speed"
        );

        play.addEventListener("click", () => {
            playOrPause(popup);
        });

        replayButton.addEventListener("click", () => {
            replay(popup);
        });

        speed.value = savedSpeed();

        speed.addEventListener("change", () => {
            localStorage.setItem("ttsSpeed", speed.value);

            if (
                activePopup === popup &&
                state !== "ready"
            ) {
                const wasPaused = state === "paused";

                // Browser word-boundary support varies.
                // Without boundaries, speech restarts from the beginning.
                readFrom(lastBoundary);

                if (wasPaused) {
                    synth.pause();
                    state = "paused";
                }
            }

            updateControls();
        });

        updateControls();
    }

    // Guided popups are inserted dynamically.
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
