import { afterEach, describe, expect, it } from 'vitest';
import { normalizeAuditActions, requestGeminiComputerAudit } from './geminiComputerAudit';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

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

  it('preserves propose-only and prompt guard metadata when the audit falls back', async () => {
    globalThis.fetch = async () => {
      throw new Error('quota blocked');
    };

    const trace = await requestGeminiComputerAudit({
      task: 'Audit current screen.',
      screenText: 'OrbitForge audit frame\nCandidate score: 85\nPromotion gate: accepted',
      screenshotBase64: 'abc123',
      viewport: { width: 1200, height: 760 },
    });

    expect(trace.status).toBe('fallback');
    expect(trace.executionMode).toBe('propose_only');
    expect(trace.promptInjectionDetection).toBe(true);
    expect(trace.promptPreview).toContain('Candidate score: 85');
    expect(trace.actions[0]?.safetyDecision).toBe('blocked');
  });
});
