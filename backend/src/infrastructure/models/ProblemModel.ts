import mongoose, { Schema, Document } from 'mongoose';

export interface IProblemDocument extends Document {
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
  createdAt: Date;
}

const ProblemSchema = new Schema<IProblemDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    requirements: { type: [String], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    hints: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const ProblemModel = mongoose.model<IProblemDocument>('Problem', ProblemSchema);
