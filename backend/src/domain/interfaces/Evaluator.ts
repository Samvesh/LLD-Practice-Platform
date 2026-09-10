// Evaluator Strategy Interface
// Defines the contract for all evaluation strategies.
// Implementing the Strategy pattern so new evaluators (HumanReviewEvaluator, etc.)
// can be added WITHOUT touching the submission/practice flow.

import { Submission } from '../entities/Submission';
import { EvaluationResult } from '../entities/EvaluationResult';
import { Rubric } from '../rubric/Rubric';

export interface Evaluator {
  /**
   * Unique identifier for this evaluator type.
   */
  readonly type: string;

  /**
   * Evaluates a submission against a rubric and returns structured feedback.
   * Throws on unrecoverable errors (caller should catch and mark submission Failed).
   */
  evaluate(submission: Submission, rubric: Rubric, problemRequirements: string[]): Promise<EvaluationResult>;
}

// Gate evaluator result — used by RuleBasedEvaluator to signal pass/fail
// without producing dimension scores.
export interface GateResult {
  passed: boolean;
  reason?: string; // Human-readable failure reason if !passed
}

export interface GateEvaluator {
  readonly type: string;
  check(submission: Submission): GateResult;
}
