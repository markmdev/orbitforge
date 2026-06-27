import type { GeminiCritiqueTrace, GeminiPlanTrace } from './geminiPlan';
import type { ImprovementCycle, PolicyVersion, Scenario } from '../domain/types';

export type AuditSnapshotInput = {
  activeView: string;
  scenario: Scenario;
  policy: PolicyVersion;
  improvementCycle: ImprovementCycle;
  planTrace: GeminiPlanTrace;
  critiqueTrace: GeminiCritiqueTrace;
};

export type AuditSnapshot = {
  screenText: string;
  screenshotBase64: string;
  viewport: {
    width: number;
    height: number;
  };
};

export function buildAuditSnapshot(input: AuditSnapshotInput): AuditSnapshot {
  const width = 1200;
  const height = 760;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Browser canvas is unavailable for audit snapshot.');
  }

  const lines = buildScreenText(input);
  drawAuditFrame(context, width, height, lines);

  return {
    screenText: lines.join('\n'),
    screenshotBase64: canvas.toDataURL('image/png').split(',')[1] ?? '',
    viewport: {
      width,
      height,
    },
  };
}

function buildScreenText(input: AuditSnapshotInput): string[] {
  const primaryResult =
    input.improvementCycle.scenarioResults.find((result) => result.scenarioId === input.scenario.id) ??
    input.improvementCycle.scenarioResults[0];

  if (!primaryResult) {
    throw new Error('Cannot build audit snapshot without scenario results.');
  }

  return [
    'OrbitForge audit frame',
    `Active view: ${input.activeView}`,
    `Scenario: ${input.scenario.name}`,
    `Incident: ${input.scenario.incident}`,
    `Policy: ${input.policy.name}`,
    `Baseline score: ${primaryResult.baselineScore.total}`,
    `Candidate score: ${primaryResult.candidateScore.total}`,
    `Active delta: ${primaryResult.decision.delta}`,
    `Average golden-scenario delta: ${input.improvementCycle.averageDelta}`,
    `Promotion gate: ${input.improvementCycle.promoted ? 'accepted' : 'held'}`,
    `Gemini plan status: ${input.planTrace.status}`,
    `Gemini critique status: ${input.critiqueTrace.status}`,
    `Critique recommendation: ${input.critiqueTrace.critique?.promotionRecommendation ?? 'unavailable'}`,
    `Plan fallback/error: ${input.planTrace.error ?? 'none'}`,
    `Critique fallback/error: ${input.critiqueTrace.error ?? 'none'}`,
    'Expected audit: identify the next UI click or inspection a judge/demo QA agent should perform.',
  ];
}

function drawAuditFrame(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  lines: string[],
) {
  context.fillStyle = '#101412';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#17201d';
  context.fillRect(36, 36, width - 72, height - 72);
  context.strokeStyle = '#4cc7a3';
  context.lineWidth = 3;
  context.strokeRect(36, 36, width - 72, height - 72);

  context.fillStyle = '#4cc7a3';
  context.font = '700 30px Inter, system-ui, sans-serif';
  context.fillText('OrbitForge Computer-Use Audit Frame', 70, 92);

  context.fillStyle = '#e8ece7';
  context.font = '600 22px Inter, system-ui, sans-serif';
  context.fillText('Seeded orbital-compute ops console', 70, 128);

  context.font = '17px Inter, system-ui, sans-serif';
  context.fillStyle = '#c7d5cf';
  let y = 178;

  for (const line of lines.slice(1)) {
    y = drawWrappedText(context, line, 70, y, width - 140, 24);
    y += 8;
  }
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = candidate;
    }
  }

  context.fillText(line, x, currentY);

  return currentY + lineHeight;
}
