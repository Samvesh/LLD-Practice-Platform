# LLD Practice Platform

A full-stack web app for practicing Low-Level Design problems with automated, structured feedback. Instead of just reading solutions passively, you pick a problem (like a Parking Lot or Rate Limiter), write out your class decomposition and design rationale in plain text, submit it, and get evaluated against a multi-criteria rubric with scores, identified concerns, and suggestions for improvement.

## Tech Stack

The backend is built with Node.js, Express, and TypeScript, backed by MongoDB (Atlas) via Mongoose. The frontend is a React SPA set up with Vite, Tailwind CSS, and React Router. For evaluating submissions, the backend uses LangChain with Google Gemini (via `@langchain/google-genai`), asking the model for structured JSON output that gets validated before saving.

## Getting It Running Locally

You will need Node.js (v18 or higher), a running MongoDB instance (or a free MongoDB Atlas cluster URI), and a Google Gemini API key.

### 1. Clone and install dependencies

Clone the repository and install packages for both parts of the app:

```bash
git clone https://github.com/Samvesh/LLD-Practice-Platform.git
cd LLD-Practice-Platform

# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Configure environment variables

In the `backend` folder, copy the example file to `.env`:

```bash
cd ../backend
cp .env.example .env
```

Open `.env` and fill in your values:

- `MONGODB_URI` — your MongoDB connection string (e.g., `mongodb://localhost:27017/lld-practice` or an Atlas URI)
- `GEMINI_API_KEY` — your Google Gemini API key
- `JWT_SECRET` — any long random string for signing user session tokens
- `PORT` — backend port, defaults to `3001` if omitted
- `JWT_EXPIRES_IN` — session duration, e.g. `24h`
- `FRONTEND_URL` — allowed CORS origin, typically `http://localhost:5173`

### 3. Seed initial problems

Before starting the server, seed the database with the default set of classic LLD problems (Parking Lot, Elevator System, Vending Machine, Rate Limiter, Library Management):

```bash
cd backend
npm run seed
```

### 4. Start the development servers

Run both the backend and frontend in separate terminals:

```bash
# Terminal 1: Backend (runs on http://localhost:3001)
cd backend
npm run dev

# Terminal 2: Frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

Head to `http://localhost:5173`, create an account on the register page, and you can jump straight into solving problems.

## Project Structure

The backend follows clean architecture principles, separating core business rules from database and framework concerns:

- `backend/src/domain/` holds the core domain models (`Problem`, `Submission`, `Attempt`, `Feedback`), evaluation interfaces, rubric configuration, and a state machine for submissions. Nothing in here imports Mongoose or Express.
- `backend/src/infrastructure/` contains Mongoose schemas and repository implementations that fulfill the domain interfaces.
- `backend/src/services/` orchestrates operations — auth, submissions, problem fetching, and the evaluation lifecycle.
- `backend/src/routes/` and `middleware/` handle HTTP requests, JWT verification, rate limiting, and input sanitization.

On the frontend (`frontend/src/`):

- `pages/` houses the primary views (problem browser, problem detail, writing an attempt, viewing feedback, my attempts history, and progress analytics).
- `components/` contains reusable UI pieces including the navigation bar, cards, and problem difficulty badges.
- `contexts/` manages user authentication state across the application.

## Key Design Decisions

A few architectural choices are worth highlighting:

- **Gate + Judge evaluation pipeline**: To avoid wasting API quota on empty, gibberish, or malformed inputs, a fast deterministic `RuleBasedEvaluator` runs first as a gatekeeper. If the submission passes basic keyword and length checks, it proceeds to the `LLMEvaluator` judge.
- **Two-layer injection defense**: Untrusted learner text is wrapped inside strict boundary tags in the prompt, and LLM responses are validated at runtime against a Zod schema before anything is written to the database. If the model returns out-of-bounds numbers or missing criteria, the submission fails safely instead of poisoning the DB.
- **Explicit submission state machine**: Submissions transition through strict states (`Submitted -> Evaluating -> Completed | Failed`), preventing invalid jumps (e.g., straight from Submitted to Completed without evaluation) and cleanly tracking retry attempts.
- **Repository pattern with domain decoupling**: Business logic talks to repository interfaces rather than Mongoose models directly. This is why the entire test suite runs in under 4 seconds without spinning up a database.

For a deeper dive into these trade-offs, check out [DESIGN.md](./DESIGN.md).

## Known Limitations

This prototype focuses on the core feedback loop, so a few production concerns are intentionally simplified:

- Submissions are currently text-only. Diagram rendering and AST-based code analysis are left for future iterations.
- Background evaluations run asynchronously in-process via `setImmediate` rather than using a persistent queue like BullMQ or RabbitMQ. A server restart during evaluation leaves the job in a failed state (though it can be manually retried).
- For local dev convenience, MongoDB Atlas network access is typically set wide (0.0.0.0/0). A production setup should lock this down to dedicated IPs or VPC peering.

## Running Tests

The backend includes a comprehensive unit test suite covering the state machine, rule evaluator, submission service, and evaluation error paths:

```bash
cd backend
npm test
```

All 32 tests run in-memory and do not require a live database or active API keys.
