
const STORAGE_KEY = "ocbcTextSettings";

const defaultSettings = {
    useDevice: false,
    textSize: 100,
    letterSpacing: 0,
    lineSpacing: 1.4
};

const deviceToggle = document.getElementById("deviceTextSize");
const textSizeSlider = document.getElementById("textSizeSlider");
const letterSpacingSlider = document.getElementById("letterSpacingSlider");
const lineSpacingSlider = document.getElementById("lineSpacingSlider");

const textSizeValue = document.getElementById("textSizeValue");
const letterSpacingValue = document.getElementById("letterSpacingValue");
const lineSpacingValue = document.getElementById("lineSpacingValue");

const previewHeading = document.getElementById("previewHeading");
const previewText = document.getElementById("previewText");
const settingsSliders = document.getElementById("settingsSliders");

function getSettings() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

        return {
            ...defaultSettings,
            ...saved
        };
    } catch {
        return { ...defaultSettings };
    }
}

// Load saved preferences
function loadSettings() {
    const settings = getSettings();

    deviceToggle.checked = settings.useDevice;
    textSizeSlider.value = settings.textSize;
    letterSpacingSlider.value = settings.letterSpacing;
    lineSpacingSlider.value = settings.lineSpacing;

    updatePreview();
}

// Update preview as sliders move
function updatePreview() {
    const useDevice = deviceToggle.checked;

    const size = useDevice
        ? 100
        : Number(textSizeSlider.value);

    const letter = useDevice
        ? 0
        : Number(letterSpacingSlider.value);

    const line = useDevice
        ? 1.4
        : Number(lineSpacingSlider.value);

    textSizeValue.textContent = `${textSizeSlider.value}%`;
    letterSpacingValue.textContent = `${letterSpacingSlider.value}px`;
    lineSpacingValue.textContent = lineSpacingSlider.value;

    settingsSliders.classList.toggle("disabled", useDevice);

    [textSizeSlider, letterSpacingSlider, lineSpacingSlider]
        .forEach(slider => {
            slider.disabled = useDevice;
        });

    // Live preview
    previewHeading.style.fontSize = `${16 * size / 100}px`;
    previewText.style.fontSize = `${13 * size / 100}px`;

    previewHeading.style.letterSpacing = `${letter}px`;
    previewText.style.letterSpacing = `${letter}px`;

    previewHeading.style.lineHeight = String(line);
    previewText.style.lineHeight = String(line);
}

// Slider listeners
textSizeSlider.addEventListener("input", updatePreview);
letterSpacingSlider.addEventListener("input", updatePreview);
lineSpacingSlider.addEventListener("input", updatePreview);
deviceToggle.addEventListener("change", updatePreview);

// Save settings
document.getElementById("saveSettings")
    .addEventListener("click", () => {

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

// Reset settings
document.getElementById("resetSettings")
    .addEventListener("click", () => {

        deviceToggle.checked = false;
        textSizeSlider.value = 100;
        letterSpacingSlider.value = 0;
        lineSpacingSlider.value = 1.4;

        updatePreview();
    });

// Initial load
loadSettings();
