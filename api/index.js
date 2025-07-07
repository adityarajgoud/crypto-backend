const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const serverless = require("serverless-http");

const coinRoutes = require("./routes/coinRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Vercel-safe MongoDB connection
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

// ✅ Call DB connection
connectDB();

// ✅ Routes
app.use("/api/coins", coinRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/watchlist", watchlistRoutes);

// ✅ Root check
app.get("/", (req, res) => {
  res.send("✅ Crypto backend is up!");
});

// ✅ Export for Vercel
module.exports = serverless(app);
