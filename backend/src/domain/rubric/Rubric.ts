// Rubric domain object
// Stored/config object — NOT hardcoded inside the LLM prompt string.
// The prompt template references this rubric at runtime.

export interface RubricDimension {
  criterion: string;
  description: string;
  maxScore: number;
  weight: number; // relative weight for overall score computation
}

export interface Rubric {
  name: string;
  version: string;
  dimensions: RubricDimension[];
}

/**
 * Default LLD evaluation rubric.
 * Extracted as config so it can be versioned, swapped, or extended
 * without modifying the evaluator or prompt logic.
 */
export const DEFAULT_LLD_RUBRIC: Rubric = {
  name: 'LLD Design Evaluation Rubric',
  version: '1.0',
  dimensions: [
    {
      criterion: 'Requirement Understanding',
      description: 'Does the design correctly identify and address all stated requirements? Are functional and non-functional requirements distinguished?',
      maxScore: 10,
      weight: 1,
    },
    {
      criterion: 'Class Responsibilities',
      description: 'Are classes well-defined with clear, single responsibilities? Does each class have a coherent purpose?',
      maxScore: 10,
      weight: 1,
    },
    {
      criterion: 'Coupling and Cohesion',
      description: 'Is coupling between classes minimized? Is cohesion within classes maximized? Are dependencies well-managed?',
      maxScore: 10,
      weight: 1,
    },
    {
      criterion: 'Encapsulation and Interfaces',
      description: 'Are implementation details properly hidden? Are public interfaces clean and minimal? Is data access controlled?',
      maxScore: 10,
      weight: 1,
    },
    {
      criterion: 'Abstraction and Pattern Use',
      description: 'Are appropriate design patterns used (not forced)? Is the level of abstraction suitable for the problem?',
      maxScore: 10,
      weight: 1,
    },
    {
      criterion: 'Extensibility',
      description: 'Can the design be extended for new features without major refactoring? Are extension points identified?',
      maxScore: 10,
      weight: 1,
    },
    {
      criterion: 'Edge Cases',
      description: 'Are edge cases, error scenarios, and boundary conditions considered in the design?',
      maxScore: 10,
      weight: 1,
    },
    {
      criterion: 'Quality of Explanation',
      description: 'Is the design rationale clearly communicated? Are trade-offs acknowledged? Is the explanation well-structured?',
      maxScore: 10,
      weight: 1,
    },
  ],
};
