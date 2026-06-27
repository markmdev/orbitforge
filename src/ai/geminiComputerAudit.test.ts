import { describe, expect, it } from 'vitest';
import { normalizeAuditActions } from './geminiComputerAudit';

describe('Gemini computer-use audit actions', () => {
  it('normalizes function-call action payloads for display', () => {
    const actions = normalizeAuditActions([
      {
        name: 'click',
        intent: 'Open Gemini Trace.',
        x: 520,
        y: 130,
        safetyDecision: 'allowed',
      },
      {
        name: 42,
        intent: null,
      },
    ]);

    expect(actions).toEqual([
      {
        name: 'click',
        intent: 'Open Gemini Trace.',
        x: 520,
        y: 130,
        safetyDecision: 'allowed',
      },
      {
        name: 'unknown',
        intent: 'No intent provided.',
        x: undefined,
        y: undefined,
        safetyDecision: undefined,
      },
    ]);
  });
});
