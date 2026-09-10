// Simple application error with status code.
// Separated from AuthService to avoid circular dependency chains with env.ts.

export class AppError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
  }
}
