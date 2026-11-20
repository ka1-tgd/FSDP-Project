
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
            ...JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            )
        };
    } catch {
        settings = defaults;
    }

    if (settings.useDevice) return;

    const scale = Math.max(
        0.8,
        Math.min(1.4, Number(settings.textSize) / 100 || 1)
    );

    const letterSpacing = Math.max(
        0,
        Math.min(3, Number(settings.letterSpacing) || 0)
    );

    const lineSpacing = Math.max(
        1,
        Math.min(2, Number(settings.lineSpacing) || 1.4)
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

            if (
                element.closest("[data-no-text-scaling]") ||
                element.closest(".bottom-nav")
            ) {
                return;
            }

            // Remember original font size before changing it
            if (!originalSizes.has(element)) {
                const computed = window.getComputedStyle(element);
                originalSizes.set(
                    element,
                    parseFloat(computed.fontSize)
                );
            }

            const originalSize = originalSizes.get(element);

            if (!Number.isFinite(originalSize)) return;

            element.style.fontSize =
                `${originalSize * scale}px`;

            element.style.letterSpacing =
                `${letterSpacing}px`;

            element.style.lineHeight =
                String(lineSpacing);
        });
    }

    // Apply once the page is ready
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            applySettings
        );
    } else {
        applySettings();
    }

    // Also apply to content added later by JavaScript
    const observer = new MutationObserver(() => {
        applySettings();
    });

    const startObserver = () => {
        const root = document.querySelector(".phone-screen");

        if (root) {
            observer.observe(root, {
                childList: true,
                subtree: true
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            startObserver
        );
    } else {
        startObserver();
    }
})();
