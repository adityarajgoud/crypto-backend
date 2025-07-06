const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ POST /api/user/watchlist → Add a coin to watchlist
router.post("/watchlist", authenticate, async (req, res) => {
  const { coinId } = req.body;
  if (!coinId) return res.status(400).json({ message: "coinId is required" });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.watchlist.includes(coinId)) {
      user.watchlist.push(coinId);
      await user.save();
    }

    res.json({ watchlist: user.watchlist });
  } catch {
    res.status(500).json({ message: "Failed to update watchlist" });
  }
});

// ✅ GET /api/user/watchlist → Get user's watchlist
router.get("/watchlist", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ watchlist: user.watchlist });
  } catch {
    res.status(500).json({ message: "Failed to fetch watchlist" });
  }
});
// ✅ POST /api/user/watchlist/remove → Remove coin from watchlist
router.post("/watchlist/remove", authenticate, async (req, res) => {
  const { coinId } = req.body;
  if (!coinId) return res.status(400).json({ message: "coinId is required" });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.watchlist = user.watchlist.filter((id) => id !== coinId);
    await user.save();

    res.json({ watchlist: user.watchlist });
  } catch {
    res.status(500).json({ message: "Failed to remove coin from watchlist" });
  }
});

module.exports = router;
