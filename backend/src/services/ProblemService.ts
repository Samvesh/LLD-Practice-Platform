// ProblemService — retrieves problems from the repository.

import { IProblemRepository } from '../domain/interfaces/Repository';
import { Problem } from '../domain/entities/Problem';

export class ProblemService {
  constructor(private problemRepo: IProblemRepository) {}

  async getAllProblems(): Promise<Problem[]> {
    return this.problemRepo.findAll();
  }

  async getProblemById(id: string): Promise<Problem> {
    const problem = await this.problemRepo.findById(id);
    if (!problem) {
      throw new Error('Problem not found');
    }
    return problem;
}
