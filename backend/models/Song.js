const mongoose = require('mongoose');

const LyricLineSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  time: { type: Number, required: true },
  endTime: { type: Number },
  section: { type: String, default: 'Verse' },
  isMusic: { type: Boolean, default: false },
  hindi: { type: String, default: '' },
  hinglish: { type: String, default: '' },
  english: { type: String, default: '' }
}, { _id: false });

const SongSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    default: 'Aapan AI Music Studio'
  },
  originalFileName: {
    type: String,
    default: 'song.mp3'
  },
  audioUrl: {
    type: String,
    required: true
  },
  youtubeId: {
    type: String,
    default: ''
  },
  youtubeUrl: {
    type: String,
    default: ''
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  sourceType: {
    type: String,
    enum: ['upload', 'youtube', 'custom', 'sample'],
    default: 'upload'
  },
  duration: {
    type: Number,
    default: 180
  },
  bpm: {
    type: Number,
    default: 100
  },
  mood: {
    type: String,
    default: 'Indic Melodic'
  },
  coverGradient: {
    type: String,
    default: 'from-amber-500 to-rose-600'
  },
  lyrics: [LyricLineSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Song', SongSchema);

