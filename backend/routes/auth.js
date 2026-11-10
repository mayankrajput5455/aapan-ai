const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isMongoActive, inMemoryStore } = require('../config/db');
const User = require('../models/User');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'aapan_ai_super_secret_jwt_key_2026_indic_voice';

// @route   POST /api/auth/register
// @desc    Register new user
router.post('/register', async (req, res) => {
  const { name, email, password, language, accessibilityMode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'कृपया सभी आवश्यक फ़ील्ड भरें (Please fill all required fields)' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (isMongoActive()) {
      let existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'यह ईमेल पहले से पंजीकृत है (Email already registered)' });
      }

      const newUser = new User({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        language: language || 'hinglish',
        accessibilityMode: accessibilityMode || { highContrast: false, fontScale: 1.0, speechRate: 1.0, voiceGuideEnabled: true }
      });

      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          language: newUser.language,
          accessibilityMode: newUser.accessibilityMode
        }
      });
    } else {
      // In-Memory store
      const existingUser = inMemoryStore.users.find(u => u.email === cleanEmail);
      if (existingUser) {
        return res.status(400).json({ message: 'यह ईमेल पहले से पंजीकृत है (Email already registered)' });
      }

      const newId = 'user-' + Date.now();
      const newUser = {
        _id: newId,
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        language: language || 'hinglish',
        accessibilityMode: accessibilityMode || { highContrast: false, fontScale: 1.0, speechRate: 1.0, voiceGuideEnabled: true },
        createdAt: new Date().toISOString()
      };

      inMemoryStore.users.push(newUser);
      const token = jwt.sign({ id: newId }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        token,
        user: {
          id: newId,
          name: newUser.name,
          email: newUser.email,
          language: newUser.language,
          accessibilityMode: newUser.accessibilityMode
        }
      });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'सर्वर त्रुटि (Server error during registration)' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'ईमेल और पासवर्ड दर्ज करें (Email and password required)' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    let user = null;

    if (isMongoActive()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = inMemoryStore.users.find(u => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(400).json({ message: 'अमान्य क्रेडेंशियल्स (Invalid email or password)' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'अमान्य क्रेडेंशियल्स (Invalid email or password)' });
    }

    const token = jwt.sign({ id: user._id || user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        language: user.language,
        accessibilityMode: user.accessibilityMode
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'सर्वर त्रुटि (Server error during login)' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// @route   PUT /api/auth/preferences
// @desc    Update user accessibility & language preferences
router.put('/preferences', auth, async (req, res) => {
  const { language, accessibilityMode } = req.body;

  try {
    if (isMongoActive()) {
      const user = await User.findById(req.user.id || req.user._id);
      if (language) user.language = language;
      if (accessibilityMode) user.accessibilityMode = { ...user.accessibilityMode, ...accessibilityMode };
      await user.save();
      return res.json({ message: 'प्राथमिकताएं सहेजी गईं (Preferences updated)', user });
    } else {
      const user = inMemoryStore.users.find(u => u._id === (req.user.id || req.user._id));
      if (user) {
        if (language) user.language = language;
        if (accessibilityMode) user.accessibilityMode = { ...user.accessibilityMode, ...accessibilityMode };
      }
      return res.json({ message: 'प्राथमिकताएं सहेजी गईं (Preferences updated)', user });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating preferences' });
  }
});

module.exports = router;

