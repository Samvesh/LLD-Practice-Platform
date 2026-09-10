// Domain entity: Attempt
// Represents a learner's attempt at solving an LLD problem.
// A learner can have multiple attempts per problem to track improvement.

export interface Attempt {
  id: string;
  learnerId: string;
  problemId: string;
  attemptNumber: number;
  startedAt: Date;
}
