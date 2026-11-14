const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userLoginModel = require("../models/userloginModel");

async function login(req, res) {
  try {
    const { userId, password } = req.body;

    const user = await userLoginModel.getLoginByUserId(userId);

    //message for "no such user" and "wrong password"
    if (!user) {
      return res.status(401).json({ error: "Invalid user ID or password" });
    }

    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid user ID or password" });
    }

    const token = jwt.sign(
      { userId: user.UserID, nric: user.NRIC },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({
      token,
      user: { userId: user.UserID, name: user.Name },
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
}

module.exports = {
  login,
};