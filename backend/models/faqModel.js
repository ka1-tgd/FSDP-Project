const sql = require("mssql");
const dbConfig = require("../../dbConfig");

//Get frequently asked questions
async function getFaqs(userQuery) {
  try {
    const connection = await sql.connect(dbConfig);
    
    const request = connection.request();     //Use SQL to search the question.
    request.input('searchTerm', sql.VarChar, `%${userQuery}%`);

    const result = await request.query(`
      SELECT TOP 3 question, answer 
      FROM Faqs 
      WHERE question LIKE @searchTerm OR keywords LIKE @searchTerm
    `);

    return result.recordset; //Returns an array of matching FAQ rows.
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = {
    getFaqs
};