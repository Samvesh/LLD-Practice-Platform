# Research: LLD Practice & Feedback Tools

## The Learner's Problem

Low-Level Design (LLD) is a critical skill for software engineering interviews and real-world system building. Learners studying LLD face three core challenges:

1. **No structured practice environment**: LLD problems are discussed in blog posts and YouTube videos, but there's no platform that lets you actively write a design solution and get feedback on it — the way LeetCode does for algorithms.

2. **No feedback loop**: A learner can read about the Parking Lot problem and write a design, but they have no way to know if their class decomposition is good, if their coupling is too tight, or if they missed edge cases. Self-assessment is unreliable, and peer review requires finding a willing, knowledgeable reviewer.

3. **No improvement tracking**: Even learners who practice repeatedly have no way to see how their designs improve across attempts. There's no history, no score trajectory, and no targeted "your encapsulation improved but extensibility regressed" feedback.

## Existing Tools & Approaches

### 1. LeetCode / HackerRank
- **What they do**: Algorithm practice with automated test-case-based evaluation.
- **Gap**: No support for design problems at all. LLD is not testable via input/output test cases — it requires evaluating class structure, responsibility assignment, and design reasoning.

### 2. InterviewReady / Educative (Grokking OOD)
- **What they do**: Pre-written walkthroughs of LLD problems with model solutions.
- **Gap**: Passive learning only. The learner reads a solution but doesn't submit their own. No personalized feedback, no "here's what's wrong with YOUR design." Learning science consistently shows that active practice with feedback outperforms passive reading.

### 3. ChatGPT / Claude / Gemini (direct prompting)
- **What they do**: A learner can paste their design into an LLM and ask "is this good?"
- **Gap**: Unstructured, inconsistent feedback. No rubric, no scoring dimensions, no history tracking. The learner gets a wall of text that varies wildly between sessions. No defense against the LLM just being nice and saying "great job!" without substance.

## Our Product Direction

The LLD Practice Platform fills the gap between passive content (Educative) and unstructured AI feedback (ChatGPT) by providing:

- **Active practice**: The learner writes their own design, not reads someone else's.
- **Structured AI feedback**: Evaluation against a fixed, multi-dimensional rubric with per-criterion scores, evidence, concerns, and suggestions — not an open-ended "is this good?" prompt.
- **Improvement tracking**: Every attempt is persisted with its feedback, enabling the learner to see their progress over time.
- **Reliability**: Persist-first architecture ensures no work is lost. Evaluation failures are retryable. The system is honest about what went wrong.

This is a focused practice tool, not an LMS or assessment platform. It does one thing — help a learner practice and improve at LLD — and does it well.
