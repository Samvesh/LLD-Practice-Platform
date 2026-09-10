// SubmissionService — orchestrates the submit + async evaluation flow.
// Implements: persist-first, idempotency, async eval, retry.

import { ISubmissionRepository, IAttemptRepository, IProblemRepository } from '../domain/interfaces/Repository';
import { Submission, SubmissionState, SubmissionContent } from '../domain/entities/Submission';
import { SubmissionStateMachine } from '../domain/state-machine/SubmissionStateMachine';
import { EvaluationService } from './EvaluationService';
import { AppError } from './AppError';

export class SubmissionService {
  constructor(
    private submissionRepo: ISubmissionRepository,
    private attemptRepo: IAttemptRepository,
    private problemRepo: IProblemRepository,
    private evaluationService: EvaluationService
  ) {}

  /**
   * Submit a design solution for an attempt.
   * 
   * Flow (per FIX 1):
   * 1. Check idempotency key — return existing if found
   * 2. Verify attempt ownership
   * 3. Persist submission IMMEDIATELY with state Submitted
   * 4. Transition to Evaluating
   * 5. Fire evaluation async (non-blocking)
   * 6. Return 202 with submission ID
   */
  async submit(
    learnerId: string,
    attemptId: string,
    content: SubmissionContent,
    idempotencyKey: string
  ): Promise<Submission> {
    // Step 1: Idempotency check — prevent duplicate submissions
    const existing = await this.submissionRepo.findByIdempotencyKey(idempotencyKey, learnerId);
    if (existing) {
      return existing;
    }

    // Step 2: Verify attempt exists and belongs to this learner
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new AppError('Attempt not found', 404);
    }
    if (attempt.learnerId !== learnerId) {
      throw new AppError('Access denied', 403);
    }

    // Check if attempt already has a submission
    const existingSubmission = await this.submissionRepo.findByAttemptId(attemptId, learnerId);
    if (existingSubmission) {
      throw new AppError('This attempt already has a submission. Start a new attempt to submit again.', 409);
    }

    // Step 3: Persist submission IMMEDIATELY (nothing lost if evaluator crashes)
    const submission = await this.submissionRepo.create({
      attemptId,
      learnerId,
      content,
      state: SubmissionState.Submitted,
      idempotencyKey,
      submittedAt: new Date(),
    });

    // Step 4: Transition to Evaluating
    const stateMachine = new SubmissionStateMachine(SubmissionState.Submitted);
    stateMachine.transitionTo(SubmissionState.Evaluating);

    await this.submissionRepo.update(submission.id, {
      state: SubmissionState.Evaluating,
    });

    // Step 5: Fire evaluation async — does NOT block the response
    this.fireAsyncEvaluation(submission, attempt.problemId);

    // Step 6: Return submission with Evaluating state
    return {
      ...submission,
      state: SubmissionState.Evaluating,
    };
  }

  /**
   * Retry a failed submission's evaluation.
   * Only allowed for submissions with failureCause: 'system'.
   */
  async retryEvaluation(submissionId: string, learnerId: string): Promise<Submission> {
    const submission = await this.submissionRepo.findByIdAndLearnerId(submissionId, learnerId);
    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    if (submission.state !== SubmissionState.Failed) {
      throw new AppError('Only failed submissions can be retried', 400);
    }

    if (submission.failureCause === 'rule-based') {
      throw new AppError(
        'This submission failed validation checks. Please start a new attempt with an improved design.',
        400
      );
    }

    // Transition Failed → Evaluating (retry)
    const stateMachine = new SubmissionStateMachine(SubmissionState.Failed);
    stateMachine.transitionTo(SubmissionState.Evaluating);

    await this.submissionRepo.update(submissionId, {
      state: SubmissionState.Evaluating,
      failureReason: undefined,
      failureCause: undefined,
    });

    // Get the attempt to find the problem
    const attempt = await this.attemptRepo.findById(submission.attemptId);
    if (!attempt) {
      throw new AppError('Associated attempt not found', 404);
    }

    // Fire async evaluation
    const updatedSubmission = { ...submission, state: SubmissionState.Evaluating };
    this.fireAsyncEvaluation(updatedSubmission, attempt.problemId);

    return updatedSubmission;
  }

  /**
   * Get a submission by ID (with ownership check).
   */
  async getSubmission(submissionId: string, learnerId: string): Promise<Submission> {
    const submission = await this.submissionRepo.findByIdAndLearnerId(submissionId, learnerId);
    if (!submission) {
      throw new AppError('Submission not found', 404);
    }
    return submission;
  }

  /**
   * Get a submission by attempt ID (with ownership check).
   */
  async getSubmissionByAttempt(attemptId: string, learnerId: string): Promise<Submission | null> {
    return this.submissionRepo.findByAttemptId(attemptId, learnerId);
  }

  /**
   * Get all submissions for a learner.
   */
  async getSubmissionsByLearner(learnerId: string): Promise<Submission[]> {
    return this.submissionRepo.findByLearnerId(learnerId);
  }

  /**
   * Fires evaluation in the background. Does NOT block the main request.
   * Uses setImmediate to defer execution, then catches any errors and
   * marks submission as Failed.
   */
  private fireAsyncEvaluation(submission: Submission, problemId: string): void {
    setImmediate(async () => {
      try {
        const problem = await this.problemRepo.findById(problemId);
        if (!problem) {
          await this.submissionRepo.update(submission.id, {
            state: SubmissionState.Failed,
            failureReason: 'Associated problem not found.',
            failureCause: 'system',
          });
          return;
        }

        await this.evaluationService.evaluateSubmission(submission, problem.requirements);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Async evaluation failed for submission ${submission.id}:`, errorMessage);
        try {
          await this.submissionRepo.update(submission.id, {
            state: SubmissionState.Failed,
            failureReason: `Evaluation error: ${errorMessage}`,
            failureCause: 'system',
          });
        } catch (updateError) {
          console.error(`Failed to update submission ${submission.id} to Failed state:`, updateError);
        }
      }
    });
  }
}
