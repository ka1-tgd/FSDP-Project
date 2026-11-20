
(function () {
    const STORAGE_KEY = "ocbcTextSettings";

    // Default settings
    const defaults = {
        useDevice: false,
        textSize: 100,
        letterSpacing: 0,
        lineSpacing: 1.4
    };

    // Get elements
    const textSizeSlider =
        document.getElementById("textSizeSlider");

    const letterSpacingSlider =
        document.getElementById("letterSpacingSlider");

    const lineSpacingSlider =
        document.getElementById("lineSpacingSlider");

    const textSizeValue =
        document.getElementById("textSizeValue");

    const letterSpacingValue =
        document.getElementById("letterSpacingValue");

    const lineSpacingValue =
        document.getElementById("lineSpacingValue");

    const deviceTextSize =
        document.getElementById("deviceTextSize");

    const settingsSliders =
        document.getElementById("settingsSliders");

    const previewHeading =
        document.getElementById("previewHeading");

    const previewText =
        document.getElementById("previewText");

    const saveButton =
        document.getElementById("saveSettings");

    const resetButton =
        document.getElementById("resetSettings");

    // Limit values to allowed ranges
    function clamp(value, min, max, fallback) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        return Math.max(min, Math.min(max, number));
    }

    // Load saved settings
    let settings = { ...defaults };

    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

        settings = {
            ...defaults,
            ...saved
        };

    } catch (error) {
        console.error("Unable to load text settings:", error);
    }

    // Load values into sliders
    textSizeSlider.value = clamp(
        settings.textSize, 90, 115, 100
    );

    letterSpacingSlider.value = clamp(
        settings.letterSpacing, 0, 2, 0
    );

    lineSpacingSlider.value = clamp(
        settings.lineSpacing, 1, 1.5, 1.4
    );

    deviceTextSize.checked = Boolean(settings.useDevice);

    // Update labels and preview
    function updatePreview() {
        const textSize = Number(textSizeSlider.value);
        const letterSpacing =
            Number(letterSpacingSlider.value);
        const lineSpacing =
            Number(lineSpacingSlider.value);

        // Display current values
        textSizeValue.textContent = `${textSize}%`;

        letterSpacingValue.textContent =
            `${letterSpacing.toFixed(1)}px`;

        lineSpacingValue.textContent =
            lineSpacing.toFixed(1);

        // Disable sliders when using device settings
        const useDevice = deviceTextSize.checked;

        textSizeSlider.disabled = useDevice;
        letterSpacingSlider.disabled = useDevice;
        lineSpacingSlider.disabled = useDevice;

        settingsSliders.style.opacity =
            useDevice ? "0.5" : "1";

        // Preview heading
        previewHeading.style.fontSize = useDevice
            ? ""
            : `${20 * textSize / 100}px`;

        // Preview paragraph
        previewText.style.fontSize = useDevice
            ? ""
            : `${16 * textSize / 100}px`;

        // Letter spacing
        previewHeading.style.letterSpacing = useDevice
            ? ""
            : `${letterSpacing}px`;

        previewText.style.letterSpacing = useDevice
            ? ""
            : `${letterSpacing}px`;

        // Line spacing
        previewHeading.style.lineHeight = useDevice
            ? ""
            : String(lineSpacing);

        previewText.style.lineHeight = useDevice
            ? ""
            : String(lineSpacing);
    }

    // Live preview when sliders change
    [
        textSizeSlider,
        letterSpacingSlider,
        lineSpacingSlider
    ].forEach(slider => {
        slider.addEventListener("input", updatePreview);
    });

    // Device settings toggle
    deviceTextSize.addEventListener(
        "change",
        updatePreview
    );

    // Reset to default
    resetButton.addEventListener("click", () => {
        textSizeSlider.value = defaults.textSize;
        letterSpacingSlider.value = defaults.letterSpacing;
        lineSpacingSlider.value = defaults.lineSpacing;

        deviceTextSize.checked = defaults.useDevice;

        updatePreview();
    });

    // Save settings
    saveButton.addEventListener("click", () => {
        const newSettings = {
            useDevice: deviceTextSize.checked,

            textSize: clamp(
                textSizeSlider.value, 90, 115, 100
            ),

            letterSpacing: clamp(
                letterSpacingSlider.value, 0, 2, 0
            ),

            lineSpacing: clamp(
                lineSpacingSlider.value, 1, 1.5, 1.4
            )
        };

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(newSettings)
        );

        // Return to More page
        window.location.href = "more.html";
    });

    // Show existing saved settings
    updatePreview();
})();
