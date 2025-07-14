const express = require("express");
const multer = require("multer");
const app = express();
const upload = multer();

app.post("/process", upload.single("audio"), (req, res) => {
  console.log("Received audio file");
  // TODO: Call STT → GPT → TTS here
  res.json({ audioUrl: "https://example.com/fake-response.mp3" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
