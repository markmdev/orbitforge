# Gemini Source Index

Last checked: 2026-06-27.

| Source | Why it matters |
|---|---|
| [Gemini API docs](https://ai.google.dev/gemini-api/docs/get-started) | Main entry point for Gemini API setup and model usage. |
| [Gemini 3.5 updates](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5) | Prize-relevant current feature surface and model updates. |
| [Gemini API computer use](https://ai.google.dev/gemini-api/docs/computer-use) | Primary source for native computer-use design and API integration. |
| [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output) | Source for schema-constrained JSON outputs used by plan and critique traces. |
| [Gemini Live Translate](https://ai.google.dev/gemini-api/docs/live-api/live-translate) | Optional stretch source for real-time speech translation. |
| [Gemma docs](https://ai.google.dev/gemma/docs/get_started) | Optional on-device/edge stretch source. |
| [Google AI Studio API keys](https://aistudio.google.com/api-keys) | API key setup surface for implementation. |

## Design Notes

Use docs as current implementation truth during build. The hackathon prompt
mentions managed agents, Interactions API, and Gemini 3.5 Flash computer use.
Gemini must be used inside the app as a product capability, not as a
development-time AGENTS/SKILL scaffold. Gemini Antigravity is an IDE, not a
required runtime dependency. If API details differ from the prompt when
implementation starts, follow the live Gemini docs and label any blocked feature
clearly in the demo.

## Current Implementation Notes

- The app uses Gemini through app runtime endpoints, not through local
  development skills.
- Plan and critique endpoints use structured output schemas and client-side
  parsing.
- Computer-use audit follows the documented screenshot/action-loop concept but
  does not execute actions; it displays proposed actions or the exact API/quota
  blocker.
- The latest observed blocker was quota: `You do not have enough quota to make
  this request.` Keep this exact state visible if it recurs.
