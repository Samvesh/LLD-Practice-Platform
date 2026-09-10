// Tests for SubmissionStateMachine
// Covers: valid transitions, invalid transitions, retry from Failed, terminal states.

import { SubmissionStateMachine, InvalidStateTransitionError } from '../../src/domain/state-machine/SubmissionStateMachine';
import { SubmissionState } from '../../src/domain/entities/Submission';

describe('SubmissionStateMachine', () => {
  describe('initial state', () => {
    it('should default to Submitted state', () => {
      const sm = new SubmissionStateMachine();
      expect(sm.getState()).toBe(SubmissionState.Submitted);
    });

    it('should accept a custom initial state', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Failed);
      expect(sm.getState()).toBe(SubmissionState.Failed);
    });
  });

  describe('valid transitions', () => {
    it('should allow Submitted → Evaluating', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Submitted);
      sm.transitionTo(SubmissionState.Evaluating);
      expect(sm.getState()).toBe(SubmissionState.Evaluating);
    });

    it('should allow Evaluating → Completed', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Evaluating);
      sm.transitionTo(SubmissionState.Completed);
      expect(sm.getState()).toBe(SubmissionState.Completed);
    });

    it('should allow Evaluating → Failed', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Evaluating);
      sm.transitionTo(SubmissionState.Failed);
      expect(sm.getState()).toBe(SubmissionState.Failed);
    });

    it('should allow Failed → Evaluating (retry)', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Failed);
      sm.transitionTo(SubmissionState.Evaluating);
      expect(sm.getState()).toBe(SubmissionState.Evaluating);
    });
  });

  describe('invalid transitions', () => {
    it('should throw on Submitted → Completed (must go through Evaluating)', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Submitted);
      expect(() => sm.transitionTo(SubmissionState.Completed))
        .toThrow(InvalidStateTransitionError);
    });

    it('should throw on Submitted → Failed (must go through Evaluating)', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Submitted);
      expect(() => sm.transitionTo(SubmissionState.Failed))
        .toThrow(InvalidStateTransitionError);
    });

    it('should throw on Completed → anything (terminal state)', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Completed);
      expect(() => sm.transitionTo(SubmissionState.Evaluating))
        .toThrow(InvalidStateTransitionError);
      expect(() => sm.transitionTo(SubmissionState.Failed))
        .toThrow(InvalidStateTransitionError);
      expect(() => sm.transitionTo(SubmissionState.Submitted))
        .toThrow(InvalidStateTransitionError);
    });

    it('should throw on Failed → Completed (must go through Evaluating first)', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Failed);
      expect(() => sm.transitionTo(SubmissionState.Completed))
        .toThrow(InvalidStateTransitionError);
    });

    it('should throw on Evaluating → Submitted (no backwards transition)', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Evaluating);
      expect(() => sm.transitionTo(SubmissionState.Submitted))
        .toThrow(InvalidStateTransitionError);
    });
  });

  describe('canTransitionTo', () => {
    it('should return true for valid transitions', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Submitted);
      expect(sm.canTransitionTo(SubmissionState.Evaluating)).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Completed);
      expect(sm.canTransitionTo(SubmissionState.Evaluating)).toBe(false);
    });
  });

  describe('getValidTransitions', () => {
    it('should return all valid targets from Evaluating', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Evaluating);
      const valid = sm.getValidTransitions();
      expect(valid).toContain(SubmissionState.Completed);
      expect(valid).toContain(SubmissionState.Failed);
      expect(valid).toHaveLength(2);
    });

    it('should return empty array for terminal state Completed', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Completed);
      expect(sm.getValidTransitions()).toHaveLength(0);
    });
  });

  describe('error message quality', () => {
    it('should include from/to states and allowed transitions in error', () => {
      const sm = new SubmissionStateMachine(SubmissionState.Submitted);
      try {
        sm.transitionTo(SubmissionState.Completed);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidStateTransitionError);
        const err = e as InvalidStateTransitionError;
        expect(err.fromState).toBe(SubmissionState.Submitted);
        expect(err.toState).toBe(SubmissionState.Completed);
        expect(err.message).toContain('Submitted');
        expect(err.message).toContain('Completed');
        expect(err.message).toContain('Evaluating'); // the allowed transition
      }
    });
  });
});
