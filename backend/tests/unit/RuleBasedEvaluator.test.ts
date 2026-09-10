// Tests for RuleBasedEvaluator (Gate)
// Covers: empty submission, too-short submission, missing design keywords, valid submission.

import { RuleBasedEvaluator } from '../../src/domain/evaluators/RuleBasedEvaluator';
import { Submission, SubmissionState } from '../../src/domain/entities/Submission';

function makeSubmission(body: string): Submission {
  return {
    id: 'sub-1',
    attemptId: 'att-1',
    learnerId: 'learner-1',
    content: { format: 'text' as const, body },
    state: SubmissionState.Evaluating,
    idempotencyKey: 'key-1',
    submittedAt: new Date(),
  };
}

describe('RuleBasedEvaluator', () => {
  const evaluator = new RuleBasedEvaluator();

  it('should have type "rule-based"', () => {
    expect(evaluator.type).toBe('rule-based');
  });

  describe('empty submission', () => {
    it('should fail on empty string', () => {
      const result = evaluator.check(makeSubmission(''));
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('empty');
    });

    it('should fail on whitespace-only', () => {
      const result = evaluator.check(makeSubmission('   \n\t  '));
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('empty');
    });
  });

  describe('too-short submission', () => {
    it('should fail on submission under 100 characters', () => {
      const result = evaluator.check(makeSubmission('The class design uses a method.'));
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('too short');
    });
  });

  describe('missing design keywords', () => {
    it('should fail when submission lacks design terminology', () => {
      const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5);
      const result = evaluator.check(makeSubmission(longText));
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('design solution');
    });
  });

  describe('valid submission', () => {
    it('should pass a well-formed design submission', () => {
      const validDesign = `
        The Parking Lot system uses several classes with clear responsibilities.
        The ParkingLot class manages floors and spots. Each ParkingSpot has an interface
        for checking availability. The Vehicle class hierarchy uses inheritance for
        different vehicle types. The design pattern used is Strategy for pricing.
        The method calculateFee handles billing based on duration.
      `;
      const result = evaluator.check(makeSubmission(validDesign));
      expect(result.passed).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should pass when exactly meeting minimum keyword count', () => {
      const text = 'This design includes a class with proper interface definitions. '.repeat(3);
      const result = evaluator.check(makeSubmission(text));
      expect(result.passed).toBe(true);
    });
  });
});
