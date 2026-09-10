// Express application entry point
// Wires up all middleware, services, repositories, and routes.

import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/db';
import { env } from './config/env';
import { DEFAULT_LLD_RUBRIC } from './config/rubric';

// Middleware
import { generalLimiter } from './middleware/rateLimiter';
import { sanitizeMiddleware } from './middleware/sanitize';
import { errorHandler } from './middleware/errorHandler';

// Repositories
import { MongoProblemRepository } from './infrastructure/repositories/MongoProblemRepository';
import { MongoLearnerRepository } from './infrastructure/repositories/MongoLearnerRepository';
import { MongoAttemptRepository } from './infrastructure/repositories/MongoAttemptRepository';
import { MongoSubmissionRepository } from './infrastructure/repositories/MongoSubmissionRepository';

// Domain
import { RuleBasedEvaluator } from './domain/evaluators/RuleBasedEvaluator';
import { LLMEvaluator } from './domain/evaluators/LLMEvaluator';

// Services
import { AuthService } from './services/AuthService';
import { ProblemService } from './services/ProblemService';
import { AttemptService } from './services/AttemptService';
import { EvaluationService } from './services/EvaluationService';
import { SubmissionService } from './services/SubmissionService';

// Routes
import { createAuthRoutes } from './routes/authRoutes';
import { createProblemRoutes } from './routes/problemRoutes';
import { createAttemptRoutes } from './routes/attemptRoutes';
import { createSubmissionRoutes } from './routes/submissionRoutes';

async function main() {
  // Connect to MongoDB
  await connectDatabase();

  const app = express();

  // --- Global Middleware ---
  app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(generalLimiter);
  app.use(sanitizeMiddleware);

  // --- Dependency Injection (manual, no DI container needed for a monolith) ---

  // Repositories
  const problemRepo = new MongoProblemRepository();
  const learnerRepo = new MongoLearnerRepository();
  const attemptRepo = new MongoAttemptRepository();
  const submissionRepo = new MongoSubmissionRepository();

  // Evaluators (Strategy pattern)
  const gateEvaluator = new RuleBasedEvaluator();
  const judgeEvaluator = new LLMEvaluator(env.GEMINI_API_KEY);

  // Services
  const authService = new AuthService(learnerRepo);
  const problemService = new ProblemService(problemRepo);
  const attemptService = new AttemptService(attemptRepo, problemRepo);
  const evaluationService = new EvaluationService(
    gateEvaluator,
    judgeEvaluator,
    submissionRepo,
    DEFAULT_LLD_RUBRIC
  );
  const submissionService = new SubmissionService(
    submissionRepo,
    attemptRepo,
    problemRepo,
    evaluationService
  );

  // --- Routes ---
  app.use('/api/auth', createAuthRoutes(authService));
  app.use('/api/problems', createProblemRoutes(problemService));
  app.use('/api/attempts', createAttemptRoutes(attemptService, submissionService));
  app.use('/api/submissions', createSubmissionRoutes(submissionService));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Error Handler (must be last) ---
  app.use(errorHandler);

  // --- Start Server ---
  app.listen(env.PORT, () => {
    console.log(`🚀 LLD Practice Platform backend running on port ${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   CORS origin: ${env.FRONTEND_URL}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
