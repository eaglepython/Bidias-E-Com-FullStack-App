import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models/User';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.BACKEND_URL || 'https://your-backend-service.onrender.com'
    : 'http://localhost:4000';
    
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${baseUrl}/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        const userObj = {
          ...user.toObject(),
          id: user._id.toString()
        };
        return done(null, userObj as any);
      }
      
      // Check if user exists with same email
      const existingUser = await User.findOne({ email: profile.emails?.[0]?.value });
      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = profile.id;
        await existingUser.save();
        const userObj = {
          ...existingUser.toObject(),
          id: existingUser._id.toString()
        };
        return done(null, userObj as any);
      }
      
      // Create new user
      user = new User({
        googleId: profile.id,
        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
        lastName: profile.name?.familyName || profile.displayName?.split(' ')[1] || '',
        email: profile.emails?.[0]?.value || '',
        avatar: profile.photos?.[0]?.value || '',
        isActive: true,
        emailVerified: true, // Google accounts are pre-verified
        authProvider: 'google'
      });
      
      await user.save();
      const userObj = {
        ...user.toObject(),
        id: user._id.toString()
      };
      return done(null, userObj as any);
    } catch (error) {
      return done(error, undefined);
    }
  }));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.BACKEND_URL || 'https://your-backend-service.onrender.com'
    : 'http://localhost:4000';
    
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${baseUrl}/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Facebook ID
      let user = await User.findOne({ facebookId: profile.id });
      
      if (user) {
        const userObj = {
          ...user.toObject(),
          id: user._id.toString()
        };
        return done(null, userObj as any);
      }
      
      // Check if user exists with same email
      const existingUser = await User.findOne({ email: profile.emails?.[0]?.value });
      if (existingUser) {
        // Link Facebook account to existing user
        existingUser.facebookId = profile.id;
        await existingUser.save();
        const userObj = {
          ...existingUser.toObject(),
          id: existingUser._id.toString()
        };
        return done(null, userObj as any);
      }
      
      // Create new user
      user = new User({
        facebookId: profile.id,
        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
        lastName: profile.name?.familyName || profile.displayName?.split(' ')[1] || '',
        email: profile.emails?.[0]?.value || '',
        avatar: profile.photos?.[0]?.value || '',
        isActive: true,
        emailVerified: true, // Facebook accounts are pre-verified
        authProvider: 'facebook'
      });
      
      await user.save();
      const userObj = {
        ...user.toObject(),
        id: user._id.toString()
      };
      return done(null, userObj as any);
    } catch (error) {
      return done(error, undefined);
    }
  }));
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-password');
    if (user) {
      // Convert mongoose document to plain object with id field
      const userObj = {
        ...user.toObject(),
        id: user._id.toString()
      };
      done(null, userObj as any);
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;
