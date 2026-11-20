
const STORAGE_KEY = "ocbcTextSettings";

const defaultSettings = {
    useDevice: false,
    textSize: 100,
    letterSpacing: 0,
    lineSpacing: 1.4
};

// Get elements
const deviceToggle = document.getElementById("deviceTextSize");

const textSizeSlider = document.getElementById("textSizeSlider");
const letterSpacingSlider = document.getElementById("letterSpacingSlider");
const lineSpacingSlider = document.getElementById("lineSpacingSlider");

const textSizeValue = document.getElementById("textSizeValue");
const letterSpacingValue = document.getElementById("letterSpacingValue");
const lineSpacingValue = document.getElementById("lineSpacingValue");

const settingsSliders = document.getElementById("settingsSliders");

const previewHeading = document.getElementById("previewHeading");
const previewText = document.getElementById("previewText");

const resetButton = document.getElementById("resetSettings");
const saveButton = document.getElementById("saveSettings");

// Restrict values to safe limits
function clamp(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number)
        ? Math.min(max, Math.max(min, number))
        : fallback;
}

// Read saved settings
function getSavedSettings() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

        return {
            useDevice: saved.useDevice === true,
            textSize: clamp(saved.textSize, 90, 115, 100),
            letterSpacing: clamp(saved.letterSpacing, 0, 0.5, 0),
            lineSpacing: clamp(saved.lineSpacing, 1.2, 1.6, 1.4)
        };
    } catch {
        return { ...defaultSettings };
    }
}

// Load values into sliders
function setControls(settings) {
    deviceToggle.checked = settings.useDevice;
    textSizeSlider.value = settings.textSize;
    letterSpacingSlider.value = settings.letterSpacing;
    lineSpacingSlider.value = settings.lineSpacing;

    updatePreview();
}

// Update live preview
function updatePreview() {
    const useDevice = deviceToggle.checked;

    const textSize = useDevice
        ? 100
        : Number(textSizeSlider.value);

    const letterSpacing = useDevice
        ? 0
        : Number(letterSpacingSlider.value);

    const lineSpacing = useDevice
        ? 1.4
        : Number(lineSpacingSlider.value);

    // Update displayed values
    textSizeValue.textContent = `${textSize}%`;
    letterSpacingValue.textContent =
        `${letterSpacing.toFixed(1)}px`;
    lineSpacingValue.textContent =
        lineSpacing.toFixed(1);

    // Disable sliders when using default device settings
    settingsSliders.classList.toggle("disabled", useDevice);

    textSizeSlider.disabled = useDevice;
    letterSpacingSlider.disabled = useDevice;
    lineSpacingSlider.disabled = useDevice;

    // Update preview font size
    previewHeading.style.fontSize =
        `${16 * textSize / 100}px`;

    previewText.style.fontSize =
        `${13 * textSize / 100}px`;

    // Update preview letter spacing
    previewHeading.style.letterSpacing =
        `${letterSpacing}px`;

    previewText.style.letterSpacing =
        `${letterSpacing}px`;

    // Update preview line spacing
    previewHeading.style.lineHeight =
        String(lineSpacing);

    previewText.style.lineHeight =
        String(lineSpacing);
}

// Live updates when moving sliders
textSizeSlider.addEventListener("input", updatePreview);
letterSpacingSlider.addEventListener("input", updatePreview);
lineSpacingSlider.addEventListener("input", updatePreview);

deviceToggle.addEventListener("change", updatePreview);

// Reset to defaults
resetButton.addEventListener("click", () => {
    setControls(defaultSettings);
});

// Save changes
saveButton.addEventListener("click", () => {
    const settings = {
        useDevice: deviceToggle.checked,
        textSize: Number(textSizeSlider.value),
        letterSpacing: Number(letterSpacingSlider.value),
        lineSpacing: Number(lineSpacingSlider.value)
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
    );

    window.location.href = "more.html";
});

// Load preferences on page opening
setControls(getSavedSettings());
