import { Router, Request, Response, NextFunction } from 'express';
import { AuthService, AppError } from '../services/AuthService';
import { authLimiter } from '../middleware/rateLimiter';

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();

  // Rate limit auth endpoints
  router.use(authLimiter);

  // POST /api/auth/register
  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        throw new AppError('Email, name, and password are required.', 400);
      }

      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters.', 400);
      }

      const result = await authService.register(email, name, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  // POST /api/auth/login
  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required.', 400);
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
