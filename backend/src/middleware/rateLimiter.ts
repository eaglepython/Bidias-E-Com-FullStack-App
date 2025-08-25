import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { cacheService } from '../services/cacheService';

// Default rate limiter
export const defaultRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiter
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Search rate limiter
export const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 searches per minute
  message: {
    error: 'Too many search requests, please slow down.',
    retryAfter: '1 minute'
  },
});

// Custom rate limiter function
export function rateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  return async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
      const key = options.keyGenerator ? options.keyGenerator(req) : req.ip || 'unknown';
      const rateLimitKey = `ratelimit:${key}:${Math.floor(Date.now() / options.windowMs)}`;
      
      const current = await cacheService.incrementRate(rateLimitKey, Math.ceil(options.windowMs / 1000));
      
      // Set headers
      res.set({
        'X-RateLimit-Limit': options.max.toString(),
        'X-RateLimit-Remaining': Math.max(0, options.max - current).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + options.windowMs).toISOString()
      });
      
      if (current > options.max) {
        res.status(429).json({
          error: options.message || 'Rate limit exceeded',
          retryAfter: Math.ceil(options.windowMs / 1000)
        });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(); // Allow request to proceed on error
    }
  };
}

// User-specific rate limiter
export function userRateLimit(windowMs: number, max: number) {
  return rateLimiter({
    windowMs,
    max,
    keyGenerator: (req: Request) => {
      const user = (req as any).user;
      return user ? `user:${user.id}` : req.ip || 'unknown';
    }
  });
}

// API endpoint specific rate limiters
export const apiRateLimiters = {
  // Product endpoints
  products: rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: { error: 'Too many product requests' }
  }),
  
  // Cart endpoints
  cart: rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: { error: 'Too many cart operations' }
  }),
  
  // Order endpoints
  orders: rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: { error: 'Too many order requests' }
  }),
  
  // Chat endpoints
  chat: rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: { error: 'Too many chat messages' }
  }),
  
  // Admin endpoints
  admin: rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { error: 'Too many admin requests' }
  })
};
