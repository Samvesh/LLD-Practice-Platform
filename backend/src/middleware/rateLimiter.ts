// Rate limiting middleware
// Protects submission/evaluation endpoints from abuse (LLM calls cost money).

import rateLimit from 'express-rate-limit';

// General API rate limit: 100 requests per minute per IP
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Submission rate limit: 5 submissions per minute per IP
// Stricter because each submission can trigger an LLM call
export const submissionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please wait before submitting again.' },
});

// Auth rate limit: 10 login/register attempts per minute per IP
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});
