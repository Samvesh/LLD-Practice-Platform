import { Router, Request, Response, NextFunction } from 'express';
import { AttemptService } from '../services/AttemptService';
import { SubmissionService } from '../services/SubmissionService';
import { authMiddleware } from '../middleware/auth';
import { AppError } from '../services/AuthService';

export function createAttemptRoutes(
  attemptService: AttemptService,
  submissionService: SubmissionService
): Router {
  const router = Router();

  // All attempt routes require authentication
  router.use(authMiddleware);

  // POST /api/attempts — start a new attempt
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const learnerId = req.learnerId!;
      const { problemId } = req.body;

      if (!problemId) {
        throw new AppError('problemId is required.', 400);
      }

      const attempt = await attemptService.startAttempt(learnerId, problemId);
      res.status(201).json({ attempt });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/attempts/problem/:problemId — get all attempts for a problem
  router.get('/problem/:problemId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const learnerId = req.learnerId!;
      const { problemId } = req.params;

      const attempts = await attemptService.getAttemptsByProblem(learnerId, problemId);

      // For each attempt, also fetch its submission if it exists
      const attemptsWithSubmissions = await Promise.all(
        attempts.map(async (attempt) => {
          const submission = await submissionService.getSubmissionByAttempt(attempt.id, learnerId);
          return { ...attempt, submission };
        })
      );

      res.json({ attempts: attemptsWithSubmissions });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/attempts/:id — get a single attempt
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const learnerId = req.learnerId!;
      const attempt = await attemptService.getAttemptById(req.params.id, learnerId);
      const submission = await submissionService.getSubmissionByAttempt(attempt.id, learnerId);
      res.json({ attempt, submission });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
