import { afterEach, describe, expect, it } from 'vitest';
import { parseGeminiCritiqueText, parseGeminiPlanText, requestGeminiCritique, requestGeminiPlan } from './geminiPlan';

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

  it('uses the active scenario when the operator plan falls back', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: false, error: 'quota blocked' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });

    const trace = await requestGeminiPlan({
      scenario: {
        name: 'Radiation Spike During Inference',
        incident: 'ECC anomaly during accelerator run',
        workload: 'Event validation and confidence repair',
        freshnessMinutes: 30,
        deadlinePressure: 72,
        radiationSensitivity: 88,
      },
      baselinePolicy: { id: 'policy-v0' },
      baselineScore: { total: 81 },
      mutation: { summary: 'Raise radiation confidence.' },
    });

    expect(trace.status).toBe('fallback');
    expect(trace.plan?.rationale).toContain('Radiation Spike During Inference');
    expect(trace.plan?.rationale).toContain('validation-first');
    expect(trace.plan?.rationale).not.toContain('wildfire');
    expect(trace.plan?.constraintsUsed).toContain('radiation');
  });

  it('marks fallback operator plans as memory-aware when retained memory exists', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: false, error: 'quota blocked' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });

    const trace = await requestGeminiPlan({
      scenario: {
        name: 'Wildfire SAR Rapid Response',
        incident: 'Thermal pressure plus optical-weather outage',
        workload: 'Synthetic aperture radar inference',
        freshnessMinutes: 15,
        deadlinePressure: 96,
        thermalSensitivity: 70,
        contactSensitivity: 82,
      },
      baselinePolicy: { id: 'policy-v0' },
      baselineScore: { total: 70 },
      mutation: { summary: 'Raise thermal/contact awareness.' },
      learningMemory: [
        {
          scenarioName: 'Wildfire SAR Rapid Response',
          failureSignature: 'thermal:21, contact:27',
          averageDelta: 11,
        },
      ],
    });

    expect(trace.status).toBe('fallback');
    expect(trace.plan?.constraintsUsed).toContain('learning-memory');
    expect(trace.plan?.risks).toContain('seeded-learning-memory');
    expect(trace.plan?.recommendedPolicyPatch).toContain('Reuse retained memory');
    expect(trace.plan?.recommendedPolicyPatch).toContain('thermal:21, contact:27');
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

  it('reuses retained memory when blocked critique falls back', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: false, error: 'quota blocked' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });

    const trace = await requestGeminiCritique({
      scenario: { name: 'Wildfire SAR Rapid Response' },
      baselinePolicy: { id: 'policy-v0' },
      candidatePolicy: { id: 'policy-v1' },
      baselineScore: { failures: ['thermal:21'] },
      candidateScore: { total: 86 },
      mutation: { summary: 'Raise thermal/contact awareness.' },
      scenarioResults: [],
      promotionDecision: { promoted: true },
      learningMemory: [
        {
          scenarioName: 'Wildfire SAR Rapid Response',
          failureSignature: 'thermal:21, contact:27',
          averageDelta: 11,
        },
      ],
    });

    expect(trace.status).toBe('fallback');
    expect(trace.critique?.failureAnalysis).toContain(
      'Retained learning memory: thermal:21, contact:27 on Wildfire SAR Rapid Response with sweep 11.',
    );
    expect(trace.critique?.proposedExperiment).toContain('retained learning-memory signature');
    expect(trace.critique?.judgeNarrative).toContain('reuses retained learning memory');
  });
});
