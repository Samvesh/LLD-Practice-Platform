// Domain entity: EvaluationResult
// Aggregates all dimension-level feedback into a complete evaluation.

import { Feedback } from './Feedback';

export interface EvaluationResult {
  feedbacks: Feedback[];
  overallScore: number;   // computed as average of all dimension scores
  evaluatedAt: Date;
  evaluatorType: string;  // 'llm' | 'rule-based' — tracks which evaluator produced this
}
