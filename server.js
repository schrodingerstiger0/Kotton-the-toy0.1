const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.static("public"));

// Endpoint to receive audio
app.post("/process", upload.single("audio"), async (req, res) => {
  console.log("📥 Received audio:", req.file.originalname);

  // Simulate audio processing delay
  setTimeout(() => {
    // Fake audio response
    res.json({
      audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav" // Replace later with real generated file
    });
  }, 2000);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Kotton backend running on port ${PORT}`);
});
