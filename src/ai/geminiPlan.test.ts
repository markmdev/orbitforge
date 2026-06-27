import { describe, expect, it } from 'vitest';
import { parseGeminiPlanText } from './geminiPlan';

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
