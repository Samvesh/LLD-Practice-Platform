import { ISubmissionRepository } from '../../domain/interfaces/Repository';
import { Submission } from '../../domain/entities/Submission';
import { SubmissionModel, ISubmissionDocument } from '../models/SubmissionModel';

function toDomain(doc: ISubmissionDocument): Submission {
  return {
    id: doc._id.toString(),
    attemptId: doc.attemptId.toString(),
    learnerId: doc.learnerId.toString(),
    content: doc.content as Submission['content'],
    state: doc.state as Submission['state'],
    idempotencyKey: doc.idempotencyKey,
    failureReason: doc.failureReason,
    failureCause: doc.failureCause as Submission['failureCause'],
    evaluationResult: doc.evaluationResult ? {
      feedbacks: doc.evaluationResult.feedbacks,
      overallScore: doc.evaluationResult.overallScore,
      evaluatedAt: doc.evaluationResult.evaluatedAt,
      evaluatorType: doc.evaluationResult.evaluatorType,
    } : undefined,
    submittedAt: doc.submittedAt,
    evaluatedAt: doc.evaluatedAt,
  };
}

export class MongoSubmissionRepository implements ISubmissionRepository {
  async findById(id: string): Promise<Submission | null> {
    const doc = await SubmissionModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findByIdAndLearnerId(id: string, learnerId: string): Promise<Submission | null> {
    // IDOR defense: always filter by learnerId
    const doc = await SubmissionModel.findOne({ _id: id, learnerId });
    return doc ? toDomain(doc) : null;
  }

  async findByAttemptId(attemptId: string, learnerId: string): Promise<Submission | null> {
    // IDOR defense: always filter by learnerId
    const doc = await SubmissionModel.findOne({ attemptId, learnerId });
    return doc ? toDomain(doc) : null;
  }

  async findByIdempotencyKey(idempotencyKey: string, learnerId: string): Promise<Submission | null> {
    // IDOR defense: always filter by learnerId
    const doc = await SubmissionModel.findOne({ idempotencyKey, learnerId });
    return doc ? toDomain(doc) : null;
  }

  async findByLearnerId(learnerId: string): Promise<Submission[]> {
    const docs = await SubmissionModel.find({ learnerId }).sort({ submittedAt: -1 });
    return docs.map(toDomain);
  }

  async create(entity: Omit<Submission, 'id'>): Promise<Submission> {
    const doc = await SubmissionModel.create(entity);
    return toDomain(doc);
  }

  async update(id: string, updates: Partial<Submission>): Promise<Submission | null> {
    const doc = await SubmissionModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDomain(doc) : null;
  }
}
