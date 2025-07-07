const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const router = express.Router();
require("dotenv").config();

const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

// ✅ Axios instance for RapidAPI
const axiosRapid = axios.create({
  baseURL: "https://coingecko.p.rapidapi.com",
  headers: {
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY, // ✅ Ensure it's in Render env
    "X-RapidAPI-Host": "coingecko.p.rapidapi.com",
  },
});

// 1. GET /api/coins/markets
router.get("/markets", async (req, res) => {
  const { vs_currency = "usd", page = 1 } = req.query;
  const cacheKey = `markets-${vs_currency}-${page}`;

  // ✅ DEBUG LOG — see if Render is reading the key properly
  console.log("🔍 RAPIDAPI_KEY from env:", process.env.RAPIDAPI_KEY);

  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  try {
    const { data } = await axiosRapid.get("/coins/markets", {
      params: {
        vs_currency,
        order: "market_cap_desc",
        per_page: 50,
        page,
        price_change_percentage: "24h",
        sparkline: true,
      },
    });

    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching market data:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    res.status(500).json({ message: "Failed to fetch market data" });
  }
});

// 2. GET /api/coins/:id → Coin details
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `coin-${id}`;

  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  try {
    const { data } = await axiosRapid.get(`/coins/${id}`);
    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error(`❌ Error fetching coin ${id}:`, err.message);
    res.status(500).json({ message: `Failed to fetch coin ${id}` });
  }
});

// 3. GET /api/coins/chart/:id → Chart data
router.get("/chart/:id", async (req, res) => {
  const { id } = req.params;
  const { vs_currency = "usd", days = 7 } = req.query;
  const cacheKey = `chart-${id}-${vs_currency}-${days}`;

  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  try {
    const { data } = await axiosRapid.get(`/coins/${id}/market_chart`, {
      params: {
        vs_currency,
        days,
      },
    });

    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error(`❌ Error fetching chart for ${id}:`, err.message);
    res.status(500).json({ message: `Failed to fetch chart for ${id}` });
  }
});

// 4. GET /api/coins/news → Crypto News
router.get("/news", async (req, res) => {
  const cacheKey = `news`;

  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  try {
    const { data } = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: "crypto OR bitcoin OR ethereum",
        language: "en",
        sortBy: "publishedAt",
        pageSize: 10,
        apiKey: process.env.NEWS_API_KEY,
      },
    });

    cache.set(cacheKey, data.articles);
    res.json(data.articles);
  } catch (err) {
    console.error("❌ Error fetching news:", err.message);
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

module.exports = router;
