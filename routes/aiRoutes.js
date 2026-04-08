const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
require("dotenv").config();

// Initialize Groq with your API Key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "No prompt provided" });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are the COINIQ Intelligence Assistant. 
          You are a world-class cryptocurrency analyst. 
          Provide technical yet easy-to-understand advice. 
          If asked for long-term buys, suggest strong projects like Bitcoin (BTC) and Ethereum (ETH).
          Always finish with the phrase: "⚠️ Disclaimer: This is not financial advice." 
          Keep responses professional and concise.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant", // Fast and highly capable for chat
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "";
    res.json({ reply });
  } catch (error) {
    console.error("❌ Groq API Error:", error.message);
    res.status(500).json({
      message: "The AI analyst is busy. Please try again in a moment.",
    });
  }
});

module.exports = router;
