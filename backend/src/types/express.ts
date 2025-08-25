import { Request } from 'express';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface User extends IUser {
      id: string;
      isAdmin?: boolean;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: IUser & { id: string; isAdmin?: boolean };
}
