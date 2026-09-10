// Domain entity: Submission
// Contains the learner's design solution for an attempt.
// Content is polymorphic (discriminated union) so new formats can be added
// without changing the domain model — only a new union variant is needed.

// --- Submission Content (polymorphic) ---

export interface TextSubmissionContent {
  format: 'text';
  body: string;
}

// Phase 2 placeholder — adding diagram support would only require:
// 1. Adding a new union variant here
// 2. Updating the RuleBasedEvaluator to validate the new format
// 3. Adding a renderer component in the frontend
// No changes to Submission, state machine, services, or evaluation pipeline.
//
// export interface DiagramSubmissionContent {
//   format: 'diagram';
//   diagramType: 'class' | 'sequence';
//   data: string; // serialized diagram data (e.g., Mermaid syntax or JSON)
// }

export type SubmissionContent = TextSubmissionContent; // | DiagramSubmissionContent

// --- Submission States ---

export enum SubmissionState {
  Submitted = 'Submitted',
  Evaluating = 'Evaluating',
  Completed = 'Completed',
  Failed = 'Failed',
}

// --- Failure Cause ---
// Distinguishes why a submission failed so the UI can offer the right action:
// - 'rule-based': content was invalid → learner should create a NEW attempt
// - 'system': LLM timeout/error or output validation failure → learner can RETRY same submission

export type FailureCause = 'rule-based' | 'system';

// --- Submission Entity ---

export interface Submission {
  id: string;
  attemptId: string;
  learnerId: string;
  content: SubmissionContent;
  state: SubmissionState;
  idempotencyKey: string;
  failureReason?: string;
  failureCause?: FailureCause;
  evaluationResult?: import('./EvaluationResult').EvaluationResult;
  submittedAt: Date;
  evaluatedAt?: Date;
}
