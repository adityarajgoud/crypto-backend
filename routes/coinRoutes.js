const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const router = express.Router();
require("dotenv").config();

const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

// ✅ Axios instance for official CoinGecko
const axiosCoinGecko = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 8000,
  headers: {
    "User-Agent": "CryptoTracker/1.0 (+https://yourdomain.com)",
    Accept: "application/json",
  },
});

// ✅ Utility: Log and extract meaningful Axios error
const handleAxiosError = (error, context) => {
  if (error.response) {
    console.error(`❌ [${context}] Status:`, error.response.status);
    console.error(`❌ [${context}] Data:`, error.response.data);
  } else if (error.request) {
    console.error(`❌ [${context}] No response received`);
  } else {
    console.error(`❌ [${context}] Error:`, error.message);
  }
};

// 1. GET /api/coins/markets
router.get("/markets", async (req, res) => {
  const { vs_currency = "usd", page = 1 } = req.query;
  const cacheKey = `markets-${vs_currency}-${page}`;

  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  try {
    const { data } = await axiosCoinGecko.get("/coins/markets", {
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
    handleAxiosError(error, "GET /markets");
    res.status(500).json({ message: "Failed to fetch market data" });
  }
});

// 2. GET /api/coins/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `coin-${id}`;

  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  try {
    const { data } = await axiosCoinGecko.get(`/coins/${id}`);
    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    handleAxiosError(error, `GET /:id (${id})`);
    res.status(500).json({ message: `Failed to fetch coin ${id}` });
  }
});

// 3. GET /api/coins/chart/:id
router.get("/chart/:id", async (req, res) => {
  const { id } = req.params;
  const { vs_currency = "usd", days = 7 } = req.query;
  const cacheKey = `chart-${id}-${vs_currency}-${days}`;

  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  try {
    const { data } = await axiosCoinGecko.get(`/coins/${id}/market_chart`, {
      params: {
        vs_currency,
        days,
      },
    });

    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    handleAxiosError(error, `GET /chart/${id}`);
    res.status(500).json({ message: `Failed to fetch chart for ${id}` });
  }
});

// 4. GET /api/coins/news
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
      timeout: 8000,
    });

    cache.set(cacheKey, data.articles);
    res.json(data.articles);
  } catch (error) {
    handleAxiosError(error, "GET /news");
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

module.exports = router;
