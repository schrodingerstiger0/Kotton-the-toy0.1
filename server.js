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

    // 1. TRANSCRIBE AUDIO USING WHISPER
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("model", "whisper-1");

    const whisperRes = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer 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`,
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
          Authorization: `Bearer YOUR_OPENAI_API_KEY`,
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
          Authorization: `Bearer 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`,
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

    // Clean up
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

app.get("/", (req, res) => {
  res.send("👋 Kotton backend is live!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
