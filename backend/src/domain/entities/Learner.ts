// Domain entity: Learner
// Represents a registered learner in the system

export interface Learner {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}
