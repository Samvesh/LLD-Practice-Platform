import { ILearnerRepository } from '../../domain/interfaces/Repository';
import { Learner } from '../../domain/entities/Learner';
import { LearnerModel, ILearnerDocument } from '../models/LearnerModel';

function toDomain(doc: ILearnerDocument): Learner {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    passwordHash: doc.passwordHash,
    createdAt: doc.createdAt,
  };
}

export class MongoLearnerRepository implements ILearnerRepository {
  async findById(id: string): Promise<Learner | null> {
    const doc = await LearnerModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<Learner | null> {
    const doc = await LearnerModel.findOne({ email: email.toLowerCase() });
    return doc ? toDomain(doc) : null;
  }

  async create(entity: Omit<Learner, 'id'>): Promise<Learner> {
    const doc = await LearnerModel.create({
      ...entity,
      email: entity.email.toLowerCase(),
    });
    return toDomain(doc);
  }

  async update(id: string, updates: Partial<Learner>): Promise<Learner | null> {
    const doc = await LearnerModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDomain(doc) : null;
  }
}
