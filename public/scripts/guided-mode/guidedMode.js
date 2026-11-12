const STORAGE_KEY = "guidedMode";

// Function to check if Guided Mode is enabled
export function guidedModeCheck() {
    return localStorage.getItem(STORAGE_KEY) === "true";
};

// Function to enable guided mode
export function setGuidedMode(enabled) {
    localStorage.setItem(STORAGE_KEY, enabled);
}