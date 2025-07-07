const express = require("express");
const serverless = require("serverless-http");
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

// MongoDB Connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log("✅ MongoDB Connected");
}
connectDB();

// Routes
app.use("/api/coins", coinRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/watchlist", watchlistRoutes);

// Export handler for Vercel
module.exports = serverless(app);
