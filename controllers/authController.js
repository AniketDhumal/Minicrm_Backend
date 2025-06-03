const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
};

const getJwtRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not configured');
  return secret;
};

const handleGoogleToken = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets not configured in environment variables');
    }
    const { credential } = req.body;
    
    // 1. Verify token exists
    if (!credential) {
      return res.status(400).json({ error: "Google token missing" });
    }

    // 2. Decode Google token
    const decoded = jwt.decode(credential);
    if (!decoded?.email) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    // 3. Find or create user (as you already have working)
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      user = await User.create({
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
        role: 'user'
      });
    }

    // 4. Generate tokens (CRUCIAL FIX)
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets not configured");
    }
    
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // 6. Set cookies (IMPORTANT FIX)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
      domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.yourdomain.com'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      maxAge: 604800000, // 7 days
      domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.yourdomain.com'
    });

    // 7. Send response
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    // Check if user exists in request (added by passport)
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }

    const { _id, name, email, avatar, role } = req.user;
    
    res.json({ 
      success: true,
      user: {
        id: _id,
        name,
        email,
        avatar,
        role
      }
    });
  } catch (err) {
    console.error("Error in /me endpoint:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateToken(user);
    
    res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', 
  maxAge: 3600000,
  domain: 'localhost' 
});
    res.json({ message: 'Token refreshed' });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.decode(refreshToken);
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
};

module.exports = { 
  handleGoogleToken, 
  getCurrentUser,
  refreshToken,
  logout
};