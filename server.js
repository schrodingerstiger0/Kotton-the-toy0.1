const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

app.post("/process", upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Check if OpenAI key exists
    const OPENAI_KEY = process.env.TESTICLE_OPENAI;
    if (!OPENAI_KEY) {
      throw new Error("❌ Missing TESTICLE_OPENAI environment variable.");
    }

    // 1. TRANSCRIBE AUDIO USING WHISPER
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("model", "whisper-1");

    const whisperRes = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          ...formData.getHeaders()
        }
      }
    );

    const userText = whisperRes.data.text;
    console.log("👶 Child said:", userText);

    // 2. GENERATE REPLY USING GPT
    const gptRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a friendly talking toy for kids aged 3–7. Keep responses short, simple, and magical."
          },
          {
            role: "user",
            content: userText
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const replyText = gptRes.data.choices[0].message.content;
    console.log("🤖 Toy says:", replyText);

    // 3. TEXT-TO-SPEECH (TTS)
    const ttsRes = await axios.post(
      "https://api.openai.com/v1/audio/speech",
      {
        model: "tts-1",
        voice: "nova",
        input: replyText
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    // 4. SEND AUDIO BACK TO FRONTEND
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": ttsRes.data.length
    });
    res.send(ttsRes.data);

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("❌ ERROR:", err.message || err);
    res.status(500).send("Something went wrong.");
  }
});

app.get("/", (req, res) => {
  res.send("👋 Kotton backend is live!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
