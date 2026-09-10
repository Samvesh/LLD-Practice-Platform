// JWT authentication middleware
// Extracts learnerId from JWT and attaches it to the request.
// Every protected route gets learnerId from here — the source of truth for ownership checks.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthTokenPayload } from '../services/AuthService';

// Extend Express Request type to include learnerId
declare global {
  namespace Express {
    interface Request {
      learnerId?: string;
      learnerEmail?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    req.learnerId = decoded.learnerId;
    req.learnerEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
