# Gemini 3.5 Research Plan

Last updated: 2026-06-27

## Goal

Become implementation-fluent enough to use Gemini 3.5 as a real product
capability, not a wrapper.

## Primary Research Questions

1. Which Gemini API surfaces are actually available for in-app agentic product
   behavior, including interaction-style work, stateful sessions, structured
   outputs, tool/computer use, and follow-up calls?
2. How do we preserve or display environment/session id for a stateful
   improvement lab?
3. What is the exact Gemini 3.5 Flash computer-use API shape for screenshot
   input and UI actions?
4. What model names and preview flags are required at hackathon time?
5. What rate limits, auth scopes, and response schemas affect demo reliability?
6. What is the smallest live integration that visibly qualifies for the Gemini
   3.5 prize?

## Sources To Check At Kickoff

- [Gemini API docs](https://ai.google.dev/gemini-api/docs/get-started)
- [Gemini 3.5 updates](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5)
- [Gemini API computer use](https://ai.google.dev/gemini-api/docs/computer-use)
- [Gemini Live Translate](https://ai.google.dev/gemini-api/docs/live-api/live-translate)
- [Gemma docs](https://ai.google.dev/gemma/docs/get_started)
- hackathon-provided docs or table guidance, if available onsite.

## Integration Spikes

### Spike A - Operator Plan

Call Gemini with one scenario and current policy. Return structured JSON:

- placement;
- rationale;
- constraints used;
- risks;
- confidence.

### Spike B - Critique and Mutation

Call Gemini with scorecard and failure trace. Return candidate policy mutation
in a structured format.

### Spike C - In-App Improvement Lab

Run candidate generation or scenario-variant generation through the app's
Gemini service layer. If a managed/session API is available, preserve its id and
show artifacts in the app.

### Spike D - Computer Use Audit

Send screenshot or browser state to Gemini 3.5 Flash computer use. Ask it to
inspect the judge path and return actions/findings.

## Fallback Policy

Fallbacks are allowed for demo resilience, but live Gemini usage is required for
the prize target. If a Gemini surface is blocked, the app must show:

- exact blocked feature;
- why it is blocked;
- what fallback is running;
- what would be live with access.

## AI Product Research

During kickoff, research current best practices for production AI product
quality:

- structured outputs and schema validation;
- deterministic evals around model outputs;
- trace capture and replay;
- prompt/version management;
- human-visible confidence and fallback states;
- latency/rate-limit handling;
- guardrails that are evaluated outside the model;
- UX patterns for making AI work inspectable instead of magical.
