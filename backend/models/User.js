const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['hinglish', 'hi', 'en'],
    default: 'hinglish'
  },
  accessibilityMode: {
    highContrast: { type: Boolean, default: false },
    fontScale: { type: Number, default: 1.0 },
    speechRate: { type: Number, default: 1.0 },
    voiceGuideEnabled: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);

