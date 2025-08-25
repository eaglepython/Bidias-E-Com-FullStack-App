import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

// Rate limit auth endpoints
const authRateLimit = rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

router.post('/register', authRateLimit, authController.register);
router.post('/login', authRateLimit, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authRateLimit, authController.forgotPassword);
router.post('/reset-password', authRateLimit, authController.resetPassword);

export default router;
