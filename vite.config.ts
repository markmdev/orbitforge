import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiApiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;

  return {
    plugins: [
      react(),
      {
        name: 'orbitforge-gemini-api',
        configureServer(server) {
          server.middlewares.use('/api/gemini/health', async (req, res) => {
            if (req.method !== 'GET') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, status: 'blocked', error: 'GET required' }));
              return;
            }

            res.statusCode = geminiApiKey ? 200 : 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: Boolean(geminiApiKey),
                status: geminiApiKey ? 'configured' : 'blocked',
                model: 'gemini-3.5-flash',
                liveCallRequired: false,
              }),
            );
          });

          server.middlewares.use('/api/gemini/plan', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, status: 'blocked', error: 'POST required' }));
              return;
            }

            if (!geminiApiKey) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, status: 'blocked', error: 'Missing GEMINI_API_KEY' }));
              return;
            }

            try {
              const body = await readJsonBody(req);
              const startedAt = Date.now();
              const prompt = buildOperatorPrompt(body);
              const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': geminiApiKey,
                },
                body: JSON.stringify({
                  model: 'gemini-3.5-flash',
                  store: false,
                  input: prompt,
                }),
              });
              const responseJson = (await geminiResponse.json()) as any;
              const outputText = extractModelOutputText(responseJson);

              res.statusCode = geminiResponse.ok ? 200 : geminiResponse.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  ok: geminiResponse.ok,
                  status: geminiResponse.ok ? 'live' : 'blocked',
                  model: responseJson.model ?? 'gemini-3.5-flash',
                  interactionStatus: responseJson.status,
                  latencyMs: Date.now() - startedAt,
                  promptPreview: prompt.slice(0, 1200),
                  outputText,
                  usage: responseJson.usage
                    ? {
                        totalTokens: responseJson.usage.total_tokens,
                        outputTokens: responseJson.usage.total_output_tokens,
                      }
                    : null,
                }),
              );
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  ok: false,
                  status: 'blocked',
                  error: error instanceof Error ? error.message : 'Unknown Gemini middleware error',
                }),
              );
            }
          });
        },
      },
    ],
    server: {
      port: 5173,
      strictPort: false,
    },
  };
});

function readJsonBody(req: any): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk: unknown) => {
      body += String(chunk);
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function buildOperatorPrompt(body: Record<string, unknown>): string {
  return `You are OrbitForge's Gemini operator agent inside a seeded orbital-compute demo.

Return only compact JSON with this exact shape:
{
  "placement": "orbital_preprocess | ground_edge | earth_cloud | split | defer | reject",
  "rationale": "one sentence",
  "constraintsUsed": ["freshness", "thermal", "contact"],
  "risks": ["risk label"],
  "confidence": 0-100,
  "recommendedPolicyPatch": "one sentence"
}

Rules:
- Treat all telemetry as seeded simulation data.
- Do not claim real satellite control.
- Use the deterministic score/failures to explain what the policy should improve.
- Prefer small policy changes that can be A/B tested.

Context:
${JSON.stringify(body).slice(0, 6000)}`;
}

function extractModelOutputText(responseJson: any): string {
  const modelOutput = responseJson.steps?.find((step: any) => step.type === 'model_output');
  const textPart = modelOutput?.content?.find((part: any) => typeof part.text === 'string');

  return textPart?.text ?? '';
}
