const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const jwtOptions = {
  jwtFromRequest: (req) => {
    // Try to get token from cookies first
    if (req && req.cookies && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }
    // Fallback to Authorization header
    return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  },
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true
};

module.exports = function(passport) {
  passport.use(new JwtStrategy(jwtOptions, async (req, jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id);
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }));
};