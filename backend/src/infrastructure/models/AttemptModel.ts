import mongoose, { Schema, Document } from 'mongoose';

export interface IAttemptDocument extends Document {
  learnerId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  attemptNumber: number;
  startedAt: Date;
}

const AttemptSchema = new Schema<IAttemptDocument>(
  {
    learnerId: { type: Schema.Types.ObjectId, ref: 'Learner', required: true, index: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    attemptNumber: { type: Number, required: true },
    startedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index for efficient lookup of a learner's attempts for a problem
AttemptSchema.index({ learnerId: 1, problemId: 1 });

export const AttemptModel = mongoose.model<IAttemptDocument>('Attempt', AttemptSchema);
