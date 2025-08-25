import { Router } from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';

const router = Router();

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      const user = req.user as any;
      
      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ error: 'JWT_SECRET is not defined' });
      }
      
      const tokenPayload = { 
        id: user._id || user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
      const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1h' });

      // Generate refresh token
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!jwtRefreshSecret) {
        return res.status(500).json({ error: 'JWT_REFRESH_SECRET is not defined' });
      }
      
      const refreshToken = jwt.sign({ id: user._id || user.id }, jwtRefreshSecret, { expiresIn: '7d' });

      // Redirect to frontend with tokens
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendURL}/auth/callback?token=${token}&refreshToken=${refreshToken}&provider=google`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendURL}/login?error=oauth_failed`);
    }
  }
);

// Facebook OAuth routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    try {
      const user = req.user as any;
      
      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ error: 'JWT_SECRET is not defined' });
      }
      
      const tokenPayload = { 
        id: user._id || user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
      const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1h' });

      // Generate refresh token
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!jwtRefreshSecret) {
        return res.status(500).json({ error: 'JWT_REFRESH_SECRET is not defined' });
      }
      
      const refreshToken = jwt.sign({ id: user._id || user.id }, jwtRefreshSecret, { expiresIn: '7d' });

      // Redirect to frontend with tokens
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendURL}/auth/callback?token=${token}&refreshToken=${refreshToken}&provider=facebook`);
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendURL}/login?error=oauth_failed`);
    }
  }
);

// OAuth failure route
router.get('/failure', (req, res) => {
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendURL}/login?error=oauth_failed`);
});

export default router;
