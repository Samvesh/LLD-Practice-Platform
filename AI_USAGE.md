# AI Usage & Key Decisions

I used an AI assistant during the development of this platform for brainstorming architectural approaches, drafting boilerplate, and troubleshooting issues. Below are five key decisions where AI suggestions were evaluated, refined, or redirected based on project requirements.

### 1. Submission Persistence Order
The AI initially proposed validating submissions in-memory and rejecting malformed inputs with a 400 Bad Request before writing anything to MongoDB. I rejected this flow and chose to persist every submission immediately with a `Submitted` state before running rule-based checks. The platform's core loop relies on tracking learner improvement across attempts, and silent rejections would hide failed attempts from their history rather than showing clear, actionable feedback on what went wrong.

### 2. Evaluation Architecture: Gate vs. Scorer
Early discussions suggested having both the rule-based evaluator and the LLM evaluator compute partial scores that would then be combined into a final rubric score. I decided against mixing their responsibilities and instead structured the `RuleBasedEvaluator` strictly as a fast, zero-cost gatekeeper that checks structural requirements (minimum length, design terminology). Submissions that fail the gate exit early with a deterministic explanation, which preserves API quota and keeps the scoring model clean—the `LLMEvaluator` owns all eight rubric dimensions when the gate passes.

### 3. Prompt Injection Defense-in-Depth
When designing the LLM evaluation prompt, the initial suggestion relied on wrapping user input in XML-style boundary tags and instructing the model to treat the content as untrusted data. Recognizing that prompt-level instructions alone cannot reliably prevent jailbreaks or out-of-bounds outputs, I added a runtime validation layer using Zod. Even if an adversarial submission manages to manipulate the model, the response is parsed against strict numeric ranges (0–10) and required schema fields before touching the database, falling back to a safe failure state if validation fails.

### 4. Frontend Scope Management
The assistant drafted ambitious plans for the dashboard that included interactive SVG radar charts and multi-step transition animations for submission states. I pared this down to a clean, focused layout with clear metric cards and progress indicators. Since the core assignment heavily weights domain design and practice loop mechanics over visual flair, keeping the frontend straightforward allowed me to invest time where it mattered most—in the evaluation pipeline, state machine rigor, and test coverage.

### 5. MongoDB Atlas Connection Troubleshooting
When backend connection requests abruptly failed with timeout errors, the AI suggested looking into local OpenSSL configurations and TLS certificate mismatches. Before going down that rabbit hole, I checked the MongoDB Atlas dashboard and discovered that my ISP had rotated my dynamic IP address, leaving the Network Access whitelist stale. Updating the Atlas access entry immediately resolved the issue, serving as a practical reminder to verify basic network and access controls before deep-diving into low-level driver debugging.
