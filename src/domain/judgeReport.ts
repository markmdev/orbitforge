export type JudgeReportInput = {
  activeScenarioName: string;
  activePolicyName: string;
  activePolicyState: 'baseline' | 'promoted';
  baselineScore: number;
  candidatePolicyName: string;
  candidateScore: number;
  averageDelta: number;
  promoted: boolean;
  planStatus: string;
  planError?: string;
  critiqueStatus: string;
  critiqueError?: string;
  auditStatus: string;
  auditError?: string;
  auditExecutionMode?: string;
  auditPromptInjectionDetection?: boolean;
  incidentReadinessScore?: number;
  incidentReadinessLabel?: string;
  appliedCommandLabels?: string[];
};

export function buildJudgeReport(input: JudgeReportInput): string {
  const auditMetadata: string[] = [];

  if (input.auditExecutionMode) {
    auditMetadata.push(`- Computer-use mode: ${formatAuditMode(input.auditExecutionMode)}`);
  }

  if (typeof input.auditPromptInjectionDetection === 'boolean') {
    auditMetadata.push(`- Prompt-injection guard: ${formatPromptGuard(input.auditPromptInjectionDetection)}`);
  }

  return [
    'OrbitForge Judge Report',
    '',
    `Scenario: ${input.activeScenarioName}`,
    `Active policy: ${input.activePolicyName} (${input.activePolicyState})`,
    `Baseline score: ${input.baselineScore}`,
    `Candidate policy: ${input.candidatePolicyName}`,
    `Candidate score: ${input.candidateScore}`,
    `Incident readiness: ${formatIncidentReadiness(input.incidentReadinessScore, input.incidentReadinessLabel)}`,
    `Commands applied: ${formatCommandLabels(input.appliedCommandLabels)}`,
    `Average sweep delta: ${signedDelta(input.averageDelta)}`,
    `Promotion gate: ${input.promoted ? 'accepted' : 'held'}`,
    '',
    'Gemini surfaces:',
    `- Operator plan: ${formatReportStatus(input.planStatus, input.planError)}`,
    `- Improvement critique: ${formatReportStatus(input.critiqueStatus, input.critiqueError)}`,
    `- Computer-use audit: ${formatReportStatus(input.auditStatus, input.auditError)}`,
    ...auditMetadata,
    '',
    'Guardrail: all telemetry is seeded simulation data; OrbitForge does not claim real satellite control.',
  ].join('\n');
}

export function formatAuditMode(mode?: string): string {
  return mode === 'propose_only' ? 'propose-only' : '--';
}

export function formatPromptGuard(enabled?: boolean): string {
  return enabled ? 'enabled' : '--';
}

function signedDelta(value: number): string {
  return `${value > 0 ? '+' : ''}${value}`;
}

function formatReportStatus(status: string, error?: string): string {
  return error ? `${status} (${error})` : status;
}

function formatIncidentReadiness(score?: number, label?: string): string {
  if (typeof score !== 'number') {
    return 'not captured';
  }

  return `${score}%${label ? ` (${label})` : ''}`;
}

function formatCommandLabels(labels?: string[]): string {
  if (!labels || labels.length === 0) {
    return 'none';
  }

  return labels.join(', ');
}
