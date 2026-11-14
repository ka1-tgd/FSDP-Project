// Checks the phone number in the URL is 8 digits
function validatePhone(req, res, next) {
  const phone = req.params.phone;

  if (!/^\d{8}$/.test(phone)) {
    return res.status(400).json({ error: "Phone number must be 8 digits" });
  }
  next();
}

module.exports = {
  validatePhone,
};