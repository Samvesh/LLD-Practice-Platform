import { IProblemRepository } from '../../domain/interfaces/Repository';
import { Problem } from '../../domain/entities/Problem';
import { ProblemModel, IProblemDocument } from '../models/ProblemModel';

function toDomain(doc: IProblemDocument): Problem {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    requirements: doc.requirements,
    difficulty: doc.difficulty,
    hints: doc.hints,
    createdAt: doc.createdAt,
  };
}

export class MongoProblemRepository implements IProblemRepository {
  async findById(id: string): Promise<Problem | null> {
    const doc = await ProblemModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findAll(): Promise<Problem[]> {
    const docs = await ProblemModel.find().sort({ createdAt: 1 });
    return docs.map(toDomain);
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const doc = await ProblemModel.findOne({ slug });
    return doc ? toDomain(doc) : null;
  }

  async create(entity: Omit<Problem, 'id'>): Promise<Problem> {
    const doc = await ProblemModel.create(entity);
    return toDomain(doc);
  }

  async update(id: string, updates: Partial<Problem>): Promise<Problem | null> {
    const doc = await ProblemModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDomain(doc) : null;
  }
}
