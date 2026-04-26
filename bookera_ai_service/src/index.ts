import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { generateResponse } from "./services/chatbot.service.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await generateResponse(message);

    res.json({
      success: true,
      response,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
