// Save guided mode settings
// Import guided mode functions
import {
    guidedModeCheck,
    setGuidedMode
} from "./guided-mode/guidedMode.js"

// Get toggle from DOM
const toggle = document.getElementById("guidedModeToggle");

// Load previously saved setting
toggle.checked = guidedModeCheck();

// Update setting when toggled
toggle.addEventListener("change", () => {
    setGuidedMode(toggle.checked);
});