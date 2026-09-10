// Jest test setup — runs BEFORE any test module is imported.
// Sets all required environment variables as dummy values so that
// importing any service (even AuthService → env.ts) doesn't throw.
// This is the root fix for the env coupling issue — tests should
// never depend on real .env files or environment variables.

process.env.PORT = '3001';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/lld-practice-test';
process.env.JWT_SECRET = 'test-jwt-secret-key-not-for-production';
process.env.JWT_EXPIRES_IN = '1h';
process.env.GEMINI_API_KEY = 'test-gemini-api-key-not-real';
process.env.FRONTEND_URL = 'http://localhost:5173';
