import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is missing. Using default fallback key for local dev.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: 'customer' | 'admin';
  };
}

export const authenticate = (req: any, res: Response, next: NextFunction) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    res.status(401).json({ error: 'Access denied. Session token missing.' });
    return;
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { userId: string; role: 'customer' | 'admin' };
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

export const authorizeAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
};
