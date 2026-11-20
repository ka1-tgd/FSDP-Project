
(function () {
    const STORAGE_KEY = "ocbcTextSettings";

    const defaults = {
        useDevice: false,
        textSize: 100,
        letterSpacing: 0,
        lineSpacing: 1.4
    };

    let settings;

    try {
        settings = {
            ...defaults,
            ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
        };
    } catch {
        settings = { ...defaults };
    }

    if (settings.useDevice) return;

    // Text size: 80% to 140%
const scale = Math.max(
    0.9,
    Math.min(1.15, Number(settings.textSize) / 100 || 1)
);

const letterSpacing = Math.max(
    0,
    Math.min(2, Number(settings.letterSpacing) || 0)
);

const lineSpacing = Math.max(
    1,
    Math.min(1.5, Number(settings.lineSpacing) || 1.4)
);
    const originalSizes = new WeakMap();

    function applySettings() {
        const root = document.querySelector(".phone-screen");

        if (!root) return;

        const elements = root.querySelectorAll(
            "h1, h2, h3, h4, h5, h6, p, span, a, button, " +
            "label, summary, input, textarea, select, li, td, th"
        );

        elements.forEach(element => {

            // Protect Slide to Pay and explicitly excluded areas
            if (
                element.closest(".slide-to-pay") ||
                element.closest("[data-no-text-scaling]") ||
                element.closest(".quick-actions")
            ) {
                return;
            }

            // Store the original font size
            if (!originalSizes.has(element)) {
                const computed = window.getComputedStyle(element);

                originalSizes.set(
                    element,
                    parseFloat(computed.fontSize)
                );
            }

            const originalSize = originalSizes.get(element);

            if (!Number.isFinite(originalSize)) return;

            // Apply text size
            element.style.fontSize =
                `${originalSize * scale}px`;

            // Apply letter spacing
            element.style.letterSpacing =
                `${letterSpacing}px`;

            // Apply line spacing
            element.style.lineHeight =
                String(lineSpacing);
        });
    }

    function initialise() {
        applySettings();

        const root = document.querySelector(".phone-screen");

        if (!root) return;

        // Handle content added dynamically
        const observer = new MutationObserver(() => {
            applySettings();
        });

        observer.observe(root, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialise
        );
    } else {
        initialise();
    }
})();
