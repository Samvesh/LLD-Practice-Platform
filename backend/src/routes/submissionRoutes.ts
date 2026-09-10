import { Router, Request, Response, NextFunction } from 'express';
import { SubmissionService } from '../services/SubmissionService';
import { authMiddleware } from '../middleware/auth';
import { submissionLimiter } from '../middleware/rateLimiter';
import { AppError } from '../services/AppError';

export function createSubmissionRoutes(submissionService: SubmissionService): Router {
  const router = Router();

  // All submission routes require authentication
  router.use(authMiddleware);

  // POST /api/submissions — submit a design solution
  // Rate limited: 5 per minute (LLM calls cost money)
  router.post('/', submissionLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const learnerId = req.learnerId!;
      const { attemptId, content, idempotencyKey } = req.body;

      if (!attemptId || !content || !idempotencyKey) {
        throw new AppError('attemptId, content, and idempotencyKey are required.', 400);
      }

      if (!content.format || content.format !== 'text' || typeof content.body !== 'string') {
        throw new AppError('content must have format "text" and a string body.', 400);
      }

      const submission = await submissionService.submit(
        learnerId,
        attemptId,
        content,
        idempotencyKey
      );

      // Return 202 Accepted — evaluation happens asynchronously
      res.status(202).json({ submission });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/submissions/:id/retry — retry a failed evaluation
  router.post('/:id/retry', submissionLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const learnerId = req.learnerId!;
      const submission = await submissionService.retryEvaluation(req.params.id, learnerId);
      res.status(202).json({ submission });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/submissions/:id — get submission status + feedback
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const learnerId = req.learnerId!;
      const submission = await submissionService.getSubmission(req.params.id, learnerId);
      res.json({ submission });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
