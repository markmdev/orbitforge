# Tools and Access Checklist

Last updated: 2026-06-27

## Required From Mark Before Kickoff

### Google / Gemini

Needed:

- Google AI Studio API key or Google Cloud credentials with Gemini API access.
- Access to Gemini 3.5 features required by the hackathon.
- Confirmation that Gemini 3.5 Flash computer use is available to the account.
- Optional confirmation of which Gemini managed-agent or Interactions API
  surfaces are available to the account. The Gemini Antigravity IDE is not
  required, and development-time AGENTS/SKILL files are not part of the app plan.

Mark action:

- create or provide the key through the secure local mechanism requested at
  kickoff;
- do not paste secrets into chat.

### Linear

Needed:

- Linear app connected to Codex;
- target workspace/team confirmed;
- permission to create project and issues.

Mark action:

- connect/confirm Linear access if tool calls fail.

## Optional

### DigitalOcean

Useful for:

- stable public demo URL;
- backend environment for Gemini calls;
- judge-friendly access.

Not required for:

- core Gemini prize;
- local demo proof.

### LiveKit

Not a target. Only use if the core demo is already strong and a voice/briefing
surface would materially improve judging.

### Domain / GitHub / Public Repo

Optional. Use only if deployment or sharing needs it.

## Local Tooling

Expected:

- Node.js;
- npm;
- browser for manual QA;
- Codex thread tools;
- Linear connector;
- Gemini API credentials.

Useful commands:

- `npm run dev -- --host 127.0.0.1` for local development with Gemini routes.
- `npm run build` for production bundle verification.
- `npm run preview -- --host 127.0.0.1 --port 4173` for built-app preview with
  Gemini routes.
- `ORBITFORGE_BASE_URL=http://127.0.0.1:4173 npm run verify:runtime` to verify
  a preview server instead of the dev server.

## Blocker Rule

Only these should block the 24-hour run:

- missing API/account access Mark must provide;
- paid account approval;
- security/secrets concern;
- external service outage with no honest fallback;
- Mark changes the target.

Everything else should be handled by the Controller.
