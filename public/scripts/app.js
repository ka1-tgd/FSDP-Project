console.log("Frontend app.js is running!");
import { initializeGuidedMode } from "./guided-mode/guidedModeInit.js";

import {
    guidedModeCheck,
    setGuidedMode
} from "./guided-mode/guidedMode.js";

// Initialize Guided Mode
initializeGuidedMode();

// Settings page toggle
const toggle = document.getElementById("guidedModeToggle");

if (toggle) {
    toggle.checked = guidedModeCheck();

    toggle.addEventListener("change", () => {
        setGuidedMode(toggle.checked);
    });
}