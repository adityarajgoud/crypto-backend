const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "No prompt provided" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are the COINIQ Intelligence Assistant, a professional crypto market analyst. 
          Provide insightful, data-driven advice on cryptocurrencies. 
          If asked for long-term holds, suggest established assets like BTC or ETH. 
          Always include a short disclaimer that this is not financial advice. 
          Keep your tone professional, concise, and helpful.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("❌ OpenAI Error:", error.message);
    res
      .status(500)
      .json({ message: "The AI is currently undergoing maintenance." });
  }
});

module.exports = router;
