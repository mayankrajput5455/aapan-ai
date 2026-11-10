const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB, isMongoActive } = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Static Files (Songs & Audio storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/voice', require('./routes/voice'));
app.use('/api/lyrics', require('./routes/lyricsRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Aapan AI Backend API (MERN Stack)',
    mongoConnected: isMongoActive(),
    models: {
      asr: 'Gnani Prisma Speech-to-Text v3',
      tts: 'Gnani Timbre Natural Indic TTS'
    },
    languagesSupported: ['hinglish', 'hi', 'en', 'mr', 'ta', 'bn'],
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5050;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] Aapan AI API server running on port ${PORT}`);
    console.log(`[Server] Health check available at http://localhost:${PORT}/api/health`);
  });
};

startServer();

