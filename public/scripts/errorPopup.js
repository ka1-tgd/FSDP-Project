
// Create reusable error popup
document.body.insertAdjacentHTML("beforeend", `
    <div class="error-overlay hidden" id="errorOverlay">
        <div class="error-popup" role="alertdialog"
             aria-modal="true" aria-labelledby="errorTitle">

            <div class="error-icon">
                <span>!</span>
            </div>

            <h2 id="errorTitle">Something went wrong</h2>

            <p id="errorMessage"></p>

            <button type="button" id="errorClose">
                Got it
            </button>

        </div>
    </div>
`);

// Display popup
window.showAppError = function(title, message) {
    document.getElementById("errorTitle").textContent = title;
    document.getElementById("errorMessage").textContent = message;
    document.getElementById("errorOverlay").classList.remove("hidden");
};

// Close popup
document.getElementById("errorClose").addEventListener("click", () => {
    document.getElementById("errorOverlay").classList.add("hidden");
});
