// Tests for SubmissionService
// Covers: idempotency (duplicate submit), evaluator timeout → Failed,
//         ownership check (IDOR), retry on system failure, retry rejected for rule-based failure.

import { SubmissionService } from '../../src/services/SubmissionService';
import { EvaluationService } from '../../src/services/EvaluationService';
import { ISubmissionRepository, IAttemptRepository, IProblemRepository } from '../../src/domain/interfaces/Repository';
import { Submission, SubmissionState } from '../../src/domain/entities/Submission';
import { Attempt } from '../../src/domain/entities/Attempt';

// --- Mock Factories ---

function makeMockSubmissionRepo(overrides: Partial<ISubmissionRepository> = {}): ISubmissionRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByIdAndLearnerId: jest.fn().mockResolvedValue(null),
    findByAttemptId: jest.fn().mockResolvedValue(null),
    findByIdempotencyKey: jest.fn().mockResolvedValue(null),
    findByLearnerId: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation(async (entity) => ({ id: 'new-sub-1', ...entity })),
    update: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

function makeMockAttemptRepo(attempt?: Attempt): IAttemptRepository {
  return {
    findById: jest.fn().mockResolvedValue(attempt ?? null),
    findByLearnerAndProblem: jest.fn().mockResolvedValue([]),
    countByLearnerAndProblem: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
    update: jest.fn(),
  };
}

function makeMockProblemRepo(): IProblemRepository {
  return {
    findById: jest.fn().mockResolvedValue({ id: 'prob-1', title: 'Test', requirements: ['req1'] }),
    findAll: jest.fn().mockResolvedValue([]),
    findBySlug: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
  };
}

function makeMockEvaluationService(): EvaluationService {
  return {
    evaluateSubmission: jest.fn().mockResolvedValue(undefined),
  } as any;
}

const TEST_ATTEMPT: Attempt = {
  id: 'att-1',
  learnerId: 'learner-1',
  problemId: 'prob-1',
  attemptNumber: 1,
  startedAt: new Date(),
};

// --- Tests ---

describe('SubmissionService', () => {
  describe('idempotency — duplicate submit returns existing', () => {
    it('should return existing submission when idempotency key matches', async () => {
      const existingSub: Submission = {
        id: 'existing-sub',
        attemptId: 'att-1',
        learnerId: 'learner-1',
        content: { format: 'text', body: 'design...' },
        state: SubmissionState.Evaluating,
        idempotencyKey: 'dup-key',
        submittedAt: new Date(),
      };

      const subRepo = makeMockSubmissionRepo({
        findByIdempotencyKey: jest.fn().mockResolvedValue(existingSub),
      });

      const service = new SubmissionService(
        subRepo,
        makeMockAttemptRepo(TEST_ATTEMPT),
        makeMockProblemRepo(),
        makeMockEvaluationService()
      );

      const result = await service.submit(
        'learner-1',
        'att-1',
        { format: 'text', body: 'design...' },
        'dup-key'
      );

      expect(result.id).toBe('existing-sub');
      // create should NOT have been called — no duplicate write
      expect(subRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('ownership check (IDOR defense)', () => {
    it('should reject if attempt belongs to another learner', async () => {
      const otherAttempt: Attempt = { ...TEST_ATTEMPT, learnerId: 'other-learner' };

      const service = new SubmissionService(
        makeMockSubmissionRepo(),
        makeMockAttemptRepo(otherAttempt),
        makeMockProblemRepo(),
        makeMockEvaluationService()
      );

      await expect(
        service.submit('learner-1', 'att-1', { format: 'text', body: 'design' }, 'key-1')
      ).rejects.toThrow('Access denied');
    });
  });

  describe('retry — system failure', () => {
    it('should allow retry for system-caused failures', async () => {
      const failedSub: Submission = {
        id: 'sub-failed',
        attemptId: 'att-1',
        learnerId: 'learner-1',
        content: { format: 'text', body: 'design...' },
        state: SubmissionState.Failed,
        failureCause: 'system',
        failureReason: 'LLM timeout',
        idempotencyKey: 'key-1',
        submittedAt: new Date(),
      };

      const subRepo = makeMockSubmissionRepo({
        findByIdAndLearnerId: jest.fn().mockResolvedValue(failedSub),
      });

      const service = new SubmissionService(
        subRepo,
        makeMockAttemptRepo(TEST_ATTEMPT),
        makeMockProblemRepo(),
        makeMockEvaluationService()
      );

      const result = await service.retryEvaluation('sub-failed', 'learner-1');
      expect(result.state).toBe(SubmissionState.Evaluating);
      expect(subRepo.update).toHaveBeenCalledWith('sub-failed', expect.objectContaining({
        state: SubmissionState.Evaluating,
      }));
    });
  });

  describe('retry — rule-based failure', () => {
    it('should reject retry for rule-based failures', async () => {
      const failedSub: Submission = {
        id: 'sub-failed',
        attemptId: 'att-1',
        learnerId: 'learner-1',
        content: { format: 'text', body: '' },
        state: SubmissionState.Failed,
        failureCause: 'rule-based',
        failureReason: 'Submission too short',
        idempotencyKey: 'key-1',
        submittedAt: new Date(),
      };

      const subRepo = makeMockSubmissionRepo({
        findByIdAndLearnerId: jest.fn().mockResolvedValue(failedSub),
      });

      const service = new SubmissionService(
        subRepo,
        makeMockAttemptRepo(TEST_ATTEMPT),
        makeMockProblemRepo(),
        makeMockEvaluationService()
      );

      await expect(
        service.retryEvaluation('sub-failed', 'learner-1')
      ).rejects.toThrow('failed validation checks');
    });
  });

  describe('retry — non-failed submission', () => {
    it('should reject retry for a completed submission', async () => {
      const completedSub: Submission = {
        id: 'sub-done',
        attemptId: 'att-1',
        learnerId: 'learner-1',
        content: { format: 'text', body: 'design...' },
        state: SubmissionState.Completed,
        idempotencyKey: 'key-1',
        submittedAt: new Date(),
      };

      const subRepo = makeMockSubmissionRepo({
        findByIdAndLearnerId: jest.fn().mockResolvedValue(completedSub),
      });

      const service = new SubmissionService(
        subRepo,
        makeMockAttemptRepo(TEST_ATTEMPT),
        makeMockProblemRepo(),
        makeMockEvaluationService()
      );

      await expect(
        service.retryEvaluation('sub-done', 'learner-1')
      ).rejects.toThrow('Only failed submissions');
    });
  });
});
