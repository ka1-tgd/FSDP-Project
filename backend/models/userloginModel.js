const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get login record (and name) by user ID
async function getLoginByUserId(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT l.UserID, l.PasswordHash, l.NRIC, u.Name
      FROM UserLogin l
      JOIN Users u ON u.NRIC = l.NRIC
      WHERE l.UserID = @userId
    `;
    const request = connection.request();
    request.input("userId", sql.VarChar(50), userId);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
    }
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  getLoginByUserId,
};