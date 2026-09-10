// Global error handler middleware

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/AuthService';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Don't leak internal error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred.'
    : err.message;

  res.status(500).json({ error: message });
}
