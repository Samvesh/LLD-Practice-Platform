// Domain entity: Problem
// Represents an LLD practice problem with requirements

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
  createdAt: Date;
}
