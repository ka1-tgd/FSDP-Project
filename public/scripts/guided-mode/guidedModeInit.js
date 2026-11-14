// Import guidances
import { paynowSentGuidance } from "./pages/paynowSentGuidance.js";
import { transferAmountGuidance } from "./pages/transferAmountGuidance.js";

// Import message creation and removal functions
import {
    createMessageBoxes
} from "./guidedMsgBoxes.js";

// Connect page identifier to guidance message
const pageGuidance = {
    paynowSent: paynowSentGuidance,
    transferAmount: transferAmountGuidance
}

// Function to initialize Guided Mode on the current page
export function initializeGuidedMode() {
    // Identify current page and retrieve its guidance
    const currentPage = document.body.dataset.page;
    const guidance = pageGuidance[currentPage];

    // If guidance is available, create messages
    if (guidance) {
        createMessageBoxes(guidance);
    }
}