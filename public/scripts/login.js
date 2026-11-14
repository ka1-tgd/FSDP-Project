const API_URL = 'http://localhost:3000/api';
const HOME_PAGE = 'ocbcHome.html'; // change to the page shown after login

const landingScreen = document.getElementById('landingScreen');
const loginScreen = document.getElementById('loginScreen');
const openLoginButton = document.getElementById('openLoginButton');
const loginBackButton = document.getElementById('loginBackButton');

const loginForm = document.getElementById('loginForm');
const userIdInput = document.getElementById('userId');
const pinInput = document.getElementById('pin');
const loginButton = document.getElementById('loginButton');
const loginError = document.getElementById('loginError');

// ---------- Switch between the two screens ----------
openLoginButton.addEventListener('click', () => {
    landingScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    userIdInput.focus();
});

loginBackButton.addEventListener('click', () => {
    loginScreen.classList.add('hidden');
    landingScreen.classList.remove('hidden');
    hideError();
});

// ---------- Enable the Log in button only when both fields are filled ----------
function updateLoginButton() {
    loginButton.disabled = !(userIdInput.value.trim() && pinInput.value);
}

userIdInput.addEventListener('input', () => {
    updateLoginButton();
    hideError();
});
pinInput.addEventListener('input', () => {
    updateLoginButton();
    hideError();
});

function showError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
}

function hideError() {
    loginError.classList.add('hidden');
}

// ---------- Log in ----------
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = userIdInput.value.trim();
    const password = pinInput.value;
    if (!userId || !password) return;

    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';
    hideError();

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, password })
        });
        const data = await res.json();

        if (!res.ok) {
            showError(data.error || 'Unable to log in. Please try again.');
            return;
        }

        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userName', data.user.name);
        window.location.href = HOME_PAGE;
    } catch (err) {
        console.error(err);
        showError('Cannot reach the server. Please try again later.');
    } finally {
        loginButton.textContent = 'Log in';
        updateLoginButton();
    }
});