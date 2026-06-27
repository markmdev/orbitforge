export type ComputerAuditAction = {
  name: string;
  intent: string;
  x?: number;
  y?: number;
  safetyDecision?: string;
};

export type GeminiComputerAuditTrace = {
  status: 'idle' | 'loading' | 'live' | 'fallback' | 'blocked';
  model: string;
  latencyMs?: number;
  promptPreview?: string;
  outputText?: string;
  cacheHit?: boolean;
  executionMode?: string;
  promptInjectionDetection?: boolean;
  actions: ComputerAuditAction[];
  error?: string;
};

export type GeminiComputerAuditRequest = {
  task: string;
  screenText: string;
  screenshotBase64: string;
  viewport: {
    width: number;
    height: number;
  };
};

export async function requestGeminiComputerAudit(
  request: GeminiComputerAuditRequest,
): Promise<GeminiComputerAuditTrace> {
  try {
    const response = await fetch('/api/gemini/computer-audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    const body = await response.json();

    if (!response.ok || !body.ok) {
      return fallbackComputerAuditTrace(body.error ?? `Gemini computer-use audit failed with ${response.status}`, body);
    }

    return {
      status: 'live',
      model: body.model ?? 'gemini-3.5-flash',
      latencyMs: body.latencyMs,
      promptPreview: body.promptPreview,
      outputText: body.outputText,
      cacheHit: body.cacheHit,
      executionMode: typeof body.executionMode === 'string' ? body.executionMode : undefined,
      promptInjectionDetection: body.promptInjectionDetection === true ? true : undefined,
      actions: normalizeAuditActions(body.actions),
    };
  } catch (error) {
    return fallbackComputerAuditTrace(
      error instanceof Error ? error.message : 'Unknown Gemini computer-use audit failure',
    );
  }
}

export function normalizeAuditActions(value: unknown): ComputerAuditAction[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === 'object' && item !== null)
    .map((item) => {
      const action = item as Record<string, unknown>;

      return {
        name: typeof action.name === 'string' ? action.name : 'unknown',
        intent: typeof action.intent === 'string' ? action.intent : 'No intent provided.',
        x: typeof action.x === 'number' ? action.x : undefined,
        y: typeof action.y === 'number' ? action.y : undefined,
        safetyDecision: typeof action.safetyDecision === 'string' ? action.safetyDecision : undefined,
      };
    });
}

function fallbackComputerAuditTrace(
  error: string,
  partial?: Partial<GeminiComputerAuditTrace>,
): GeminiComputerAuditTrace {
  return {
    status: 'fallback',
    model: partial?.model ?? 'gemini-fallback',
    latencyMs: partial?.latencyMs,
    promptPreview: partial?.promptPreview,
    outputText: partial?.outputText,
    cacheHit: partial?.cacheHit,
    executionMode: partial?.executionMode,
    promptInjectionDetection: partial?.promptInjectionDetection,
    error,
    actions: normalizeAuditActions(partial?.actions).length > 0
      ? normalizeAuditActions(partial?.actions)
      : [
          {
            name: 'blocked',
            intent: 'Computer-use audit is unavailable, so OrbitForge falls back to manual browser QA proof.',
            safetyDecision: 'blocked',
          },
        ],
  };
}
