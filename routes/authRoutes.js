require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Email transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =============================
// 👉 Signup Route
// =============================
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashed,
      name: name || email.split("@")[0], // default name if not provided
    });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// =============================
// 👉 Login Route
// =============================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Login failed - server error" });
  }
});

// =============================
// 👉 Forgot Password Route
// =============================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Reset your CryptoTracker password",
      html: `
        <h3>Password Reset Request</h3>
        <p>Click below to reset your password:</p>
        <a href="${resetURL}" style="padding:10px 15px; background:#2d72d9; color:#fff; text-decoration:none;">Reset Password</a>
        <p>This link is valid for 1 hour.</p>
      `,
    });

    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err.message);
    res.status(500).json({ message: "Failed to send reset email" });
  }
});

// =============================
// 👉 Reset Password Route
// =============================
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res
      .status(400)
      .json({ message: "Token and new password are required" });

  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("❌ Reset Password Error:", err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
