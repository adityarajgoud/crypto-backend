// backend/routes/watchlistRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// GET /api/watchlist → Get user's watchlist
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ watchlist: user.watchlist || [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch watchlist" });
  }
});

// POST /api/watchlist → Add coin to watchlist
router.post("/", authenticate, async (req, res) => {
  const { coinId } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user.watchlist.includes(coinId)) {
      user.watchlist.push(coinId);
      await user.save();
    }
    res.json({ message: "Added to watchlist" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add to watchlist" });
  }
});

// DELETE /api/watchlist/:coinId → Remove from watchlist
router.delete("/:coinId", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.watchlist = user.watchlist.filter((id) => id !== req.params.coinId);
    await user.save();
    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from watchlist" });
  }
});

module.exports = router;
