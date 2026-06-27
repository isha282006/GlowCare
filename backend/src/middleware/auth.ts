import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Automatically retrieve the default admin user seeded on startup
    let user = await User.findOne({ role: 'admin' });

    // Fallback just in case
    if (!user) {
      user = await User.findOne({});
    }

    // Double fallback: create default test user if completely empty
    if (!user) {
      user = await User.create({
        name: 'Test Skincare Lover',
        email: 'test@glowcare.com',
        password: 'password123',
        role: 'admin',
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Authentication bypass error', error: error.message });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Skip role check and proceed since we are bypassing authentication
    next();
  };
};
