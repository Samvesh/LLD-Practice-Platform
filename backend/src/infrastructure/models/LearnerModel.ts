import mongoose, { Schema, Document } from 'mongoose';

export interface ILearnerDocument extends Document {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

const LearnerSchema = new Schema<ILearnerDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const LearnerModel = mongoose.model<ILearnerDocument>('Learner', LearnerSchema);
