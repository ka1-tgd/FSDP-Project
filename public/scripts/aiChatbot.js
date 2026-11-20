
/* ========================================
   OCBC AI Chatbot - Four Languages
   ======================================== */

const chatContainer = document.getElementById("chatContainer");
const messageInput = document.getElementById("messageInput");

const chatbotTranslations = {
    en: {
        title: "Ask OCBC Bot",
        tokens: "OCBC Tokens",
        logout: "logout",
        back: "Go back",
        greeting: "Hi! I'm OCBC Assist.\nHow can I help you today?",
        transfer: "How to transfer money?",
        uen: "What is a UEN?",
        pin: "How to reset credit card PIN?",
        placeholder: "Type a message",
        send: "Send",
        thinking: "Thinking...",
        error: "Sorry, I encountered an error processing your request.",
        connection: "Failed to connect to the server.",
        home: "Home",
        plan: "Plan",
        pay: "Pay & Transfer",
        rewards: "Rewards",
        more: "More"
    },

    zh: {
        title: "询问 OCBC 助手",
        tokens: "OCBC 安全令牌",
        logout: "登出",
        back: "返回",
        greeting: "您好！我是 OCBC 智能助手。\n今天有什么可以帮您？",
        transfer: "如何转账？",
        uen: "什么是 UEN？",
        pin: "如何重设信用卡密码？",
        placeholder: "输入消息",
        send: "发送",
        thinking: "正在思考……",
        error: "抱歉，处理您的请求时发生错误。",
        connection: "无法连接服务器。",
        home: "首页",
        plan: "理财规划",
        pay: "付款与转账",
        rewards: "奖励",
        more: "更多"
    },

    ms: {
        title: "Tanya Bot OCBC",
        tokens: "Token OCBC",
        logout: "Log keluar",
        back: "Kembali",
        greeting: "Hai! Saya OCBC Assist.\nBagaimana saya boleh membantu anda hari ini?",
        transfer: "Bagaimana cara memindahkan wang?",
        uen: "Apakah itu UEN?",
        pin: "Bagaimana cara menetapkan semula PIN kad kredit?",
        placeholder: "Taip mesej",
        send: "Hantar",
        thinking: "Sedang berfikir...",
        error: "Maaf, terdapat ralat semasa memproses permintaan anda.",
        connection: "Gagal menyambung ke pelayan.",
        home: "Utama",
        plan: "Perancangan",
        pay: "Bayar & Pindah",
        rewards: "Ganjaran",
        more: "Lagi"
    },

    ta: {
        title: "OCBC உதவியாளரிடம் கேளுங்கள்",
        tokens: "OCBC டோக்கன்கள்",
        logout: "வெளியேறு",
        back: "திரும்பிச் செல்",
        greeting: "வணக்கம்! நான் OCBC Assist.\nஇன்று உங்களுக்கு எப்படி உதவலாம்?",
        transfer: "பணத்தை எவ்வாறு மாற்றுவது?",
        uen: "UEN என்றால் என்ன?",
        pin: "கிரெடிட் கார்டு PIN-ஐ எவ்வாறு மாற்றுவது?",
        placeholder: "செய்தியை உள்ளிடவும்",
        send: "அனுப்பு",
        thinking: "சிந்திக்கிறது...",
        error: "மன்னிக்கவும், உங்கள் கோரிக்கையைச் செயலாக்கும்போது பிழை ஏற்பட்டது.",
        connection: "சேவையகத்துடன் இணைக்க முடியவில்லை.",
        home: "முகப்பு",
        plan: "திட்டம்",
        pay: "பணம் மற்றும் பரிமாற்றம்",
        rewards: "வெகுமதிகள்",
        more: "மேலும்"
    }
};

/* ========================================
   Current Language
   ======================================== */

const preferredChatLanguage =
    localStorage.getItem("preferredLanguage") || "en";

const currentChatLanguage =
    chatbotTranslations[preferredChatLanguage]
        ? preferredChatLanguage
        : "en";

const currentChatText = chatbotTranslations[currentChatLanguage];

function chatT(key) {
    return currentChatText[key] ||
        chatbotTranslations.en[key] ||
        key;
}

/* ========================================
   Translate Chatbot Page
   ======================================== */

function translateChatbotPage() {
    document.documentElement.lang = currentChatLanguage;
    document.title = chatT("title");

    const title = document.getElementById("chatPageTitle");
    if (title) title.textContent = chatT("title");

    const tokens = document.getElementById("tokenText");
    if (tokens) tokens.textContent = chatT("tokens");

    const logout = document.getElementById("logoutText");
    if (logout) logout.textContent = chatT("logout");

    const back = document.getElementById("chatBackButton");
    if (back) back.setAttribute("aria-label", chatT("back"));

    const greeting = document.getElementById("chatGreeting");

    if (greeting) {
        greeting.textContent = chatT("greeting");
        greeting.style.whiteSpace = "pre-line";
    }

    const chips = document.querySelectorAll(".quick-chips .chip");

    chips.forEach(function(chip) {
        const key = chip.dataset.preset;

        if (key) {
            chip.textContent = chatT(key);

            chip.addEventListener("click", function() {
                sendPreset(chatT(key));
            });
        }
    });

    messageInput.placeholder = chatT("placeholder");

    const sendButton = document.querySelector(".send-icon-btn");

    if (sendButton) {
        sendButton.setAttribute("aria-label", chatT("send"));
    }

    const navItems = document.querySelectorAll("[data-nav]");

    navItems.forEach(function(item) {
        item.textContent = chatT(item.dataset.nav);
    });
}

/* ========================================
   Preset Questions
   ======================================== */

function sendPreset(text) {
    messageInput.value = text;
    sendMessage();
}

/* ========================================
   Chat History (localStorage)
   ======================================== */

const CHAT_STORAGE_KEY = "ocbc_chatbot_history_v1";

function loadChatHistory() {
    try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (err) {
        console.error("Failed to load chat history:", err);
        return [];
    }
}

function saveMessageToHistory(text, sender) {
    try {
        const history = loadChatHistory();
        history.push({ text, sender });
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
        console.error("Failed to save chat history:", err);
    }
}

function restoreChatHistory() {
    const history = loadChatHistory();
    history.forEach(function(msg) {
        appendMessage(msg.text, msg.sender, false);
    });
}

/* ========================================
   Send Message to Backend
   ======================================== */

async function sendMessage() {
    const text = messageInput.value.trim();

    if (!text) return;

    appendMessage(text, "user", true);
    messageInput.value = "";

    const loadingId = appendMessage(chatT("thinking"), "bot", false);

    try {
        const response = await fetch(
            "http://localhost:3000/api/chatbot",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: text,
                    language: currentChatLanguage
                })
            }
        );

        if (!response.ok) {
            throw new Error("Chatbot request failed");
        }

        const data = await response.json();

        removeMessage(loadingId);

        if (data.success) {
            appendMessage(data.reply, "bot", true);
        } else {
            appendMessage(chatT("error"), "bot");
        }

    } catch (error) {
        console.error("Chatbot error:", error);

        removeMessage(loadingId);

        appendMessage(chatT("connection"), "bot");
    }
}

/* ========================================
   Append Chat Message
   ======================================== */

function appendMessage(text, sender, save = true) {
    const messageId = "msg-" + Date.now() + Math.random();

    const row = document.createElement("div");

    row.className =
        `message-row ${sender === "user" ? "user-row" : "bot-row"}`;

    row.id = messageId;

    const avatar = document.createElement("div");

    avatar.className =
        `avatar ${sender === "user" ? "user-avatar" : "bot-avatar"}`;

    const img = document.createElement("img");

    img.src = sender === "user"
        ? "../images/john.png"
        : "../images/Chatbot_Avatar.png";

    img.alt = sender === "user" ? "User" : "Bot";

    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "50%";

    avatar.appendChild(img);
    row.appendChild(avatar);

    const bubble = document.createElement("div");

    bubble.className =
        `chat-bubble ${sender === "user" ? "user-bubble" : "bot-bubble"}`;

    bubble.innerText = text;

    row.appendChild(bubble);
    chatContainer.appendChild(row);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (save) {
        saveMessageToHistory(text, sender);
    }

    return messageId;
}

/* ========================================
   Remove Loading Message
   ======================================== */

function removeMessage(id) {
    const element = document.getElementById(id);

    if (element) {
        element.remove();
    }
}

/* ========================================
   Initialize
   ======================================== */

translateChatbotPage();
restoreChatHistory();