const faqModel = require("../models/faqModel");

//Get frequently asked questions.
async function handleChat(req, res) {
  try {
    const userMessage = req.body.message; //Get the user's message from the request body.

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const matchingFaqs = await faqModel.getFaqs(userMessage);   //Look for match FAQs using faqModel (powered by Gemini + SQL).

    //If Gemini matched an FAQ, send back the answer.
    if (matchingFaqs && matchingFaqs.length > 0) {
      return res.json({ 
        success: true,
        reply: matchingFaqs[0].answer,    //The exact answer from the SQL database.
        matchedQuestion: matchingFaqs[0].question,
        faqs: matchingFaqs
      });
    } else {
      //If Gemini returned -1 or no match found.
      return res.json({ 
        success: true,
        reply: "Sorry, I couldn't find an answer to that. Would you like me to connect you with a human support agent?",
        faqs: []
      });
    }

  } catch (error) {
    console.error('Error in chatController:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  handleChat
};