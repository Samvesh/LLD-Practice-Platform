// EvaluationService — orchestrates the gate+judge evaluation strategy.
// RuleBasedEvaluator = gate (fast, free, deterministic pass/fail)
// LLMEvaluator = judge (runs only if gate passes, produces all scores)
// No score merging — gate produces no scores, judge owns all feedback.

import { GateEvaluator, Evaluator } from '../domain/interfaces/Evaluator';
import { Submission, SubmissionState, FailureCause } from '../domain/entities/Submission';
import { EvaluationResult } from '../domain/entities/EvaluationResult';
import { Rubric } from '../domain/rubric/Rubric';
import { ISubmissionRepository } from '../domain/interfaces/Repository';
import { SubmissionStateMachine } from '../domain/state-machine/SubmissionStateMachine';

export interface EvaluationOutcome {
  success: boolean;
  result?: EvaluationResult;
  failureReason?: string;
  failureCause?: FailureCause;
}

export class EvaluationService {
  constructor(
    private gateEvaluator: GateEvaluator,
    private judgeEvaluator: Evaluator,
    private submissionRepo: ISubmissionRepository,
    private rubric: Rubric
  ) {}

  /**
   * Runs the full evaluation pipeline on a submission.
   * Called asynchronously after the submission is persisted.
   *
   * Flow:
   * 1. Run gate (RuleBasedEvaluator) — if fails, mark Failed with rule-based cause
   * 2. Run judge (LLMEvaluator) — if fails/errors, mark Failed with system cause
   * 3. If judge succeeds, validate output and mark Completed
   */
  async evaluateSubmission(
    submission: Submission,
    problemRequirements: string[]
  ): Promise<void> {
    const stateMachine = new SubmissionStateMachine(submission.state);

    try {
      // Step 1: Gate check (deterministic, synchronous)
      const gateResult = this.gateEvaluator.check(submission);

      if (!gateResult.passed) {
        // Gate failed — mark as Failed with rule-based cause
        stateMachine.transitionTo(SubmissionState.Failed);
        await this.submissionRepo.update(submission.id, {
          state: SubmissionState.Failed,
          failureReason: gateResult.reason ?? 'Submission did not pass validation checks.',
          failureCause: 'rule-based',
        });
        return;
      }

      // Step 2: Judge evaluation (LLM, async)
      const evaluationResult = await this.judgeEvaluator.evaluate(
        submission,
        this.rubric,
        problemRequirements
      );

      // Step 3: Success — mark Completed
      stateMachine.transitionTo(SubmissionState.Completed);
      await this.submissionRepo.update(submission.id, {
        state: SubmissionState.Completed,
        evaluationResult,
        evaluatedAt: new Date(),
      });
    } catch (error) {
      // Any error (LLM timeout, Zod validation failure, etc.) → Failed with system cause
      const errorMessage = error instanceof Error ? error.message : 'Unknown evaluation error';
      
      try {
        // Only transition if the state machine allows it
        const currentState = stateMachine.getState();
        if (currentState === SubmissionState.Evaluating) {
          stateMachine.transitionTo(SubmissionState.Failed);
        }
      } catch {
        // State transition itself failed — submission might be in an unexpected state
      }

      await this.submissionRepo.update(submission.id, {
        state: SubmissionState.Failed,
        failureReason: `Evaluation failed: ${errorMessage}`,
        failureCause: 'system',
      });
    }
  }
}
