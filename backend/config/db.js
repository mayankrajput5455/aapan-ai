const mongoose = require('mongoose');

// In-Memory store fallback in case local MongoDB service is not started
const inMemoryStore = {
  users: [
    {
      _id: "user-demo-001",
      name: "रामेश्वर प्रसाद (डेमो)",
      email: "rameshwar@gnani.ai",
      password: "$2a$10$VleRRBXNOF3YsvXHNKvk6.qf.9H9ukf44ENjDfYt3otOXL4OpMhiu", // aapan1234
      language: "hinglish",
      accessibilityMode: { highContrast: false, fontScale: 1.0, speechRate: 1.0, voiceGuideEnabled: true },
      createdAt: new Date().toISOString()
    }
  ],
  songs: []
};

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aapan_ai';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnectedToMongo = true;
    console.log(`[Database] MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`[Database] MongoDB connection failed: ${err.message}. Using seamless High-Speed In-Memory Database store fallback.`);
  }
};

module.exports = {
  connectDB,
  isMongoActive: () => isConnectedToMongo && mongoose.connection.readyState === 1,
  inMemoryStore
};

