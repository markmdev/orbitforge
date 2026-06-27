import { describe, expect, it } from 'vitest';
import { parseGeminiCritiqueText, parseGeminiPlanText } from './geminiPlan';

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
});
