import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; tier?: 'free' | 'trial' | 'pro' };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    req.user = { userId: decoded.userId, email: decoded.email, tier: decoded.tier || 'free' };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requirePro = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.tier !== 'pro') {
    return res.status(403).json({ error: 'Pro plan required' });
  }

  next();
};
