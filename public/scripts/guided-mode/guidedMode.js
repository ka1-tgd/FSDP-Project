const STORAGE_KEY = "guidedMode";

// Check if Guided Mode is enabled
export function guidedModeCheck() {
    return localStorage.getItem(STORAGE_KEY) === "true";
};

// Enable guided mode
export function setGuidedMode(enabled) {
    localStorage.setItem(STORAGE_KEY, enabled);
}