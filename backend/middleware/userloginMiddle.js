const jwt = require("jsonwebtoken");

// Checks the login body has a user ID and password
function validateLogin(req, res, next) {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ error: "User ID and password are required" });
  }
  if (typeof userId !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Invalid input" });
  }
  next();
}

// Protects routes: requires "Authorization: Bearer <token>"
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Session expired or invalid" });
    }
    req.user = decoded; // { userId, nric }
    next();
  });
}

module.exports = {
  validateLogin,
  verifyToken,
};