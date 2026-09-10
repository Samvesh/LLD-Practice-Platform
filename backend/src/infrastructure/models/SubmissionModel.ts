import mongoose, { Schema, Document } from 'mongoose';

// Feedback subdocument schema
const FeedbackSchema = new Schema(
  {
    criterion: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true, default: 10 },
    evidence: { type: String, required: true },
    concern: { type: String, required: true },
    suggestion: { type: String, required: true },
    confidence: { type: Number, required: true },
  },
  { _id: false }
);

// Evaluation result subdocument schema
const EvaluationResultSchema = new Schema(
  {
    feedbacks: { type: [FeedbackSchema], required: true },
    overallScore: { type: Number, required: true },
    evaluatedAt: { type: Date, required: true },
    evaluatorType: { type: String, required: true },
  },
  { _id: false }
);

export interface ISubmissionDocument extends Document {
  attemptId: mongoose.Types.ObjectId;
  learnerId: mongoose.Types.ObjectId;
  content: {
    format: string;
    body?: string;
    data?: unknown; // future format support
  };
  state: string;
  idempotencyKey: string;
  failureReason?: string;
  failureCause?: string;
  evaluationResult?: {
    feedbacks: Array<{
      criterion: string;
      score: number;
      maxScore: number;
      evidence: string;
      concern: string;
      suggestion: string;
      confidence: number;
    }>;
    overallScore: number;
    evaluatedAt: Date;
    evaluatorType: string;
  };
  submittedAt: Date;
  evaluatedAt?: Date;
}

const SubmissionSchema = new Schema<ISubmissionDocument>(
  {
    attemptId: { type: Schema.Types.ObjectId, ref: 'Attempt', required: true, index: true },
    learnerId: { type: Schema.Types.ObjectId, ref: 'Learner', required: true, index: true },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    state: {
      type: String,
      enum: ['Submitted', 'Evaluating', 'Completed', 'Failed'],
      required: true,
      default: 'Submitted',
    },
    idempotencyKey: {
      type: String,
      required: true,
      index: true,
    },
    failureReason: { type: String },
    failureCause: { type: String, enum: ['rule-based', 'system'] },
    evaluationResult: { type: EvaluationResultSchema },
    submittedAt: { type: Date, default: Date.now },
    evaluatedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound unique index: one submission per idempotency key per learner
SubmissionSchema.index({ idempotencyKey: 1, learnerId: 1 }, { unique: true });

export const SubmissionModel = mongoose.model<ISubmissionDocument>('Submission', SubmissionSchema);
