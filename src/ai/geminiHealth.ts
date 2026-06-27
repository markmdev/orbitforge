export type GeminiHealthTrace = {
  status: 'loading' | 'configured' | 'blocked';
  model: string;
  cacheEntries: number;
  liveCallRequired: boolean;
  error?: string;
};

type Fetcher = typeof fetch;

export async function requestGeminiHealth(fetcher: Fetcher = fetch): Promise<GeminiHealthTrace> {
  try {
    const response = await fetcher('/api/gemini/health');
    const body = await response.json();

    return parseGeminiHealth(body, response.ok);
  } catch (error) {
    return {
      status: 'blocked',
      model: 'gemini-3.5-flash',
      cacheEntries: 0,
      liveCallRequired: false,
      error: error instanceof Error ? error.message : 'Gemini health route unavailable',
    };
  }
}

export function parseGeminiHealth(body: unknown, responseOk: boolean): GeminiHealthTrace {
  if (!body || typeof body !== 'object') {
    return blockedHealth('Malformed Gemini health response');
  }

  const value = body as {
    status?: unknown;
    model?: unknown;
    cacheEntries?: unknown;
    liveCallRequired?: unknown;
    error?: unknown;
  };
  const model = typeof value.model === 'string' ? value.model : 'gemini-3.5-flash';
  const cacheEntries = typeof value.cacheEntries === 'number' ? value.cacheEntries : 0;
  const liveCallRequired = value.liveCallRequired === true;

  if (responseOk && value.status === 'configured') {
    return {
      status: 'configured',
      model,
      cacheEntries,
      liveCallRequired,
    };
  }

  return {
    status: 'blocked',
    model,
    cacheEntries,
    liveCallRequired,
    error: typeof value.error === 'string' ? value.error : 'Gemini runtime health is blocked',
  };
}

function blockedHealth(error: string): GeminiHealthTrace {
  return {
    status: 'blocked',
    model: 'gemini-3.5-flash',
    cacheEntries: 0,
    liveCallRequired: false,
    error,
  };
}
