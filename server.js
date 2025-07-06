const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const coinRoutes = require("./routes/coinRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // Optional: keep if needed
const watchlistRoutes = require("./routes/watchlistRoutes"); // ✅ NEW

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // ✅ Parse JSON body

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err.message));

// API Routes
app.use("/api/coins", coinRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes); // Optional, remove if unused
app.use("/api/watchlist", watchlistRoutes); // ✅ Watchlist route

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
