
/* ========================================
   OCBC Guided Tips Voice Assistance
   Four Languages + Resume After Speed Change
   ======================================== */

(function () {
    "use strict";

    const supported =
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window;

    const synth = supported ? window.speechSynthesis : null;

    const speeds = [0.5, 1, 1.5];

    const languageCodes = {
        en: "en-SG",
        zh: "zh-CN",
        ms: "ms-MY",
        ta: "ta-IN"
    };

    const labels = {
        en: {
            play: "Read tips aloud",
            pause: "Pause reading",
            resume: "Resume reading",
            replay: "Replay tips",
            slower: "Decrease reading speed",
            faster: "Increase reading speed"
        },

        zh: {
            play: "朗读提示",
            pause: "暂停朗读",
            resume: "继续朗读",
            replay: "重新朗读",
            slower: "降低朗读速度",
            faster: "提高朗读速度"
        },

        ms: {
            play: "Baca petua dengan kuat",
            pause: "Jeda bacaan",
            resume: "Sambung bacaan",
            replay: "Baca semula",
            slower: "Kurangkan kelajuan bacaan",
            faster: "Tingkatkan kelajuan bacaan"
        },

        ta: {
            play: "உதவிக்குறிப்புகளைப் படிக்கவும்",
            pause: "வாசிப்பை இடைநிறுத்தவும்",
            resume: "வாசிப்பைத் தொடரவும்",
            replay: "மீண்டும் படிக்கவும்",
            slower: "வாசிப்பு வேகத்தைக் குறைக்கவும்",
            faster: "வாசிப்பு வேகத்தை அதிகரிக்கவும்"
        }
    };

    let activePopup = null;
    let activeSpeech = null;

    let fullText = "";
    let startOffset = 0;
    let lastBoundary = 0;

    let state = "ready";
    let speechToken = 0;
    let availableVoices = [];

    /* ========================================
       Language
       ======================================== */

    function getLanguage() {
        const saved =
            localStorage.getItem("preferredLanguage") || "en";

        return languageCodes[saved] ? saved : "en";
    }

    function getLabels() {
        return labels[getLanguage()];
    }

    /* ========================================
       Reading Speed
       ======================================== */

    function savedSpeed() {
        const value = Number(localStorage.getItem("ttsSpeed"));

        return speeds.includes(value) ? value : 1;
    }

    function formatSpeed(speed) {
        return speed.toFixed(1) + "x";
    }

    /* ========================================
       Browser Voices
       ======================================== */

    function loadVoices() {
        if (!supported) return;

        availableVoices = synth.getVoices();
    }

    function chooseVoice() {
        loadVoices();

        const language = getLanguage();
        const preferredCode = languageCodes[language];
        const prefix = preferredCode.split("-")[0].toLowerCase();

        const matching = availableVoices.filter(voice =>
            voice.lang.toLowerCase().startsWith(prefix)
        );

        if (matching.length === 0) {
            console.warn(
                "Voice Assistance: No matching voice for",
                preferredCode
            );

            return null;
        }

        return (
            matching.find(voice =>
                voice.lang.toLowerCase() ===
                preferredCode.toLowerCase()
            ) ||
            matching.find(voice =>
                /natural|neural|online/i.test(voice.name)
            ) ||
            matching[0]
        );
    }

    if (supported) {
        loadVoices();

        if (typeof synth.addEventListener === "function") {
            synth.addEventListener("voiceschanged", loadVoices);
        }
    }

    /* ========================================
       Update Voice Controls
       ======================================== */

    function updateControls() {
        document.querySelectorAll(".guided-voice-controls")
            .forEach(function (controls) {

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

                const text = getLabels();

                if (play) {
                    const speaking =
                        isActive && state === "speaking";

                    const paused =
                        isActive && state === "paused";

                    play.textContent = speaking ? "⏸" : "▶";

                    const label = speaking
                        ? text.pause
                        : paused
                            ? text.resume
                            : text.play;

                    play.title = label;
                    play.setAttribute("aria-label", label);
                    play.disabled = !supported;
                }

                if (replayButton) {
                    replayButton.title = text.replay;
                    replayButton.setAttribute(
                        "aria-label",
                        text.replay
                    );

                    replayButton.disabled = !supported;
                }

                if (speedValue) {
                    speedValue.textContent =
                        formatSpeed(savedSpeed());
                }

                if (minus) {
                    minus.title = text.slower;
                    minus.setAttribute(
                        "aria-label",
                        text.slower
                    );

                    minus.disabled =
                        savedSpeed() <= speeds[0];
                }

                if (plus) {
                    plus.title = text.faster;
                    plus.setAttribute(
                        "aria-label",
                        text.faster
                    );

                    plus.disabled =
                        savedSpeed() >= speeds[speeds.length - 1];
                }
            });
    }

    /* ========================================
       Stop and Reset Speech
       ======================================== */

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

    /* ========================================
       Start Reading From Position
       ======================================== */

    function readText(position = 0, pauseAfterStart = false) {
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
            utterance.lang = languageCodes[getLanguage()];
        }

        utterance.rate = savedSpeed();
        utterance.pitch = 1;
        utterance.volume = 1;

        /* Track current reading position */
        utterance.onboundary = function (event) {
            if (
                token !== speechToken ||
                activeSpeech !== utterance
            ) {
                return;
            }

            if (typeof event.charIndex === "number") {
                lastBoundary = Math.min(
                    fullText.length,
                    startOffset + event.charIndex
                );
            }
        };

        /* Keep paused state after speed change */
        utterance.onstart = function () {
            if (
                token !== speechToken ||
                activeSpeech !== utterance
            ) {
                return;
            }

            if (pauseAfterStart) {
                synth.pause();
                state = "paused";
                updateControls();
            }
        };

        /* Speech finished */
        utterance.onend = function () {
            if (
                token === speechToken &&
                activeSpeech === utterance
            ) {
                stop();
            }
        };

        /* Speech error */
        utterance.onerror = function (event) {
            if (
                token !== speechToken ||
                activeSpeech !== utterance
            ) {
                return;
            }

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

        state = pauseAfterStart ? "paused" : "speaking";
        updateControls();

        synth.speak(utterance);
    }

    /* ========================================
       Get Guided Tips Text
       ======================================== */

    function getTipsText(popup) {
        const content = popup.querySelector(
            ".guided-voice-text"
        );

        return content
            ? content.innerText.trim()
            : "";
    }

    /* ========================================
       Play / Pause / Resume
       ======================================== */

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

        readText(0);
    }

    /* ========================================
       Replay From Beginning
       ======================================== */

    function replay(popup) {
        if (!supported) return;

        stop();

        activePopup = popup;
        fullText = getTipsText(popup);

        readText(0);
    }

    /* ========================================
       Change Speed Without Restarting
       ======================================== */

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

        if (newSpeed === savedSpeed()) return;

        localStorage.setItem(
            "ttsSpeed",
            String(newSpeed)
        );

        if (activePopup === popup && state !== "ready") {
            const wasPaused = state === "paused";

            const resumePosition = lastBoundary;

            readText(resumePosition, wasPaused);
        }

        updateControls();
    }

    /* ========================================
       Attach Voice Button Events
       ======================================== */

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

        play.addEventListener("click", function (event) {
            event.stopPropagation();
            playOrPause(popup);
        });

        replayButton.addEventListener("click", function (event) {
            event.stopPropagation();
            replay(popup);
        });

        minus.addEventListener("click", function (event) {
            event.stopPropagation();
            changeSpeed(popup, -1);
        });

        plus.addEventListener("click", function (event) {
            event.stopPropagation();
            changeSpeed(popup, 1);
        });

        updateControls();
    }

    /* ========================================
       Find Popups and Stop When Closed
       ======================================== */

    function scan() {
        document.querySelectorAll(".guided-popup")
            .forEach(attach);

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

    /* ========================================
       Initialization
       ======================================== */

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
