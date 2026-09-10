# LLD Practice Platform

A full-stack prototype for practicing Low-Level Design with structured AI feedback.

**Choose problem → Write design → Submit → Get structured feedback → Track improvement → Retry**

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB (Atlas) with Mongoose
- **Frontend**: React + TypeScript + Vite
- **AI Evaluation**: LangChain + Google Gemini (structured output)
- **Auth**: JWT + bcrypt

## Prerequisites

- Node.js ≥ 18
- A MongoDB Atlas connection string (or local MongoDB)
- A Google Gemini API key

## Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/lld-practice
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Problems

```bash
cd backend
npx ts-node src/scripts/seed.ts
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open http://localhost:5173 → Register → Start practicing.

### 5. Run Tests

```bash
cd backend
npm test
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `PORT` | No | Backend port (default: 3001) |
| `JWT_EXPIRES_IN` | No | JWT expiry (default: 24h) |
| `FRONTEND_URL` | No | CORS origin (default: http://localhost:5173) |

## Key Design Decisions

1. **Strategy pattern** for evaluation — `Evaluator` interface with `LLMEvaluator` and `RuleBasedEvaluator` implementations. New evaluators (human review, etc.) can be added without touching the submission flow.

2. **Explicit state machine** for submissions — `Submitted → Evaluating → Completed|Failed`. No ad-hoc status string mutation. Invalid transitions throw with clear error messages.

3. **Persist-first** — submissions are saved to DB immediately before evaluation starts. Even if the evaluator crashes, the learner's work is preserved.

4. **Two-layer prompt injection defense** — (1) untrusted data delimiters in the prompt, (2) Zod schema validation of LLM output. The model is asked to behave correctly AND its output is enforced to be correct.

5. **Gate + Judge evaluation** — RuleBasedEvaluator (free, fast, deterministic) gates garbage submissions. LLMEvaluator only runs on valid input.

6. **Repository pattern** — business logic depends on interfaces, not Mongoose directly. All 32 tests run without a database connection.

7. **Text-only submission** — justified as sufficient for demonstrating design thinking. Polymorphic `SubmissionContent` (discriminated union) supports future formats with minimal changes.

## Security Measures

- **IDOR**: Every query filters by `learnerId` from JWT — no cross-user data access.
- **XSS**: Backend sanitization (xss library) + Frontend sanitization (DOMPurify).
- **Rate limiting**: 5 submissions/min, 100 requests/min general, 10 auth attempts/min.
- **Idempotency**: Client-generated UUID prevents duplicate submissions on double-click.
- **CORS**: Restricted to configured frontend origin.
- **Secrets**: All API keys via env vars, never committed or returned in responses.

## Known Limitations

- **No production job queue**: Async evaluation uses `setImmediate` — lost if server crashes mid-evaluation (retryable).
- **No email verification**: Registration accepts any email format.
- **No pagination**: History page loads all attempts at once.
- **Single LLM provider**: Only Gemini supported (extensible via LangChain).
- **localStorage JWT**: XSS risk mitigated by sanitization; httpOnly cookies would be preferred in production.

## Project Structure

```
backend/
├── src/
│   ├── domain/          # Pure domain model (no DB deps)
│   │   ├── entities/    # Problem, Learner, Attempt, Submission, Feedback, EvaluationResult
│   │   ├── interfaces/  # Evaluator, GateEvaluator, Repository interfaces
│   │   ├── evaluators/  # LLMEvaluator, RuleBasedEvaluator
│   │   ├── rubric/      # Rubric config object
│   │   └── state-machine/
│   ├── infrastructure/  # Mongoose models + Repository implementations
│   ├── services/        # AuthService, ProblemService, AttemptService, SubmissionService, EvaluationService
│   ├── middleware/       # Auth, rate limiting, XSS sanitization, error handler
│   ├── routes/          # Express route handlers
│   └── scripts/         # Seed script
├── tests/
│   └── unit/            # 32 tests: state machine, evaluators, services

frontend/
├── src/
│   ├── api/             # Axios client with JWT interceptors
│   ├── contexts/        # AuthContext
│   ├── pages/           # Login, Register, Problems, ProblemDetail, Attempt, Feedback
│   ├── components/      # Navbar, ProtectedRoute
│   ├── hooks/           # usePolling
│   └── utils/           # DOMPurify sanitization
```
