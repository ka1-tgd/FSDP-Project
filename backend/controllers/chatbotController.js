
const faqModel = require("../models/faqModel");

// Supported languages.
const supportedLanguages = ["en", "zh", "ms", "ta"];

// Fallback messages in four languages.
const fallbackMessages = {
  en: "Sorry, I couldn't find an answer to that. Would you like me to connect you with a human support agent?",

  zh: "抱歉，我找不到相关答案。您需要我帮您联系人工客服吗？",

  ms: "Maaf, saya tidak dapat mencari jawapan untuk soalan itu. Adakah anda mahu saya menghubungkan anda dengan pegawai khidmat pelanggan?",

  ta: "மன்னிக்கவும், உங்கள் கேள்விக்கான பதிலை என்னால் கண்டுபிடிக்க முடியவில்லை. உங்களை வாடிக்கையாளர் சேவை அதிகாரியுடன் இணைக்க வேண்டுமா?"
};

// Handle Chatbot messages.
async function handleChat(req, res) {
  try {
    const userMessage = req.body.message;

    const requestedLanguage = req.body.language || "en";

    const language = supportedLanguages.includes(requestedLanguage)
      ? requestedLanguage
      : "en";

    if (
      typeof userMessage !== "string" ||
      !userMessage.trim()
    ) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    // Match FAQ using existing Gemini + SQL logic.
    const matchingFaqs = await faqModel.getFaqs(userMessage);

    if (matchingFaqs && matchingFaqs.length > 0) {

      const originalAnswer = matchingFaqs[0].answer;

      // Translate answer into the selected language.
      const translatedAnswer = await faqModel.translateAnswer(
        originalAnswer,
        language
      );

      return res.json({
        success: true,
        reply: translatedAnswer,
        matchedQuestion: matchingFaqs[0].question,
        faqs: matchingFaqs
      });

    } else {

      // No matching FAQ found.
      return res.json({
        success: true,
        reply: fallbackMessages[language],
        faqs: []
      });
    }

  } catch (error) {
    console.error("Error in chatbotController:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

module.exports = {
  handleChat
};
