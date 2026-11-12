const API_URL = 'http://localhost:3000/api';

// Elements
const amountInput = document.getElementById('amountInput');
const quickButtons = document.querySelectorAll('.quick-amounts button');
const quickHint = document.getElementById('quickHint');
const moreAmounts = document.getElementById('moreAmounts');

const recipientName = document.getElementById('recipientName');
const recipientInfo = document.getElementById('recipientInfo');
const accountType = document.getElementById('accountType');
const accountNumber = document.getElementById('accountNumber');
const balanceButton = document.getElementById('balanceButton');
const balanceButtonText = document.getElementById('balanceButtonText');
const availableBalance = document.getElementById('availableBalance');
const nextButton = document.getElementById('nextButton');

let senderBalance = null;
let recipientData = null;
let senderData = null;

// quick amounts
function clearQuickSelection() {
    quickButtons.forEach(btn => btn.classList.remove('selected'));
    quickHint.classList.add('hidden');
}

quickButtons.forEach(button => {
    button.addEventListener('click', () => {
        const isSelected = button.classList.contains('selected');

        clearQuickSelection();
        moreAmounts.value = '';

        if (isSelected) {
            amountInput.value = '';
        } else {
            button.classList.add('selected');
            amountInput.value = Number(button.dataset.amount).toFixed(2);
            quickHint.classList.remove('hidden');
        }
    });
});

amountInput.addEventListener('input', clearQuickSelection);

moreAmounts.addEventListener('change', () => {
    clearQuickSelection();
    if (moreAmounts.value) {
        amountInput.value = Number(moreAmounts.value).toFixed(2);
    }
});

// recipants details
async function loadRecipient() {
    const phone = new URLSearchParams(window.location.search).get('phone');
    if (!phone) {
        recipientName.textContent = 'No recipient selected';
        return;
    }
    try {
        const res = await fetch(`${API_URL}/transfer/recipient/${encodeURIComponent(phone)}`);
        if (!res.ok) throw new Error('Recipient not found');
        recipientData = await res.json();

        recipientName.textContent = recipientData.Name;
        recipientInfo.textContent = `+65${recipientData.PhoneNo}`;
    } catch (err) {
        console.error(err);
        recipientName.textContent = 'Recipient not found';
        recipientInfo.textContent = '';
    }
}

async function loadSender() {
    try {
        const res = await fetch(`${API_URL}/transfer/sender`);
        if (!res.ok) throw new Error('Account not found');
        senderData = await res.json();

        accountType.textContent = `${senderData.AccType} Account`;
        accountNumber.textContent = senderData.AccNo;
        senderBalance = senderData.Balance;
    } catch (err) {
        console.error(err);
        accountType.textContent = 'Account unavailable';
        accountNumber.textContent = '';
    }
}

// show or hide balance
balanceButton.addEventListener('click', () => {
    const isHidden = availableBalance.classList.contains('hidden');

    if (isHidden && senderBalance !== null) {
        availableBalance.textContent = `${Number(senderBalance).toLocaleString('en-SG', {
            minimumFractionDigits: 2
        })} SGD`;
        availableBalance.classList.remove('hidden');
        balanceButtonText.textContent = 'Hide available balance';
    } else {
        availableBalance.classList.add('hidden');
        balanceButtonText.textContent = 'Show available balance';
    }
});

loadRecipient();
loadSender();