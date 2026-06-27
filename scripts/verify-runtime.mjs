const baseUrl = process.env.ORBITFORGE_BASE_URL ?? 'http://127.0.0.1:5174';
const verifyLiveGemini = process.argv.includes('--live-gemini');

const checks = [];

async function main() {
  await checkAppShell();
  await checkGeminiHealth();

  if (verifyLiveGemini) {
    await checkGeminiEndpoint();
  }

  for (const check of checks) {
    console.log(`${check.status} ${check.name} ${check.detail}`);
  }
}

async function checkAppShell() {
  const response = await request(`${baseUrl}/`);
  const html = await response.text();

  if (!response.ok) {
    fail('app-shell', `expected 2xx from ${baseUrl}/, received ${response.status}`);
  }

  if (!html.includes('OrbitForge Mission Console') || !html.includes('id="root"')) {
    fail('app-shell', 'index.html did not include the expected OrbitForge shell markers');
  }

  checks.push({ status: 'pass', name: 'app-shell', detail: `reachable at ${baseUrl}` });
}

async function checkGeminiHealth() {
  const response = await request(`${baseUrl}/api/gemini/health`);
  const body = await response.json();

  if (!response.ok || body.ok !== true || body.status !== 'configured') {
    fail('gemini-health', body.error ?? `expected configured Gemini middleware, received HTTP ${response.status}`);
  }

  checks.push({
    status: 'pass',
    name: 'gemini-health',
    detail: `${body.model ?? 'gemini-3.5-flash'} configured without live model call`,
  });
}

async function checkGeminiEndpoint() {
  const startedAt = Date.now();
  const response = await request(`${baseUrl}/api/gemini/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      scenario: {
        id: 'runtime-check',
        name: 'Runtime Verification Scenario',
        incident: 'Seeded thermal pressure check',
        workload: 'Runtime health probe',
        rawGb: 12,
        targetGb: 1,
        freshnessMinutes: 20,
      },
      baselinePolicy: {
        id: 'policy-v0',
        name: 'v0 runtime baseline',
      },
      baselineScore: {
        total: 72,
        failures: ['thermal:58', 'contact:61'],
      },
      mutation: {
        summary: 'Raise thermal and contact weighting while preserving seeded-data guardrails.',
      },
    }),
  });
  const body = await response.json();

  if (!response.ok || body.ok !== true || body.status !== 'live') {
    fail('gemini-plan', body.error ?? `expected live Gemini endpoint, received HTTP ${response.status}; retry later if quota/rate-limit is active`);
  }

  if (typeof body.outputText !== 'string' || body.outputText.length < 20) {
    fail('gemini-plan', 'Gemini endpoint responded without a useful model output preview');
  }

  checks.push({
    status: 'pass',
    name: 'gemini-plan',
    detail: `${body.model ?? 'gemini-3.5-flash'} live in ${body.latencyMs ?? Date.now() - startedAt}ms`,
  });
}

async function request(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    fail('runtime', error instanceof Error ? error.message : 'unknown runtime verification failure');
  } finally {
    clearTimeout(timeout);
  }
}

function fail(name, detail) {
  console.error(`fail ${name} ${detail}`);
  process.exit(1);
}

main().catch((error) => {
  fail('runtime', error instanceof Error ? error.message : 'unknown runtime verification failure');
});
