// authRoutes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const {
  handleGoogleToken,
  getCurrentUser,
  refreshToken,
  logout
} = require('../controllers/authController');

// Google OAuth Authentication
router.post('/google', handleGoogleToken);

// Get current authenticated user
router.get('/me', 
  passport.authenticate('jwt', { 
    session: false,
    failWithError: true 
  }),
  getCurrentUser,
  (err, req, res, next) => { // Error handler
    return res.status(401).json({ 
      success: false,
      message: err.message || 'Unauthorized' 
    });
  }
);

// Refresh access token
router.get('/refresh', refreshToken);

// Logout
router.post('/logout', logout);

// Health check endpoint
router.get('/status', (req, res) => {
  res.json({ status: 'Auth routes working' });
});

module.exports = router;