# NOTE-0005 - Access Tests and Repo Setup

Date: 2026-06-27

Gemini API key was saved locally in `.env.local` and tested without printing the
secret.

Gemini test result:

- `models` listing succeeded.
- `models/gemini-3.5-flash` is available.
- a minimal `generateContent` probe returned the expected sentinel response.

Linear test result:

- Browser access to the existing project works.
- Codex Linear connector returned `oauth_token_invalid_grant`; it needs
  reauthentication before automated issue creation/updating will work.

GitHub plan:

- create public repo `markmdev/orbitforge`;
- commit in small logical chunks;
- never commit `.env.local`.

