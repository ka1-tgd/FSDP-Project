// Import checking functions
import { guidedModeCheck } from "./guidedMode.js"

// Import guidances
import { paynowSentGuidance } from "./pages/paynowSentGuidance.js";

// Import message creation and removal functions
import {
    createMessageBoxes,
    removeMessageBoxes
} from "./guidedMsgBoxes.js";

// Connect page identifier to guidance message
const pageGuidance = {
    paynowSent: paynowSentGuidance
}

// Function to initialize Guided Mode on the current page
export function initializeGuidedMode() {
    // Check if guided mode is enabled
    const enabled = guidedModeCheck();

    // Stop function if not enabled
    if (!enabled) return;

    // Identify current page and retrieve its guidance
    const currentPage = document.body.dataset.page;
    const guidance = pageGuidance[currentPage];

    // If guidance is available, create messages
    if (guidance) {
        createMessageBoxes(guidance);
    }
}