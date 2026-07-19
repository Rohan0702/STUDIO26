const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the parent directory
app.use(express.static(path.join(__dirname, "..")));

const User = require("./models/User");

// database connection
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("MongoDB Connected");
    })
    .catch((error)=>{
        console.log("MongoDB Connection Error:", error);
    });
} else {
    console.warn("WARNING: MONGO_URI environment variable is not defined.");
}

// routes
app.use("/api/auth", require("./routes/auth"));

// translation mapping
const languageCodes = {
  "Hindi": "hi-IN",
  "Marathi": "mr-IN",
  "English": "en-IN",
  "Spanish": "es-ES",
  "Portuguese": "pt-PT",
  "French": "fr-FR"
};

app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({ message: "Text, sourceLang, and targetLang are required." });
    }

    const sourceCode = languageCodes[sourceLang];
    const targetCode = languageCodes[targetLang];

    if (!sourceCode || !targetCode) {
      return res.json({ translatedText: text + ` [Translated to ${targetLang} (Unsupported)]` });
    }

    const isSarvamSupported = (lang) => ["Hindi", "Marathi", "English"].includes(lang);

    let sarvamSuccess = false;
    let sarvamText = "";

    if (isSarvamSupported(sourceLang) && isSarvamSupported(targetLang) && sourceLang !== targetLang) {
      const apiKey = process.env.SARVAM_API_KEY;
      if (apiKey) {
        try {
          console.log(`[SARVAM TRANSLATE] "${text}" from ${sourceLang} to ${targetLang}`);
          const response = await fetch("https://api.sarvam.ai/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-subscription-key": apiKey
            },
            body: JSON.stringify({
              input: text,
              source_language_code: sourceCode,
              target_language_code: targetCode,
              model: "sarvam-translate:v1"
            })
          });

          if (response.ok) {
            const data = await response.json();
            sarvamText = data.translated_text;
            sarvamSuccess = true;
          } else {
            const errData = await response.json().catch(() => ({}));
            console.warn("Sarvam API returned error. Falling back to mock dictionary:", errData);
          }
        } catch (err) {
          console.warn("Sarvam API fetch failed. Falling back to mock:", err);
        }
      } else {
        console.warn("Sarvam API key not configured. Falling back to mock.");
      }
    }

    if (sarvamSuccess) {
      return res.json({ translatedText: sarvamText });
    } else {
      // Mock translations dictionary including Hindi and Marathi fallbacks
      const mockTranslations = {
        "hello": { "Spanish": "hola", "French": "bonjour", "Portuguese": "olá", "Hindi": "नमस्ते", "Marathi": "नमस्कार" },
        "elevator 4b is around the corner": { "Spanish": "el ascensor 4b está a la vuelta de la esquina", "French": "l'ascenseur 4b est au coin de la rue", "Portuguese": "o elevador 4b está ao virar da esquina", "Hindi": "लिफ्ट 4B कोने के पास है।", "Marathi": "लिफ्ट 4B कोपऱ्याजवळ आहे." },
        "elevator 4b is around the corner.": { "Spanish": "el ascensor 4b está a la vuelta de la esquina.", "French": "l'ascenseur 4b est au coin de la rue.", "Portuguese": "o elevador 4b está ao virar da esquina.", "Hindi": "लिफ्ट 4B कोने के पास है।", "Marathi": "लिफ्ट 4B कोपऱ्याजवळ आहे." },
        "mateo is rerouting to the accessible elevator": { "Spanish": "mateo se está desviando al ascensor accesible", "French": "mateo se redirige vers l'ascenseur accessible", "Portuguese": "mateo está se desviando para o elevador acessível", "Hindi": "मातेओ सुलभ लिफ्टकडे जात आहे", "Marathi": "मातेओ सुलभ लिफ्टकडे वळत आहे" }
      };

      const cleanText = text.toLowerCase().trim();
      
      // Check if translating FROM a mock language to English
      if (targetLang === "English") {
        for (const [eng, translations] of Object.entries(mockTranslations)) {
          if (translations[sourceLang] && translations[sourceLang].toLowerCase() === cleanText) {
            return res.json({ translatedText: eng.charAt(0).toUpperCase() + eng.slice(1) });
          }
        }
      }

      // Check if translating TO a mock language from English
      if (mockTranslations[cleanText] && mockTranslations[cleanText][targetLang]) {
        return res.json({ translatedText: mockTranslations[cleanText][targetLang] });
      }

      return res.json({ translatedText: `[Mock: ${text} in ${targetLang}]` });
    }
  } catch (error) {
    console.error("Translation server error:", error);
    res.status(500).json({ message: "Server error during translation." });
  }
});

// server
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, ()=>{
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;