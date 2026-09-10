// Submission State Machine
// Enforces valid state transitions — not just a string mutated ad hoc.
// Only allowed transitions:
//   Submitted  → Evaluating
//   Evaluating → Completed
//   Evaluating → Failed
//   Failed     → Evaluating  (retry)

import { SubmissionState } from '../entities/Submission';

// Define all valid transitions as a map from source state to allowed target states.
const VALID_TRANSITIONS: Record<SubmissionState, SubmissionState[]> = {
  [SubmissionState.Submitted]: [SubmissionState.Evaluating],
  [SubmissionState.Evaluating]: [SubmissionState.Completed, SubmissionState.Failed],
  [SubmissionState.Completed]: [], // terminal state
  [SubmissionState.Failed]: [SubmissionState.Evaluating], // retry
};

export class SubmissionStateMachine {
  private state: SubmissionState;

  constructor(initialState: SubmissionState = SubmissionState.Submitted) {
    this.state = initialState;
  }

  /**
   * Returns the current state.
   */
  getState(): SubmissionState {
    return this.state;
  }

  /**
   * Checks whether a transition from the current state to the target state is valid.
   */
  canTransitionTo(targetState: SubmissionState): boolean {
    return VALID_TRANSITIONS[this.state].includes(targetState);
  }

  /**
   * Transitions to the target state if the transition is valid.
   * Throws an error with a clear message if the transition is not allowed.
   */
  transitionTo(targetState: SubmissionState): void {
    if (!this.canTransitionTo(targetState)) {
      throw new InvalidStateTransitionError(this.state, targetState);
    }
    this.state = targetState;
  }

  /**
   * Returns all states reachable from the current state.
   */
  getValidTransitions(): SubmissionState[] {
    return [...VALID_TRANSITIONS[this.state]];
  }
}

/**
 * Custom error for invalid state transitions.
 * Provides a clear message about what was attempted and what's allowed.
 */
export class InvalidStateTransitionError extends Error {
  public readonly fromState: SubmissionState;
  public readonly toState: SubmissionState;

  constructor(fromState: SubmissionState, toState: SubmissionState) {
    const allowed = VALID_TRANSITIONS[fromState];
    const allowedStr = allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)';
    super(
      `Invalid state transition: ${fromState} → ${toState}. ` +
      `Allowed transitions from ${fromState}: ${allowedStr}.`
    );
    this.name = 'InvalidStateTransitionError';
    this.fromState = fromState;
    this.toState = toState;
  }
}
