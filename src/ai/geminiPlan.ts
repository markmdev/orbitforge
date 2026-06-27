export type GeminiOperatorPlan = {
  placement: string;
  rationale: string;
  constraintsUsed: string[];
  risks: string[];
  confidence: number;
  recommendedPolicyPatch: string;
};

export type GeminiPlanTrace = {
  status: 'idle' | 'loading' | 'live' | 'fallback' | 'blocked';
  model: string;
  interactionStatus?: string;
  latencyMs?: number;
  outputText?: string;
  plan?: GeminiOperatorPlan;
  error?: string;
};

export type GeminiPlanRequest = {
  scenario: unknown;
  baselinePolicy: unknown;
  baselineScore: unknown;
  mutation: unknown;
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
      return fallbackTrace(body.error ?? `Gemini request failed with ${response.status}`);
    }

    const plan = parseGeminiPlanText(body.outputText ?? '');

    return {
      status: 'live',
      model: body.model ?? 'gemini-3.5-flash',
      interactionStatus: body.interactionStatus,
      latencyMs: body.latencyMs,
      outputText: body.outputText,
      plan,
    };
  } catch (error) {
    return fallbackTrace(error instanceof Error ? error.message : 'Unknown Gemini request failure');
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

function fallbackTrace(error: string): GeminiPlanTrace {
  return {
    status: 'fallback',
    model: 'gemini-fallback',
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
