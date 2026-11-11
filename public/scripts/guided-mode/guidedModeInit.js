import { guidedModeCheck } from "./guidedMode.js"
import { paynowSentGuidance } from "./pages/paynowSentGuidance.js";

import {
    createMessageBoxes,
    removeMessageBoxes
} from "./guidedMsgBoxes.js";

const pageGuidance = {
    paynowSent: paynowSentGuidance
}

// Initialize Guided Mode on the current page
export function initializeGuidedMode() {
    removeMessageBoxes();

    const enabled = guidedModeCheck();

    if (!enabled) return;

    const currentPage = document.body.dataset.page;
    const guidance = pageGuidance[currentPage];

    if (guidance) {
        createMessageBoxes(guidance);
    }
}