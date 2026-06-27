# Gemini Source Index

Last checked: 2026-06-27.

| Source | Why it matters |
|---|---|
| [Gemini API docs](https://ai.google.dev/gemini-api/docs/get-started) | Main entry point for Gemini API setup and model usage. |
| [Gemini 3.5 updates](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5) | Prize-relevant current feature surface and model updates. |
| [Gemini API computer use](https://ai.google.dev/gemini-api/docs/computer-use) | Primary source for native computer-use design and API integration. |
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
