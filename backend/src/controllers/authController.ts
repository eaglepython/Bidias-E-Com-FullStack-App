import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { ApiError, catchAsync } from '../utils/apiError';
import { cacheService } from '../services/cacheService';
import { emailService } from '../services/emailService';

export class AuthController {
  // Register new user
  register = catchAsync(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User already exists with this email');
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    // Cache refresh token
    await cacheService.set(`refresh_token:${user._id}`, refreshToken, 7 * 24 * 3600); // 7 days

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      refreshToken,
    });
  });

  // User login
  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(401, 'Account is deactivated');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Generate tokens
    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    // Cache refresh token
    await cacheService.set(`refresh_token:${user._id}`, refreshToken, 7 * 24 * 3600); // 7 days

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      refreshToken,
    });
  });

  // User logout
  logout = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    if (user) {
      // Remove refresh token from cache
      await cacheService.del(`refresh_token:${user.id}`);
      
      // Add token to blacklist
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.decode(token) as any;
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        await cacheService.set(`blacklist:${token}`, true, expiresIn);
      }
    }

    res.json({
      message: 'Logout successful',
    });
  });

  // Refresh token
  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      // Check if refresh token exists in cache
      const cachedToken = await cacheService.get(`refresh_token:${decoded.id}`);
      if (cachedToken !== refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Find user
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new ApiError(401, 'User not found or inactive');
      }

      // Generate new tokens
      const newToken = this.generateToken(user._id);
      const newRefreshToken = this.generateRefreshToken(user._id);

      // Update cached refresh token
      await cacheService.set(`refresh_token:${user._id}`, newRefreshToken, 7 * 24 * 3600);

      res.json({
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  });

  // Forgot password
  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        message: 'If the email exists, a reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = this.generateResetToken(user._id);
    
    // Cache reset token (15 minutes expiry)
    await cacheService.set(`reset_token:${user._id}`, resetToken, 15 * 60);

    // TODO: Send email with reset link
    // await emailService.sendPasswordReset(user.email, resetToken);

    return res.json({
      message: 'If the email exists, a reset link has been sent',
    });
  });

  // Reset password
  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, 'Token and new password are required');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET!) as any;
      
      // Check if reset token exists in cache
      const cachedToken = await cacheService.get(`reset_token:${decoded.id}`);
      if (cachedToken !== token) {
        throw new ApiError(401, 'Invalid or expired reset token');
      }

      // Find user and update password
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      user.password = newPassword;
      await user.save();

      // Remove reset token
      await cacheService.del(`reset_token:${decoded.id}`);

      res.json({
        message: 'Password reset successful',
      });
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired reset token');
    }
  });

  // Generate JWT access token
  private generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET as jwt.Secret;
  const exp = Number(process.env.JWT_EXPIRES_IN) || 3600; // seconds
  return jwt.sign({ id: userId }, secret, { expiresIn: exp });
  }

  // Generate JWT refresh token
  private generateRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET as jwt.Secret;
  const exp = 7 * 24 * 3600; // 7 days
  return jwt.sign({ id: userId }, secret, { expiresIn: exp });
  }

  // Generate password reset token
  private generateResetToken(userId: string): string {
  const secret = process.env.JWT_RESET_SECRET as jwt.Secret;
  const exp = 15 * 60; // 15 minutes
  return jwt.sign({ id: userId }, secret, { expiresIn: exp });
  }
}
