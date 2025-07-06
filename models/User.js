const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  watchlist: [String], // coin IDs
  resetToken: String, // 🔐 Token sent to user for password reset
  tokenExpiry: Date, // ⏰ Token expiration time
});

module.exports = mongoose.model("User", userSchema);
