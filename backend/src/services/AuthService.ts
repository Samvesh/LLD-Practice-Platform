// AuthService — handles registration, login, and JWT operations.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ILearnerRepository } from '../domain/interfaces/Repository';
import { Learner } from '../domain/entities/Learner';
import { AppError } from './AppError';
import { env } from '../config/env';

const SALT_ROUNDS = 12;

export interface AuthTokenPayload {
  learnerId: string;
  email: string;
}

export class AuthService {
  constructor(private learnerRepo: ILearnerRepository) {}

  async register(email: string, name: string, password: string): Promise<{ learner: Omit<Learner, 'passwordHash'>; token: string }> {
    // Check if email already exists
    const existing = await this.learnerRepo.findByEmail(email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create learner
    const learner = await this.learnerRepo.create({
      email,
      name,
      passwordHash,
      createdAt: new Date(),
    });

    // Generate JWT — payload contains only learnerId and email, no sensitive data
    const token = this.generateToken(learner);

    return {
      learner: { id: learner.id, email: learner.email, name: learner.name, createdAt: learner.createdAt },
      token,
    };
  }

  async login(email: string, password: string): Promise<{ learner: Omit<Learner, 'passwordHash'>; token: string }> {
    const learner = await this.learnerRepo.findByEmail(email);
    if (!learner) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordMatch = await bcrypt.compare(password, learner.passwordHash);
    if (!passwordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(learner);

    return {
      learner: { id: learner.id, email: learner.email, name: learner.name, createdAt: learner.createdAt },
      token,
    };
  }

  private generateToken(learner: Learner): string {
    const payload: AuthTokenPayload = {
      learnerId: learner.id,
      email: learner.email,
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as any);
  }
}
