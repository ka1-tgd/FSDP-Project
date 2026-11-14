
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get recipient (name, phone, account) by phone number
async function getRecipientByPhone(phone) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT TOP 1 u.Name, u.PhoneNo, a.AccNo, a.AccType
      FROM Users u
      JOIN Account a ON a.NRIC = u.NRIC
      WHERE u.PhoneNo = @phone`;
    const request = connection.request();
    request.input("phone", sql.Char(8), phone);
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

// Get account tyle and balance (for future)
async function getAccountByAccNo(accNo) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT AccNo, AccType, Balance
      FROM Account
      WHERE AccNo = @accNo
    `;
    const request = connection.request();
    request.input("accNo", sql.VarChar(50), accNo);
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

//get user accounts (type, balance) by NRIC
async function getAccountByNric(nric) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT TOP 1 AccNo, AccType, Balance
      FROM Account
      WHERE NRIC = @nric
      ORDER BY AccNo
    `;
    const request = connection.request();
    request.input("nric", sql.Char(9), nric);
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
  getRecipientByPhone,
  getAccountByAccNo,
  getAccountByNric,
};