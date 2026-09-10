import { Router, Request, Response, NextFunction } from 'express';
import { ProblemService } from '../services/ProblemService';
import { authMiddleware } from '../middleware/auth';

export function createProblemRoutes(problemService: ProblemService): Router {
  const router = Router();

  // All problem routes require authentication
  router.use(authMiddleware);

  // GET /api/problems — list all problems
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const problems = await problemService.getAllProblems();
      res.json({ problems });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/problems/:id — get a single problem
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await problemService.getProblemById(req.params.id);
      res.json({ problem });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
