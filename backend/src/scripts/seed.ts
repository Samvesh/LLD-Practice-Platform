// Seed script — seeds 5 LLD problems into the database.
// Run with: npm run seed

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { ProblemModel } from '../infrastructure/models/ProblemModel';

const PROBLEMS = [
  {
    title: 'Parking Lot System',
    slug: 'parking-lot',
    description:
      'Design a parking lot system that can manage vehicles of different sizes across multiple floors. The system should handle entry/exit, spot assignment, and billing.',
    requirements: [
      'Support multiple vehicle types (motorcycle, car, truck) with different spot sizes.',
      'Multiple floors with configurable capacity per floor and per spot type.',
      'Assign the nearest available spot to an incoming vehicle.',
      'Track entry and exit times for billing purposes.',
      'Calculate parking fees based on duration and vehicle type.',
      'Display real-time availability per floor and spot type.',
    ],
    difficulty: 'medium' as const,
    hints: [
      'Consider using a Strategy pattern for different pricing models.',
      'Think about how you would handle concurrent entry/exit at multiple gates.',
      'What happens when the parking lot is full?',
    ],
  },
  {
    title: 'Elevator System',
    slug: 'elevator-system',
    description:
      'Design an elevator system for a multi-floor building with multiple elevators. The system should efficiently dispatch elevators to requested floors.',
    requirements: [
      'Support multiple elevators in a single building.',
      'Handle up and down requests from any floor.',
      'Implement an efficient dispatching algorithm (e.g., shortest seek time, SCAN).',
      'Support capacity limits per elevator.',
      'Handle door open/close timing and emergency stop.',
      'Track elevator state (moving, idle, maintenance).',
    ],
    difficulty: 'hard' as const,
    hints: [
      'Consider the State pattern for elevator states.',
      'How does your dispatching strategy change with more elevators?',
      'Think about fairness — how do you prevent starvation of requests?',
    ],
  },
  {
    title: 'Vending Machine',
    slug: 'vending-machine',
    description:
      'Design a vending machine that dispenses products, accepts payments, and manages inventory. The system should handle various payment methods and product types.',
    requirements: [
      'Support multiple product types with different prices and quantities.',
      'Accept multiple payment methods (coins, bills, card).',
      'Dispense correct product and calculate change.',
      'Track and update inventory in real time.',
      'Handle out-of-stock scenarios gracefully.',
      'Support admin operations: restock, collect cash, view sales report.',
    ],
    difficulty: 'easy' as const,
    hints: [
      'The State pattern is a natural fit for vending machine states (idle, accepting payment, dispensing).',
      'How do you handle partial payments?',
      'Consider using the Observer pattern for inventory alerts.',
    ],
  },
  {
    title: 'Rate Limiter',
    slug: 'rate-limiter',
    description:
      'Design a rate limiter that can throttle API requests based on configurable rules. The system should support different rate limiting algorithms and be extensible.',
    requirements: [
      'Support multiple rate limiting algorithms (token bucket, sliding window, fixed window).',
      'Configure rules per API endpoint, per user, or globally.',
      'Return appropriate HTTP responses (429) when rate limit is exceeded.',
      'Support configurable time windows and request thresholds.',
      'Handle distributed scenarios (multiple server instances sharing state).',
      'Provide monitoring/metrics for rate limit hits and remaining quota.',
    ],
    difficulty: 'hard' as const,
    hints: [
      'The Strategy pattern works well for swappable algorithms.',
      'Consider the trade-offs between memory usage and accuracy for each algorithm.',
      'How would you handle rate limiting across multiple servers without a single point of failure?',
    ],
  },
  {
    title: 'Library Management System',
    slug: 'library-management',
    description:
      'Design a library management system that handles book cataloging, member management, borrowing/returning, and reservation of books.',
    requirements: [
      'Maintain a catalog of books with details (title, author, ISBN, copies available).',
      'Support member registration with different membership tiers.',
      'Handle book checkout and return with due date tracking.',
      'Implement a reservation/hold system for books currently checked out.',
      'Apply late fees for overdue returns.',
      'Search books by title, author, ISBN, or category.',
    ],
    difficulty: 'medium' as const,
    hints: [
      'Think about the Observer pattern for notifying members when reserved books become available.',
      'How do you handle multiple copies of the same book?',
      'Consider how membership tiers affect borrowing limits and fee structures.',
    ],
  },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI environment variable is required.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for seeding.');

  // Clear existing problems
  await ProblemModel.deleteMany({});
  console.log('Cleared existing problems.');

  // Insert seed data
  const created = await ProblemModel.insertMany(PROBLEMS);
  console.log(`✅ Seeded ${created.length} LLD problems:`);
  created.forEach((p) => console.log(`   - ${p.title} (${p.slug})`));

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
