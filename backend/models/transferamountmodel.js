
const sql = require("mssql");
const dbConfig = require("../../dbConfig");


const SENDER_ACCOUNT = "111-1-111111";

// Get sender account details
async function getSenderAccount() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        const query = `
            SELECT
                Users.Name,
                Users.PhoneNo,
                Account.AccNo,
                Account.AccType,
                Account.Balance
            FROM Users
            INNER JOIN Account
                ON Users.NRIC = Account.NRIC
            WHERE Account.AccNo = @AccNo`;

        const request = connection.request();
        request.input(
            "AccNo",
            sql.VarChar(50),
            SENDER_ACCOUNT
        );

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


// Get recipient details using phone number
async function getRecipientByPhone(phoneNo) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT Users.Name, Users.PhoneNo FROM Users WHERE Users.PhoneNo = @PhoneNo`;
        const request = connection.request();
        request.input(
            "PhoneNo",
            sql.Char(8),
            phoneNo
        );

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
    getSenderAccount,
    getRecipientByPhone
};
