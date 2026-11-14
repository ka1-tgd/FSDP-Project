const sql = require("mssql");
const { GoogleGenAI } = require("@google/genai");
const dbConfig = require("../../dbConfig");
require("dotenv").config();

//Uses C06_FGEMINI_API_KEY.
const ai = new GoogleGenAI();

//Get Ferquently Ask Questions.
async function getFaqs(userQuery) {
  try {
    const connection = await sql.connect(dbConfig);

    //Fetch all questions & keywords.
    const allFaqsResult = await connection.request().query(`
      SELECT id, question, keywords FROM Faqs
    `);
    const allFaqs = allFaqsResult.recordset;

    //Format the list for Gemini.
    const faqListText = allFaqs
      .map((f) => `ID: ${f.id} | Question: ${f.question} | Keywords: ${f.keywords}`)
      .join("\n");

    //Ask Gemini to match the user's intent to the best FAQ ID.
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `User question: "${userQuery}"`,
      config: {
        systemInstruction: `You are a routing assistant for a banking FAQ database. 
Match the user's question to the single best FAQ from the list below using the question and keywords.
Reply with ONLY the numeric ID (e.g., 1). If none of the FAQs match the user's intent, reply with -1. Do not write any other words.

FAQ LIST:
${faqListText}`,
      },
    });

    const matchedId = parseInt(response.text.trim(), 10);

    //Fetch the answer from SQL Server using that ID.
    if (!isNaN(matchedId) && matchedId > 0) {
      const answerRequest = connection.request();
      answerRequest.input("id", sql.Int, matchedId);

      const finalResult = await answerRequest.query(`
        SELECT TOP 1 question, answer 
        FROM Faqs 
        WHERE id = @id
      `);

      return finalResult.recordset; //Returns [{ question, answer }].
    }

    return [];    //If no match was found.
  } catch (error) {
    console.error("Error in getFaqs:", error);
    return fallbackSqlSearch(userQuery);    //Fallback - if API fails or hits rate limit, fall back to your SQL LIKE search.
  }
}

//Fallback using the original SQL LIKE logic.
async function fallbackSqlSearch(userQuery) {
  const connection = await sql.connect(dbConfig);
  const request = connection.request();
  request.input("searchTerm", sql.VarChar, `%${userQuery}%`);

  const result = await request.query(`
    SELECT TOP 3 question, answer 
    FROM Faqs 
    WHERE question LIKE @searchTerm OR keywords LIKE @searchTerm
  `);
  return result.recordset;
}

module.exports = {
  getFaqs,
};