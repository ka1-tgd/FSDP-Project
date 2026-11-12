// Import guided mode initialization function
import { initializeGuidedMode } from "./guided-mode/guidedModeInit.js";

// Import guided mode functions
import {
    guidedModeCheck,
    setGuidedMode
} from "./guided-mode/guidedMode.js";

// Initialize Guided Mode
initializeGuidedMode();

// Settings page toggle
const toggle = document.getElementById("guidedModeToggle");

if (toggle) {
    // Load previously saved setting
    toggle.checked = guidedModeCheck();

    // Update setting when toggled
    toggle.addEventListener("change", () => {
        setGuidedMode(toggle.checked);
        initializeGuidedMode();
    });
}