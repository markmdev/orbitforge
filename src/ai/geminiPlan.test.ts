import { afterEach, describe, expect, it } from 'vitest';
import { parseGeminiCritiqueText, parseGeminiPlanText, requestGeminiCritique } from './geminiPlan';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('Gemini plan parser', () => {
  it('parses compact JSON plan output', () => {
    const plan = parseGeminiPlanText(
      '{"placement":"split","rationale":"Use safer thermal path.","constraintsUsed":["thermal"],"risks":["contact"],"confidence":78,"recommendedPolicyPatch":"Raise thermal weight."}',
    );

    expect(plan.placement).toBe('split');
    expect(plan.confidence).toBe(78);
    expect(plan.constraintsUsed).toEqual(['thermal']);
  });

  it('rejects malformed plan output', () => {
    expect(() => parseGeminiPlanText('{"placement":"split"}')).toThrow(/rationale/);
  });
});

describe('Gemini critique parser', () => {
  it('parses compact JSON critique output', () => {
    const critique = parseGeminiCritiqueText(
      '{"summary":"Thermal/contact improved.","failureAnalysis":["contact is still weak"],"proposedExperiment":"Lower orbital batch size.","expectedMetricMove":"Contact +6, thermal +4.","promotionRecommendation":"revise","guardrailConcerns":["none"],"judgeNarrative":"Evaluator held the policy for a specific reason."}',
    );

    expect(critique.promotionRecommendation).toBe('revise');
    expect(critique.failureAnalysis).toEqual(['contact is still weak']);
  });

  it('rejects unsupported critique recommendations', () => {
    expect(() =>
      parseGeminiCritiqueText(
        '{"summary":"x","failureAnalysis":[],"proposedExperiment":"x","expectedMetricMove":"x","promotionRecommendation":"ship","guardrailConcerns":[],"judgeNarrative":"x"}',
      ),
    ).toThrow(/promotion recommendation/);
  });

  it('uses baseline failures when blocked critique falls back', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: false, error: 'quota blocked' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });

    const trace = await requestGeminiCritique({
      scenario: { id: 'wildfire-sar' },
      baselinePolicy: { id: 'policy-v0' },
      candidatePolicy: { id: 'policy-v1' },
      baselineScore: { failures: ['thermal:21', 'contact:27'] },
      candidateScore: { failures: [] },
      mutation: { summary: 'Raise thermal/contact awareness.' },
      scenarioResults: [],
      promotionDecision: { promoted: true, averageDelta: 11 },
    });

    expect(trace.status).toBe('fallback');
    expect(trace.error).toBe('quota blocked');
    expect(trace.critique?.summary).toContain('baseline deterministic evaluator failures');
    expect(trace.critique?.failureAnalysis).toContain('Deterministic evaluator flagged thermal:21.');
    expect(trace.critique?.failureAnalysis).toContain('Deterministic evaluator flagged contact:27.');
  });
});
