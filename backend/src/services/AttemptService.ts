// AttemptService — manages learner attempts for problems.

import { IAttemptRepository, IProblemRepository } from '../domain/interfaces/Repository';
import { Attempt } from '../domain/entities/Attempt';
import { AppError } from './AppError';

export class AttemptService {
  constructor(
    private attemptRepo: IAttemptRepository,
    private problemRepo: IProblemRepository
  ) {}

  async startAttempt(learnerId: string, problemId: string): Promise<Attempt> {
    // Verify the problem exists
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    // Get the current attempt count for numbering
    const count = await this.attemptRepo.countByLearnerAndProblem(learnerId, problemId);

    const attempt = await this.attemptRepo.create({
      learnerId,
      problemId,
      attemptNumber: count + 1,
      startedAt: new Date(),
    });

    return attempt;
  }

  async getAttemptsByProblem(learnerId: string, problemId: string): Promise<Attempt[]> {
    return this.attemptRepo.findByLearnerAndProblem(learnerId, problemId);
  }

  async getAttemptById(id: string, learnerId: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(id);
    if (!attempt) {
      throw new AppError('Attempt not found', 404);
    }
    // IDOR defense: verify ownership
    if (attempt.learnerId !== learnerId) {
      throw new AppError('Access denied', 403);
    }
    return attempt;
  }
}
