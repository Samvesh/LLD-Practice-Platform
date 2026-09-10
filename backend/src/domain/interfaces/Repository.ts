// Repository interfaces
// Lightweight abstraction between domain logic and Mongoose models.
// Business logic depends on these interfaces, not on Mongoose directly,
// making it testable without hitting the DB.

import { Problem } from '../entities/Problem';
import { Learner } from '../entities/Learner';
import { Attempt } from '../entities/Attempt';
import { Submission } from '../entities/Submission';

// --- Generic Repository ---

export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
}

// --- Specific Repositories ---

export interface IProblemRepository extends Repository<Problem> {
  findAll(): Promise<Problem[]>;
  findBySlug(slug: string): Promise<Problem | null>;
}

export interface ILearnerRepository extends Repository<Learner> {
  findByEmail(email: string): Promise<Learner | null>;
}

export interface IAttemptRepository extends Repository<Attempt> {
  findByLearnerAndProblem(learnerId: string, problemId: string): Promise<Attempt[]>;
  countByLearnerAndProblem(learnerId: string, problemId: string): Promise<number>;
}

export interface ISubmissionRepository extends Repository<Submission> {
  findByAttemptId(attemptId: string, learnerId: string): Promise<Submission | null>;
  findByIdempotencyKey(idempotencyKey: string, learnerId: string): Promise<Submission | null>;
  findByLearnerId(learnerId: string): Promise<Submission[]>;
  findByIdAndLearnerId(id: string, learnerId: string): Promise<Submission | null>;
}
