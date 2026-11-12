// Back button navigation
const backButton = document.getElementById("backButton");

if (backButton) {
    backButton.addEventListener("click", () => {
        window.location.href = "../html/more.html";
    });
}