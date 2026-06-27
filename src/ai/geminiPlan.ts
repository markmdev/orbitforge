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
      return fallbackPlanTrace(body.error ?? `Gemini request failed with ${response.status}`, body);
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
    return fallbackPlanTrace(error instanceof Error ? error.message : 'Unknown Gemini request failure');
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

function fallbackPlanTrace(error: string, partial?: Partial<GeminiPlanTrace>): GeminiPlanTrace {
  return {
    status: 'fallback',
    model: partial?.model ?? 'gemini-fallback',
    interactionStatus: partial?.interactionStatus,
    latencyMs: partial?.latencyMs,
    promptPreview: partial?.promptPreview,
    outputText: partial?.outputText,
    cacheHit: partial?.cacheHit,
    error,
    plan: {
      placement: 'split',
      rationale:
        'Fallback plan splits wildfire SAR preprocessing away from the thermally constrained accelerator and routes downlink through the hybrid station.',
      constraintsUsed: ['freshness', 'thermal', 'contact', 'seeded-data'],
      risks: ['live-gemini-unavailable', 'requires-manual-verification'],
      confidence: 62,
      recommendedPolicyPatch: 'Raise thermal/contact weighting and keep seeded-data guardrails visible.',
    },
  };
}

function fallbackCritiqueTrace(
  error: string,
  request: GeminiCritiqueRequest,
  partial?: Partial<GeminiCritiqueTrace>,
): GeminiCritiqueTrace {
  const failureAnalysis = extractFailureAnalysis(request.candidateScore);

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
      summary: 'Fallback critique uses deterministic evaluator failures until live Gemini critique is available.',
      failureAnalysis,
      proposedExperiment: 'Keep the thermal-contact candidate and run it against the full seeded scenario sweep.',
      expectedMetricMove: 'Expect thermal/contact dimensions to improve while guardrail stays flat or improves.',
      promotionRecommendation: 'hold',
      guardrailConcerns: ['requires-live-gemini-critique-before-judge-claim'],
      judgeNarrative: 'OrbitForge labels this as fallback analysis and does not present it as live Gemini output.',
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
