const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');

// Function triggered when user clicks a preset chip
function sendPreset(text) {
    messageInput.value = text;
    sendMessage();
}

// Main function to send message to backend
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // 1. Append User Message to UI
    appendMessage(text, 'user');
    messageInput.value = '';

    // 2. Show "Thinking..." temporary bot bubble
    const loadingId = appendMessage("Thinking...", 'bot');

    try {
        // 3. Call your working backend endpoint
        const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();

        // Remove loading bubble
        removeMessage(loadingId);

        if (data.success) {
            // Display Gemini & Database conversational reply
            appendMessage(data.reply, 'bot');
        } else {
            appendMessage("Sorry, I encountered an error processing your request.", 'bot');
        }

    } catch (error) {
        console.error('Error:', error);
        removeMessage(loadingId);
        appendMessage("Failed to connect to the server.", 'bot');
    }
}

// Helper to append messages dynamically
function appendMessage(text, sender) {
    const messageId = 'msg-' + Date.now() + Math.random();
    const row = document.createElement('div');
    row.className = `message-row ${sender === 'user' ? 'user-row' : 'bot-row'}`;
    row.id = messageId;

    if (sender === 'bot') {
        const avatar = document.createElement('div');
        avatar.className = 'avatar bot-avatar';
        
        // Bot avatar using Chatbot_Avatar.png from the parallel /images folder
        const img = document.createElement('img');
        img.src = '../images/Chatbot_Avatar.png';
        img.alt = 'Bot';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        
        avatar.appendChild(img);
        row.appendChild(avatar);
    } else {
        // User avatar using john.png from the parallel /images folder
        const avatar = document.createElement('div');
        avatar.className = 'avatar user-avatar';
        
        const img = document.createElement('img');
        img.src = '../images/john.png';
        img.alt = 'User';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        
        avatar.appendChild(img);
        row.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender === 'user' ? 'user-bubble' : 'bot-bubble'}`;
    bubble.innerText = text;
    row.appendChild(bubble);

    chatContainer.appendChild(row);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return messageId;
}

// Helper to remove temporary loading messages
function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}