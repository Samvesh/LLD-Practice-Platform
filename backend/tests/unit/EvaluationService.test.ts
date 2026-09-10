// Tests for EvaluationService
// Covers: gate fails → Failed (rule-based), gate passes + LLM succeeds → Completed,
//         gate passes + LLM errors → Failed (system), LLM returns invalid output → Failed (system).

import { EvaluationService } from '../../src/services/EvaluationService';
import { GateEvaluator, Evaluator, GateResult } from '../../src/domain/interfaces/Evaluator';
import { ISubmissionRepository } from '../../src/domain/interfaces/Repository';
import { Submission, SubmissionState } from '../../src/domain/entities/Submission';
import { EvaluationResult } from '../../src/domain/entities/EvaluationResult';
import { Rubric } from '../../src/domain/rubric/Rubric';
import { DEFAULT_LLD_RUBRIC } from '../../src/domain/rubric/Rubric';

// --- Mocks ---

function makeSubmission(overrides: Partial<Submission> = {}): Submission {
  return {
    id: 'sub-1',
    attemptId: 'att-1',
    learnerId: 'learner-1',
    content: { format: 'text' as const, body: 'A valid design with class and interface...' },
    state: SubmissionState.Evaluating,
    idempotencyKey: 'key-1',
    submittedAt: new Date(),
    ...overrides,
  };
}

function makeMockGate(result: GateResult): GateEvaluator {
  return {
    type: 'rule-based',
    check: jest.fn().mockReturnValue(result),
  };
}

function makeMockJudge(result?: EvaluationResult, error?: Error): Evaluator {
  return {
    type: 'llm',
    evaluate: error
      ? jest.fn().mockRejectedValue(error)
      : jest.fn().mockResolvedValue(result),
  };
}

function makeMockRepo(): ISubmissionRepository {
  return {
    findById: jest.fn(),
    findByIdAndLearnerId: jest.fn(),
    findByAttemptId: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    findByLearnerId: jest.fn(),
    create: jest.fn(),
    update: jest.fn().mockResolvedValue(null),
  };
}

const mockEvalResult: EvaluationResult = {
  feedbacks: DEFAULT_LLD_RUBRIC.dimensions.map(d => ({
    criterion: d.criterion,
    score: 7,
    maxScore: 10,
    evidence: 'Good coverage',
    concern: 'Minor gaps',
    suggestion: 'Add more detail',
    confidence: 0.85,
  })),
  overallScore: 7,
  evaluatedAt: new Date(),
  evaluatorType: 'llm',
};

// --- Tests ---

describe('EvaluationService', () => {
  describe('gate fails', () => {
    it('should mark submission Failed with rule-based cause', async () => {
      const gate = makeMockGate({ passed: false, reason: 'Submission too short' });
      const judge = makeMockJudge(mockEvalResult);
      const repo = makeMockRepo();
      const service = new EvaluationService(gate, judge, repo, DEFAULT_LLD_RUBRIC);

      await service.evaluateSubmission(makeSubmission(), ['req1']);

      // Gate should be called
      expect(gate.check).toHaveBeenCalled();
      // Judge should NOT be called (gate saves the API call)
      expect(judge.evaluate).not.toHaveBeenCalled();
      // Submission should be updated to Failed
      expect(repo.update).toHaveBeenCalledWith('sub-1', expect.objectContaining({
        state: SubmissionState.Failed,
        failureCause: 'rule-based',
        failureReason: 'Submission too short',
      }));
    });
  });

  describe('gate passes + LLM succeeds', () => {
    it('should mark submission Completed with evaluation result', async () => {
      const gate = makeMockGate({ passed: true });
      const judge = makeMockJudge(mockEvalResult);
      const repo = makeMockRepo();
      const service = new EvaluationService(gate, judge, repo, DEFAULT_LLD_RUBRIC);

      await service.evaluateSubmission(makeSubmission(), ['req1']);

      expect(gate.check).toHaveBeenCalled();
      expect(judge.evaluate).toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith('sub-1', expect.objectContaining({
        state: SubmissionState.Completed,
        evaluationResult: mockEvalResult,
      }));
    });
  });

  describe('gate passes + LLM errors (timeout/crash)', () => {
    it('should mark submission Failed with system cause', async () => {
      const gate = makeMockGate({ passed: true });
      const judge = makeMockJudge(undefined, new Error('LLM timeout after 30s'));
      const repo = makeMockRepo();
      const service = new EvaluationService(gate, judge, repo, DEFAULT_LLD_RUBRIC);

      await service.evaluateSubmission(makeSubmission(), ['req1']);

      expect(judge.evaluate).toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith('sub-1', expect.objectContaining({
        state: SubmissionState.Failed,
        failureCause: 'system',
      }));
      // Error message should be preserved
      const updateCall = (repo.update as jest.Mock).mock.calls[0][1];
      expect(updateCall.failureReason).toContain('LLM timeout');
    });
  });

  describe('gate passes + LLM returns invalid output (Zod validation failure)', () => {
    it('should mark submission Failed with system cause', async () => {
      const gate = makeMockGate({ passed: true });
      const judge = makeMockJudge(undefined, new Error('LLM output missing required rubric dimensions'));
      const repo = makeMockRepo();
      const service = new EvaluationService(gate, judge, repo, DEFAULT_LLD_RUBRIC);

      await service.evaluateSubmission(makeSubmission(), ['req1']);

      expect(repo.update).toHaveBeenCalledWith('sub-1', expect.objectContaining({
        state: SubmissionState.Failed,
        failureCause: 'system',
      }));
    });
  });
});
