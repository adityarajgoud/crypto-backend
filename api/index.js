// api/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const coinRoutes = require("../routes/coinRoutes");
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const watchlistRoutes = require("../routes/watchlistRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err.message));

app.use("/api/coins", coinRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/watchlist", watchlistRoutes);

app.get("/", (req, res) => {
  res.send("✅ Crypto backend is up!");
});

module.exports = app; // ✅ IMPORTANT for Vercel
