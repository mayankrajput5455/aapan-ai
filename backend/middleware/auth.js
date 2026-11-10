const jwt = require('jsonwebtoken');
const { isMongoActive, inMemoryStore } = require('../config/db');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'aapan_ai_super_secret_jwt_key_2026_indic_voice';

// Strict Auth Middleware: Rejects if token missing or invalid
const auth = async function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization token, access denied' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (isMongoActive()) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
    } else {
      const user = inMemoryStore.users.find(u => u._id === decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found in store' });
      }
      const { password, ...safeUser } = user;
      req.user = safeUser;
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Optional Auth Middleware: Attaches req.user if token is present, but doesn't block if absent
const optionalAuth = async function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return next();
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isMongoActive()) {
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    } else {
      const user = inMemoryStore.users.find(u => u._id === decoded.id);
      if (user) {
        const { password, ...safeUser } = user;
        req.user = safeUser;
      }
    }
  } catch (err) {
    // Continue without req.user
  }

  next();
};

module.exports = auth;
module.exports.auth = auth;
module.exports.optionalAuth = optionalAuth;
