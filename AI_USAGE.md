# AI Usage Log

This document records 5 real decisions made with AI assistance during the development of the LLD Practice Platform.

---

## 1. Domain Model: Discriminated Union for SubmissionContent

**What was suggested**: AI suggested using a TypeScript discriminated union (`{ format: 'text', body: string } | { format: 'diagram', data: string }`) for `SubmissionContent` instead of a generic `any` or a base class with subclasses.

**Decision**: Accepted. Discriminated unions are idiomatic TypeScript, provide compile-time safety, and make the extensibility story clear — adding a new format is just adding a new union variant. No runtime overhead of a class hierarchy.

**Why**: This was a better fit than class inheritance because submission content is data, not behavior. The format determines how to render and validate, not what methods to call.

---

## 2. Evaluation Architecture: Gate + Judge vs. Composite Scoring

**What was suggested**: AI initially proposed both evaluators producing scores that would be "merged" into a final result. After review, the approach was changed to a gate+judge model where the RuleBasedEvaluator only produces pass/fail.

**Decision**: Accepted the revised gate+judge model. The RuleBasedEvaluator is a gate (free, fast, no scores). The LLMEvaluator is the judge (expensive, produces all scores). No score merging needed.

**Why**: Merging scores from two fundamentally different evaluators (deterministic checks vs. LLM judgment) would produce misleading results. A "length check" score doesn't belong in the same rubric as "encapsulation quality." The gate simply prevents wasting an API call on submissions that clearly aren't design solutions.

---

## 3. Prompt Injection Defense: Two-Layer Approach

**What was suggested**: AI suggested wrapping user content in XML-like delimiters (`<UNTRUSTED_LEARNER_SUBMISSION>`) with system instructions to ignore embedded commands.

**Decision**: Accepted, but enhanced with a second layer — Zod schema validation of LLM output. The delimiter approach is prompt-level defense (asks the model to behave). The schema validation is code-level defense (enforces the model's output is valid regardless of what the model "wants" to return).

**Why**: Prompt-level defenses alone are unreliable — they're suggestions, not guarantees. A determined attacker could craft input that tricks the model into outputting a score of 100 (when max is 10). The Zod validation catches this: `z.number().int().min(0).max(10)` rejects any out-of-bounds score. If validation fails, the submission is marked `Failed` with `failureCause: 'system'` — the evaluator is treated as having malfunctioned.

---

## 4. State Machine: Custom Class vs. XState

**What was suggested**: AI suggested considering XState for the submission state machine.

**Decision**: Rejected. Implemented a custom 50-line `SubmissionStateMachine` class instead.

**Why**: XState is a full state machine library with visual editor support, parallel states, guards, actions, and more. For a 4-state linear machine with one retry transition, it's massive overkill. The custom class is simpler to understand, has zero dependencies, and the transition map (`VALID_TRANSITIONS`) is readable in 10 seconds. If the state machine grew to 10+ states with complex guards, XState would be justified.

---

## 5. Async Evaluation: setImmediate vs. Job Queue

**What was suggested**: AI suggested using Bull/BullMQ with Redis for the async evaluation pipeline.

**Decision**: Rejected for the prototype. Used `setImmediate` for in-process async execution instead.

**Why**: A Redis-backed job queue would add: (a) a Redis dependency, (b) a worker process, (c) queue configuration, (d) serialization/deserialization of job data. For a 2-day prototype where "don't block the HTTP response" is the only requirement, `setImmediate` achieves this in 1 line. The trade-off is clear: if the server crashes during evaluation, the job is lost. But the submission is already persisted (persist-first architecture), and the learner can retry via `POST /submissions/:id/retry`. For production, Bull + Redis would be the right call.
