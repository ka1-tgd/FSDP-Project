const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get all accounts that belong to a user
async function getAccountsByNric(nric) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT AccNo, AccType, Balance
      FROM Account
      WHERE NRIC = @nric
      ORDER BY AccNo
    `;
    const request = connection.request();
    request.input("nric", sql.Char(9), nric);
    const result = await request.query(query);

    return result.recordset;
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

// Get the user's latest completed transactions (money out and money in)
async function getRecentTransactions(nric, limit) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT TOP (@limit)
        t.TransRef,
        t.Amount,
        t.TransDateTime,
        t.Description,
        CASE WHEN payer.NRIC = @nric THEN 'out' ELSE 'in' END AS Direction,
        RTRIM(u.Name) AS CounterpartyName
      FROM Transactions t
      JOIN Account payer ON payer.AccNo = t.PayerAccNo
      JOIN Account recipient ON recipient.AccNo = t.RecipientAccNo
      JOIN Account other ON other.AccNo =
        CASE WHEN payer.NRIC = @nric THEN t.RecipientAccNo ELSE t.PayerAccNo END
      JOIN Users u ON u.NRIC = other.NRIC
      WHERE (payer.NRIC = @nric OR recipient.NRIC = @nric)
        AND t.Status = 'completed'
      ORDER BY t.TransDateTime DESC, t.TransRef DESC
    `;
    const request = connection.request();
    request.input("nric", sql.Char(9), nric);
    request.input("limit", sql.Int, limit);
    const result = await request.query(query);

    return result.recordset;
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
  getAccountsByNric,
  getRecentTransactions,
};