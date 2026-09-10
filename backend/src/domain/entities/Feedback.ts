// Domain entity: Feedback
// A single dimension of structured evaluation feedback.
// Each rubric criterion produces one Feedback object.

export interface Feedback {
  criterion: string;
  score: number;       // 0–10, validated by Zod schema post-LLM
  maxScore: number;    // always 10 for current rubric
  evidence: string;    // what the evaluator observed in the submission
  concern: string;     // specific weaknesses identified
  suggestion: string;  // actionable improvement advice
  confidence: number;  // 0.0–1.0, how confident the evaluator is in this score
}
