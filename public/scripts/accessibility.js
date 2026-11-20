
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

    // Accessibility settings
    const scale = Math.max(
        0.9,
        Math.min(1.25, Number(settings.textSize) / 100 || 1)
    );

    const letterSpacing = Math.max(
        0,
        Math.min(0.5, Number(settings.letterSpacing) || 0)
    );

    const lineSpacing = Math.max(
        1.2,
        Math.min(1.8, Number(settings.lineSpacing) || 1.4)
    );

    const originalSizes = new WeakMap();

    function applySettings() {
        const root = document.querySelector(".phone-screen");

        if (!root) return;

        // Only change elements marked as important text
        const elements = root.querySelectorAll(
            "[data-accessible-text]"
        );

        elements.forEach(element => {

            // Protect interactive controls and navigation
            if (
                element.closest("[data-no-text-scaling]") ||
                element.closest(".bottom-nav") ||
                element.closest(".slide-to-pay")
            ) {
                return;
            }

            if (!originalSizes.has(element)) {
                const computed = window.getComputedStyle(element);

                originalSizes.set(
                    element,
                    parseFloat(computed.fontSize)
                );
            }

            const originalSize = originalSizes.get(element);

            if (!Number.isFinite(originalSize)) return;

            // Change font size
            element.style.fontSize =
                `${originalSize * scale}px`;

            // Change letter spacing
            element.style.letterSpacing =
                `${letterSpacing}px`;

            // Change line spacing
            element.style.lineHeight =
                String(lineSpacing);
        });
    }

    function initialise() {
        applySettings();

        const root = document.querySelector(".phone-screen");

        if (!root) return;

        // Apply settings to dynamically added content
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
