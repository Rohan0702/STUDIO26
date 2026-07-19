# Studio26 — Apex Predictive Event Operations

**Apex Operations Gateway** is a premium, real-time predictive event operations platform built for volunteer coordination, emergency dispatch, and live translations at major international sporting events (such as the FIFA World Cup 2026 at Estadio Azteca).

---

## 🚀 Key Features

1. **Secure Gatekeeper Authentication**:
   - MongoDB-backed Node.js Express server.
   - Secure OTP verification via email dispatch.
   - Robust session persistence with local storage validation.
2. **Context-Aware Live AI Translation**:
   - Integrates **Sarvam AI Translation API** (`https://api.sarvam.ai/translate`) for Hindi, Marathi, and English.
   - Includes a robust failover/offline dictionary for Spanish, French, and Portuguese.
   - Graceful fallback mechanism if the subscription API key fails or is invalid.
3. **Voice Translation & Synthesizer**:
   - **Speech Recognition (STT)**: Speaks into the mic in the selected source language (Hindi/Spanish/Marathi) to translate.
   - **Speech Synthesis (TTS)**: Reads translated instructions aloud to event attendees in their native target language.
4. **Dynamic Operations Dashboard**:
   - Task lists, workforce zone allocations, active alarms, and crowd flow maps.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5 (Semantic Structure), CSS3 (Premium glassmorphic styling), JavaScript (Vanilla ES6 logic), Tailwind CSS (Layouts).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose ODM).
- **APIs & Services**: Sarvam AI API, Web Speech API (SpeechRecognition & SpeechSynthesis).

---

## ⚙️ Environment Configuration

To configure the backend, create a file named `.env` inside the `OTP-Authentication/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/otpAuthentication
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SARVAM_API_KEY=your_sarvam_api_key_here
```

---

## 🏁 Quick Start Guide

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) running locally.

### 2. Start the Backend Server
Navigate to the authentication server folder and start the server:
```bash
cd OTP-Authentication
npm install
node server.js
```

### 3. Open the Gateway
Once the server is running, open your web browser and navigate to:
👉 **[http://localhost:5000/sign_in.html](http://localhost:5000/sign_in.html)**

---

## 🎙️ Speech-to-Speech Translation Instructions

1. Log in and navigate to the **Volunteer Profile** (bottom right icon).
2. Set your translation preference (e.g., **English to Hindi** or **Spanish to English**).
3. Go back to the **Dashboard** tasks page.
4. **Using Voice**: 
   - Click the **HOLD TO SPEAK** microphone button.
   - Speak your message. (In mock/non-microphone supported environments, clicking the button auto-generates a phrase matching the source language after 2 seconds).
5. **Using Text**: 
   - Type your text inside the input field (the action button automatically updates contextually to **TRANSLATE TEXT**).
   - Press `Enter` or click **TRANSLATE TEXT**.
6. **Playback**: 
   - Click the speaker button next to the translation result to hear the translation read out loud using browser speech synthesis.
