import { IAttemptRepository } from '../../domain/interfaces/Repository';
import { Attempt } from '../../domain/entities/Attempt';
import { AttemptModel, IAttemptDocument } from '../models/AttemptModel';

function toDomain(doc: IAttemptDocument): Attempt {
  return {
    id: doc._id.toString(),
    learnerId: doc.learnerId.toString(),
    problemId: doc.problemId.toString(),
    attemptNumber: doc.attemptNumber,
    startedAt: doc.startedAt,
  };
}

export class MongoAttemptRepository implements IAttemptRepository {
  async findById(id: string): Promise<Attempt | null> {
    const doc = await AttemptModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findByLearnerAndProblem(learnerId: string, problemId: string): Promise<Attempt[]> {
    const docs = await AttemptModel.find({ learnerId, problemId }).sort({ attemptNumber: 1 });
    return docs.map(toDomain);
  }

  async countByLearnerAndProblem(learnerId: string, problemId: string): Promise<number> {
    return AttemptModel.countDocuments({ learnerId, problemId });
  }

  async create(entity: Omit<Attempt, 'id'>): Promise<Attempt> {
    const doc = await AttemptModel.create(entity);
    return toDomain(doc);
  }

  async update(id: string, updates: Partial<Attempt>): Promise<Attempt | null> {
    const doc = await AttemptModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDomain(doc) : null;
  }
}
