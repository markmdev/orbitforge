export type GeminiOperatorPlan = {
  placement: string;
  rationale: string;
  constraintsUsed: string[];
  risks: string[];
  confidence: number;
  recommendedPolicyPatch: string;
};

export type GeminiCritique = {
  summary: string;
  failureAnalysis: string[];
  proposedExperiment: string;
  expectedMetricMove: string;
  promotionRecommendation: 'promote' | 'hold' | 'revise';
  guardrailConcerns: string[];
  judgeNarrative: string;
};

export type GeminiPlanTrace = {
  status: 'idle' | 'loading' | 'live' | 'fallback' | 'blocked';
  model: string;
  interactionStatus?: string;
  latencyMs?: number;
  promptPreview?: string;
  outputText?: string;
  cacheHit?: boolean;
  plan?: GeminiOperatorPlan;
  error?: string;
};

export type GeminiCritiqueTrace = {
  status: 'idle' | 'loading' | 'live' | 'fallback' | 'blocked';
  model: string;
  interactionStatus?: string;
  latencyMs?: number;
  promptPreview?: string;
  outputText?: string;
  cacheHit?: boolean;
  critique?: GeminiCritique;
  error?: string;
};

export type GeminiPlanRequest = {
  scenario: unknown;
  baselinePolicy: unknown;
  baselineScore: unknown;
  mutation: unknown;
  learningMemory?: unknown;
};

export type GeminiCritiqueRequest = {
  scenario: unknown;
  baselinePolicy: unknown;
  candidatePolicy: unknown;
  baselineScore: unknown;
  candidateScore: unknown;
  mutation: unknown;
  scenarioResults: unknown;
  promotionDecision: unknown;
  learningMemory?: unknown;
};

export async function requestGeminiPlan(request: GeminiPlanRequest): Promise<GeminiPlanTrace> {
  try {
    const response = await fetch('/api/gemini/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    const body = await response.json();

    if (!response.ok || !body.ok) {
      return fallbackPlanTrace(body.error ?? `Gemini request failed with ${response.status}`, request, body);
    }

    const plan = parseGeminiPlanText(body.outputText ?? '');

    return {
      status: 'live',
      model: body.model ?? 'gemini-3.5-flash',
      interactionStatus: body.interactionStatus,
      latencyMs: body.latencyMs,
      promptPreview: body.promptPreview,
      outputText: body.outputText,
      cacheHit: body.cacheHit,
      plan,
    };
  } catch (error) {
    return fallbackPlanTrace(error instanceof Error ? error.message : 'Unknown Gemini request failure', request);
  }
}

export async function requestGeminiCritique(request: GeminiCritiqueRequest): Promise<GeminiCritiqueTrace> {
  try {
    const response = await fetch('/api/gemini/critique', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    const body = await response.json();

    if (!response.ok || !body.ok) {
      return fallbackCritiqueTrace(body.error ?? `Gemini critique failed with ${response.status}`, request, body);
    }

    const critique = parseGeminiCritiqueText(body.outputText ?? '');

    return {
      status: 'live',
      model: body.model ?? 'gemini-3.5-flash',
      interactionStatus: body.interactionStatus,
      latencyMs: body.latencyMs,
      promptPreview: body.promptPreview,
      outputText: body.outputText,
      cacheHit: body.cacheHit,
      critique,
    };
  } catch (error) {
    return fallbackCritiqueTrace(error instanceof Error ? error.message : 'Unknown Gemini critique failure', request);
  }
}

export function parseGeminiPlanText(text: string): GeminiOperatorPlan {
  const parsed = JSON.parse(stripCodeFence(text));

  return {
    placement: requireString(parsed.placement, 'placement'),
    rationale: requireString(parsed.rationale, 'rationale'),
    constraintsUsed: requireStringArray(parsed.constraintsUsed, 'constraintsUsed'),
    risks: requireStringArray(parsed.risks, 'risks'),
    confidence: clampConfidence(parsed.confidence),
    recommendedPolicyPatch: requireString(parsed.recommendedPolicyPatch, 'recommendedPolicyPatch'),
  };
}

export function parseGeminiCritiqueText(text: string): GeminiCritique {
  const parsed = JSON.parse(stripCodeFence(text));

  return {
    summary: requireString(parsed.summary, 'summary'),
    failureAnalysis: requireStringArray(parsed.failureAnalysis, 'failureAnalysis'),
    proposedExperiment: requireString(parsed.proposedExperiment, 'proposedExperiment'),
    expectedMetricMove: requireString(parsed.expectedMetricMove, 'expectedMetricMove'),
    promotionRecommendation: requireRecommendation(parsed.promotionRecommendation),
    guardrailConcerns: requireStringArray(parsed.guardrailConcerns, 'guardrailConcerns'),
    judgeNarrative: requireString(parsed.judgeNarrative, 'judgeNarrative'),
  };
}

function fallbackPlanTrace(
  error: string,
  request: GeminiPlanRequest,
  partial?: Partial<GeminiPlanTrace>,
): GeminiPlanTrace {
  const scenario = extractScenarioContext(request.scenario);
  const learningMemory = extractLearningMemoryContext(request.learningMemory);
  const fallbackPlan = buildScenarioAwareFallbackPlan(scenario, learningMemory);

  return {
    status: 'fallback',
    model: partial?.model ?? 'gemini-fallback',
    interactionStatus: partial?.interactionStatus,
    latencyMs: partial?.latencyMs,
    promptPreview: partial?.promptPreview,
    outputText: partial?.outputText,
    cacheHit: partial?.cacheHit,
    error,
    plan: fallbackPlan,
  };
}

type ScenarioContext = {
  name: string;
  incident: string;
  workload: string;
  freshnessMinutes: number | null;
  deadlinePressure: number | null;
  thermalSensitivity: number | null;
  contactSensitivity: number | null;
  radiationSensitivity: number | null;
};

type LearningMemoryContext = {
  count: number;
  latestScenarioName: string | null;
  latestFailureSignature: string | null;
  latestAverageDelta: number | null;
};

function extractScenarioContext(value: unknown): ScenarioContext {
  const scenario = value && typeof value === 'object' ? value as Record<string, unknown> : {};

  return {
    name: readString(scenario.name, 'active seeded scenario'),
    incident: readString(scenario.incident, 'current seeded incident'),
    workload: readString(scenario.workload, 'seeded orbital workload'),
    freshnessMinutes: readNumber(scenario.freshnessMinutes),
    deadlinePressure: readNumber(scenario.deadlinePressure),
    thermalSensitivity: readNumber(scenario.thermalSensitivity),
    contactSensitivity: readNumber(scenario.contactSensitivity),
    radiationSensitivity: readNumber(scenario.radiationSensitivity),
  };
}

function extractLearningMemoryContext(value: unknown): LearningMemoryContext {
  const entries = Array.isArray(value) ? value : [];
  const latest = entries.find((entry) => entry && typeof entry === 'object') as Record<string, unknown> | undefined;

  return {
    count: entries.length,
    latestScenarioName: readStringOrNull(latest?.scenarioName),
    latestFailureSignature: readStringOrNull(latest?.failureSignature),
    latestAverageDelta: readNumber(latest?.averageDelta),
  };
}

function buildScenarioAwareFallbackPlan(scenario: ScenarioContext, learningMemory: LearningMemoryContext): GeminiOperatorPlan {
  const name = scenario.name.toLowerCase();
  const incident = scenario.incident.toLowerCase();
  const workload = scenario.workload.toLowerCase();
  const constraints = ['seeded-data'];
  const memoryConstraints = learningMemory.count > 0 ? ['learning-memory'] : [];
  const memoryRisks = learningMemory.count > 0 ? ['seeded-learning-memory'] : [];
  const memoryPatch =
    learningMemory.count > 0
      ? ` Reuse retained memory from ${learningMemory.latestScenarioName ?? 'prior scenario'} (${learningMemory.latestFailureSignature ?? 'failure signature unavailable'}, sweep ${learningMemory.latestAverageDelta ?? '--'}).`
      : '';

  if ((scenario.deadlinePressure ?? 0) > 70 || scenario.freshnessMinutes !== null && scenario.freshnessMinutes <= 30) {
    constraints.push('freshness');
  }

  if ((scenario.thermalSensitivity ?? 0) > 55 || incident.includes('thermal')) {
    constraints.push('thermal');
  }

  if ((scenario.contactSensitivity ?? 0) > 55 || incident.includes('contact') || incident.includes('outage')) {
    constraints.push('contact');
  }

  if ((scenario.radiationSensitivity ?? 0) > 55 || name.includes('radiation') || incident.includes('ecc')) {
    constraints.push('radiation');

    return {
      placement: 'split',
      rationale: `Fallback plan for ${scenario.name} keeps ${scenario.workload} in a validation-first split path, rerunning confidence-sensitive work away from the anomalous accelerator before releasing results.${memoryPatch}`,
      constraintsUsed: Array.from(new Set([...constraints, 'confidence', ...memoryConstraints])),
      risks: ['live-gemini-unavailable', 'radiation-validation-needed', 'requires-manual-verification', ...memoryRisks],
      confidence: 58,
      recommendedPolicyPatch: `Raise radiation and confidence weighting before accepting accelerator output under ECC anomalies.${memoryPatch}`,
    };
  }

  if (name.includes('climate') || workload.includes('climate') || (scenario.freshnessMinutes ?? 0) >= 240) {
    return {
      placement: 'earth_cloud',
      rationale: `Fallback plan for ${scenario.name} treats ${scenario.workload} as non-urgent orbital preprocessing, preserving onboard thermal and storage margin while shifting aggregation to Earth cloud capacity.${memoryPatch}`,
      constraintsUsed: Array.from(new Set([...constraints, 'storage', 'cost', ...memoryConstraints])),
      risks: ['live-gemini-unavailable', 'batch-latency-acceptable', 'requires-manual-verification', ...memoryRisks],
      confidence: 64,
      recommendedPolicyPatch: `Lower deadline urgency for long-window reprocessing and protect orbital compute for time-critical incidents.${memoryPatch}`,
    };
  }

  return {
    placement: 'split',
    rationale: `Fallback plan for ${scenario.name} splits ${scenario.workload} so orbital preprocessing only runs where thermal and contact-window constraints fit the seeded incident: ${scenario.incident}.${memoryPatch}`,
    constraintsUsed: Array.from(new Set([...constraints, 'freshness', 'thermal', 'contact', ...memoryConstraints])),
    risks: ['live-gemini-unavailable', 'requires-manual-verification', ...memoryRisks],
    confidence: 62,
    recommendedPolicyPatch: `Raise thermal/contact weighting and keep seeded-data guardrails visible.${memoryPatch}`,
  };
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function readStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function fallbackCritiqueTrace(
  error: string,
  request: GeminiCritiqueRequest,
  partial?: Partial<GeminiCritiqueTrace>,
): GeminiCritiqueTrace {
  const failureAnalysis = extractFailureAnalysis(request.baselineScore);
  const learningMemory = extractLearningMemoryContext(request.learningMemory);
  const memoryFailureAnalysis =
    learningMemory.count > 0
      ? [
          `Retained learning memory: ${learningMemory.latestFailureSignature ?? 'failure signature unavailable'} on ${learningMemory.latestScenarioName ?? 'prior scenario'} with sweep ${learningMemory.latestAverageDelta ?? '--'}.`,
        ]
      : [];
  const memoryExperiment =
    learningMemory.count > 0
      ? ' Replay the retained learning-memory signature before changing the policy patch.'
      : '';
  const memoryJudgeNote =
    learningMemory.count > 0
      ? ' The fallback critique explicitly reuses retained learning memory while labeling live Gemini as unavailable.'
      : '';

  return {
    status: 'fallback',
    model: partial?.model ?? 'gemini-fallback',
    interactionStatus: partial?.interactionStatus,
    latencyMs: partial?.latencyMs,
    promptPreview: partial?.promptPreview,
    outputText: partial?.outputText,
    cacheHit: partial?.cacheHit,
    error,
    critique: {
      summary: 'Fallback critique uses baseline deterministic evaluator failures until live Gemini critique is available.',
      failureAnalysis: [...failureAnalysis, ...memoryFailureAnalysis],
      proposedExperiment: `Keep the thermal-contact candidate and run it against the full seeded scenario sweep.${memoryExperiment}`,
      expectedMetricMove: 'Expect thermal/contact dimensions to improve while guardrail stays flat or improves.',
      promotionRecommendation: 'hold',
      guardrailConcerns: ['requires-live-gemini-critique-before-judge-claim'],
      judgeNarrative: `OrbitForge labels this as fallback analysis and does not present it as live Gemini output.${memoryJudgeNote}`,
    },
  };
}

function stripCodeFence(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Gemini response missing string field: ${field}`);
  }

  return value;
}

function requireRecommendation(value: unknown): GeminiCritique['promotionRecommendation'] {
  if (value === 'promote' || value === 'hold' || value === 'revise') {
    return value;
  }

  throw new Error('Gemini critique missing promotion recommendation');
}

function requireStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Gemini response missing string array field: ${field}`);
  }

  return value;
}

function clampConfidence(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    throw new Error('Gemini response missing numeric confidence');
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function extractFailureAnalysis(score: unknown): string[] {
  const failures = typeof score === 'object' && score !== null && 'failures' in score ? (score as { failures?: unknown }).failures : null;

  if (Array.isArray(failures) && failures.every((failure) => typeof failure === 'string') && failures.length > 0) {
    return failures.map((failure) => `Deterministic evaluator flagged ${failure}.`);
  }

  return ['No candidate failures were available to the fallback critic.'];
}
