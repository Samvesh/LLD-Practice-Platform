// RuleBasedEvaluator — Deterministic gate evaluator
// Acts as a GATE, not a scorer: checks that the submission meets
// minimum structural requirements before expensive LLM evaluation.
// If it fails, submission goes to Failed with failureCause: 'rule-based'.

import { GateEvaluator, GateResult } from '../interfaces/Evaluator';
import { Submission } from '../entities/Submission';

const MIN_SUBMISSION_LENGTH = 100; // characters
const REQUIRED_KEYWORDS = ['class', 'method', 'interface', 'design', 'responsibility'];
const MIN_KEYWORD_MATCHES = 2; // must mention at least 2 of the design keywords

export class RuleBasedEvaluator implements GateEvaluator {
  readonly type = 'rule-based';

  check(submission: Submission): GateResult {
    const content = submission.content;

    // Only text format is currently supported
    if (content.format !== 'text') {
      return { passed: false, reason: `Unsupported submission format: ${content.format}` };
    }

    const text = content.body.trim();

    // Check 1: Non-empty
    if (!text) {
      return { passed: false, reason: 'Submission is empty. Please provide your design solution.' };
    }

    // Check 2: Minimum length
    if (text.length < MIN_SUBMISSION_LENGTH) {
      return {
        passed: false,
        reason: `Submission is too short (${text.length} characters). A meaningful LLD design should be at least ${MIN_SUBMISSION_LENGTH} characters. Please elaborate on your class design, responsibilities, and relationships.`,
      };
    }

    // Check 3: Contains some design-related terminology
    const lowerText = text.toLowerCase();
    const matchedKeywords = REQUIRED_KEYWORDS.filter(kw => lowerText.includes(kw));
    if (matchedKeywords.length < MIN_KEYWORD_MATCHES) {
      return {
        passed: false,
        reason: `Submission does not appear to contain a design solution. Expected discussion of classes, methods, interfaces, or design responsibilities. Please describe your object-oriented design.`,
      };
    }

    return { passed: true };
  }
}
