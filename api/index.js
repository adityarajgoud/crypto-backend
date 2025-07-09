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

// Keep-alive for serverless (helps on mobile)
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  next();
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err.message));

// Routes
app.use("/api/coins", coinRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/watchlist", watchlistRoutes);

// Health check
app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

app.get("/", (req, res) => {
  res.send("✅ Crypto backend is up!");
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

module.exports = app;
