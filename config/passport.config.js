const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model');

module.exports = function () {
  // JWT Strategy for protected routes
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (err) {
        console.error('JWT verification error:', err);
        return done(err, false);
      }
    })
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if a user with this email already exists
          const existingUser = await User.findOne({ email: profile.emails[0].value });

          if (existingUser) {
            // If user with this email exists but doesn't have Google ID, update the user
            if (existingUser.authMethod === 'local') {
              existingUser.googleId = profile.id;
              existingUser.picture = profile.photos[0].value;
              await existingUser.save();
              return done(null, existingUser);
            }
            return done(null, existingUser);
          }

          // Create a new user
          const newUser = new User({
            username: profile.displayName.replace(/\s/g, '') + profile.id.substring(0, 5),
            email: profile.emails[0].value,
            googleId: profile.id,
            picture: profile.photos[0].value,
            authMethod: 'google',
          });

          // Save the new user
          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, false);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};