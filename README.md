# 🎵 Aapan AI (आपण AI)
### *India's Voice-First Indic Music to Synchronized Lyrics Studio*

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Stack: MERN](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-emerald.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20TailwindCSS-purple.svg)](https://vitejs.dev/)
[![Gnani.ai](https://img.shields.io/badge/Powered%20By-Gnani.ai%20Prisma%20%26%20Timbre-rose.svg)](https://gnani.ai/)
[![Accessibility: WCAG 2.2 AAA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AAA-blue.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 🌟 What is Aapan AI?

**Aapan AI** is an accessible, voice-first digital music and karaoke studio built specifically for India’s diverse multilingual audience. It breaks down language barriers by taking any song—whether from a YouTube link or an uploaded audio/video file—and generating **real-time synchronized karaoke lyrics** with phonetic script transliteration and line-by-line poetic meanings.

Powered by **Gnani.ai's official Prisma ASR v3 (Speech Recognition)** and **Timbre (Indic Neural Voice)**, Aapan AI allows anyone, including low-literacy or visually impaired users, to sing along, understand, and enjoy music in their native language.

---

## ✨ Key Features

- **🎬 Direct YouTube to Synchronized Lyrics**  
  Paste any YouTube music link to instantly stream audio and follow along with synchronized karaoke timestamps—no downloads required.

- **📁 Audio & Video File Uploads**  
  Upload song files in `.mp3`, `.wav`, `.mp4`, `.m4a`, or `.webm` formats to automatically extract timestamps and song metadata.

- **🌐 Multi-Script Karaoke Display**  
  Switch instantly between three script views:
  1. **हिन्दी (Devanagari)** — Authentic native script.
  2. **Hinglish (Roman English)** — Easy-to-read phonetic English spelling.
  3. **English Meaning** — Poetic translation for deeper understanding of the song's poetry.

- **🎛️ Real-Time Interactive Studio Player**  
  Features a 28-bar animated equalizer waveform, seekable progress scrubber, playback speed adjustments (0.75x, 1x, 1.25x), and synchronized auto-scrolling that highlights lines as the artist sings.

- **💾 Personal Music Vault**  
  Authenticated user dashboard where you can store, replay, search, and manage your private library of uploaded tracks.

- **📥 Export .LRC Sync Files**  
  Download standardized `.LRC` subtitle files with millisecond-precise timestamps for use in external media players (Spotify, VLC, Apple Music).

- **♿ WCAG 2.2 AAA Voice Accessibility**  
  Equipped with high-contrast UI mode, full keyboard hotkeys, and automated voice guides to ensure complete digital accessibility for elderly and visually impaired users.

---

## 🏛️ Project Architecture

```text
Aapan AI/
├── backend/                    # Express.js & Node.js REST API Server
│   ├── config/db.js            # MongoDB Atlas connection (with in-memory fallback)
│   ├── controllers/            # Lyrics extraction & media controllers
│   ├── middleware/auth.js      # JWT authentication middleware
│   ├── models/                 # User.js & Song.js MongoDB schemas
│   ├── routes/                 # /api/auth, /api/lyrics, /api/voice
│   ├── services/gnaniService.js# Gnani.ai Prisma ASR & Timbre TTS integration
│   ├── utils/                  # Indic script translator & phonetic conversion
│   └── server.js               # API Server Entry Point (Port 5050)
│
├── frontend/                   # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, Footer, SoundwaveVisualizer
│   │   ├── context/            # AuthContext, VoiceContext, SidebarContext
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Guest landing page with song previews
│   │   │   ├── LoginPage.jsx           # Sign in with email & password
│   │   │   ├── SignupPage.jsx          # Register with language preference
│   │   │   ├── DashboardPage.jsx       # Personal Music Vault & uploaded tracks
│   │   │   └── MusicToLyricsPage.jsx   # Synced 2-column karaoke lyrics studio
│   │   ├── services/api.js     # Axios/Fetch API client with JWT interceptor
│   │   └── App.jsx             # Route guards & global hotkey listener
│   └── vite.config.js          # Vite build & proxy configuration
│
├── .gitignore                  # Git exclusion rules (node_modules, .env, media)
└── package.json                # Root convenience scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (optional; falls back to an in-memory store if no URI is provided)
- A [Gnani.ai](https://gnani.ai/) API Key (optional; intelligent local phonetic fallback active if unconfigured)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/<your-username>/aapan-ai.git
cd aapan-ai
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory (you can copy `backend/.env.example`):

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your settings:

```env
PORT=5050
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
GNANI_API_KEY=your_gnani_api_key_here
GNANI_API_URL=https://api.vachana.ai
```

---

### Step 3: Install Dependencies

Install packages for both the backend and frontend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

---

### Step 4: Run the Application

Open two terminal windows:

#### Terminal 1 — Backend Server
```bash
cd backend
npm start
```
*Backend server runs on `http://localhost:5050` (Health check: `http://localhost:5050/api/health`)*

#### Terminal 2 — Frontend Development Server
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## ⌨️ Accessible Keyboard Hotkeys

| Key | Action | Description |
| :--- | :--- | :--- |
| <kbd>Spacebar</kbd> | **Voice Guide** | Speak / Ask voice queries or listen to current section |
| <kbd>P</kbd> | **Play / Pause** | Toggles playback of the current song or audio track |
| <kbd>R</kbd> | **Repeat** | Restarts the current song or sentence from the beginning |
| <kbd>M</kbd> | **Mute / Unmute** | Globally mutes/unmutes all audio and speech synthesis |
| <kbd>H</kbd> | **Audio Tour** | Triggers an audio guide introducing Aapan AI |

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user with language & accessibility settings | No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & vault | Yes |
| `POST` | `/api/lyrics/extract` | Extract synchronized lyrics from pasted text or track | Optional |
| `POST` | `/api/lyrics/upload` | Upload audio/video song file for synchronized lyrics | Optional |
| `GET` | `/api/lyrics/my-songs` | Retrieve all songs saved in the user's vault | Yes |
| `DELETE`| `/api/lyrics/songs/:id` | Remove a song from the user's vault | Yes |
| `POST` | `/api/voice/tts` | Synthesize speech using Gnani Timbre Neural Voice | No |
| `GET` | `/api/health` | Service health status and Gnani model check | No |

---

## 📬 Contact & Developer Info

- **Developer**: Mayank Rajput
- **Phone**: [+91 8318915349](tel:+918318915349)
- **Email**: [mayankrajput5455@gmail.com](mailto:mayankrajput5455@gmail.com)
- **LinkedIn**: [linkedin.com/in/mayank5455](https://www.linkedin.com/in/mayank5455)
- **GitHub**: [github.com/mayankrajput5455](https://github.com/mayankrajput5455)

---

## 🛡️ License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## ❤️ Acknowledgements

- **[Gnani.ai](https://gnani.ai/)** for powering Indian language speech intelligence through Prisma ASR and Timbre TTS.
- **Artists and lyricists across India** whose poetry and melodies inspire accessible music technology.
