const mongoose = require('mongoose');

const connectDB = async () => {
  // Debug output (sanitized)
  const sanitizedURI = process.env.MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)/, '$1*****');
  console.log('Connecting with:', sanitizedURI);

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });
    console.log('✅ MongoDB connected to:', mongoose.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('Please verify:');
    console.log('1. Your .env file contains correct MONGODB_URI');
    console.log('2. Your IP is whitelisted in MongoDB Atlas');
    console.log('3. Your password is URL-encoded if it contains special chars');
    process.exit(1);
  }
};

module.exports = connectDB;