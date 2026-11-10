const express = require('express');
const router = express.Router();
const lyricsController = require('../controllers/lyricsController');
const { auth, optionalAuth } = require('../middleware/auth');

// GET /api/lyrics/samples - Curated sample songs
router.get('/samples', lyricsController.getSamples);

// POST /api/lyrics/extract - Transcribe music in real time and persist to user account if logged in
router.post('/extract', optionalAuth, lyricsController.extractLyrics);

// POST /api/lyrics/from-youtube - Direct YouTube video song link to synchronized lyrics without file download
router.post('/from-youtube', optionalAuth, lyricsController.extractFromYouTube);

// GET /api/lyrics/my-songs - List user's uploaded songs from database
router.get('/my-songs', auth, lyricsController.getMySongs);

// DELETE /api/lyrics/my-songs/:id - Delete an uploaded song
router.delete('/my-songs/:id', auth, lyricsController.deleteMySong);

module.exports = router;
