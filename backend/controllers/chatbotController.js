const faqModel = require("../models/faqModel");

//Get frequently asked questions
async function handleChat(req, res) {
  try {
    const userMessage = req.body.message;       //Get the user's message from the request body.

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const matchingFaqs = await faqModel.getFaqs(userMessage);        //Search SQL Server database for relevant FAQs using faqModel.

    //Send the matching database rows back to the frontend.
    if (matchingFaqs && matchingFaqs.length > 0) {
      return res.json({ 
        success: true,
        faqs: matchingFaqs, //Array of { question, answer } rows
        message: "Here are the closest matching FAQs I found:" 
      });
    } else {
      return res.json({ 
        success: true,
        faqs: [],
        message: "Sorry, I couldn't find any matching FAQs for your search." 
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