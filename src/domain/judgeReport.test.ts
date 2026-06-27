import { describe, expect, it } from 'vitest';
import { buildJudgeReport, formatAuditMode, formatPromptGuard } from './judgeReport';

describe('judge report', () => {
  it('includes Gemini errors, audit metadata, promotion delta, and seeded-data guardrail', () => {
    const report = buildJudgeReport({
      activeScenarioName: 'Wildfire SAR Rapid Response',
      activePolicyName: 'v1 thermal-aware candidate',
      activePolicyState: 'promoted',
      baselineScore: 72,
      candidatePolicyName: 'v1 thermal-aware candidate',
      candidateScore: 83,
      averageDelta: 10,
      promoted: true,
      planStatus: 'fallback',
      planError: 'You do not have enough quota to make this request.',
      critiqueStatus: 'live',
      auditStatus: 'fallback',
      auditError: 'quota exhausted',
      auditExecutionMode: 'propose_only',
      auditPromptInjectionDetection: true,
    });

    expect(report).toContain('Scenario: Wildfire SAR Rapid Response');
    expect(report).toContain('Active policy: v1 thermal-aware candidate (promoted)');
    expect(report).toContain('Average sweep delta: +10');
    expect(report).toContain('Promotion gate: accepted');
    expect(report).toContain('Operator plan: fallback (You do not have enough quota to make this request.)');
    expect(report).toContain('Computer-use audit: fallback (quota exhausted)');
    expect(report).toContain('Computer-use mode: propose-only');
    expect(report).toContain('Prompt-injection guard: enabled');
    expect(report).toContain('all telemetry is seeded simulation data');
    expect(report).toContain('does not claim real satellite control');
  });

  it('formats unknown audit metadata conservatively', () => {
    expect(formatAuditMode(undefined)).toBe('--');
    expect(formatAuditMode('execute')).toBe('--');
    expect(formatPromptGuard(undefined)).toBe('--');
    expect(formatPromptGuard(false)).toBe('--');
  });
});
