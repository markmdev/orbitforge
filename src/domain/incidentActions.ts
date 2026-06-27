import { clampScore, weightedAverage } from './math';
import type { Scenario } from './types';

export type IncidentMetric = 'freshness' | 'thermal' | 'contact' | 'confidence';

export type IncidentCommand = {
  id: string;
  label: string;
  detail: string;
  impactLabel: string;
  impact: Partial<Record<IncidentMetric, number>>;
};

export type IncidentCommandSummary = {
  readinessScore: number;
  readinessLabel: 'active' | 'watch' | 'stabilized';
  metrics: Record<IncidentMetric, number>;
  appliedCommands: IncidentCommand[];
  remainingRisks: string[];
  stabilized: boolean;
};

const scenarioCommandDecks: Record<string, IncidentCommand[]> = {
  'wildfire-sar': [
    {
      id: 'reroute-svalbard-relay',
      label: 'Reroute to Svalbard relay',
      detail: 'Bypass degraded Alaska optical contact and reserve RF relay capacity for SAR tiles.',
      impactLabel: 'contact +55, freshness +8',
      impact: { contact: 55, freshness: 8 },
    },
    {
      id: 'split-kepler-cooldown',
      label: 'Split preprocessing to Kepler-2',
      detail: 'Move hot SAR stages off the degraded accelerator and keep only critical inference in orbit.',
      impactLabel: 'thermal +45, freshness +6',
      impact: { thermal: 45, freshness: 6 },
    },
    {
      id: 'confidence-watermark',
      label: 'Attach confidence watermark',
      detail: 'Gate judge/export output with seeded-data limits and confidence bands for affected tiles.',
      impactLabel: 'confidence +25',
      impact: { confidence: 25 },
    },
  ],
  'radiation-spike': [
    {
      id: 'rerun-kepler-validation',
      label: 'Rerun validation on Kepler-2',
      detail: 'Recompute anomaly-sensitive features away from the high-radiation accelerator.',
      impactLabel: 'confidence +34, thermal +8',
      impact: { confidence: 34, thermal: 8 },
    },
    {
      id: 'clamp-accelerator-duty',
      label: 'Clamp accelerator duty cycle',
      detail: 'Reduce accelerator duty while the ECC anomaly window is active.',
      impactLabel: 'thermal +16, confidence +8',
      impact: { thermal: 16, confidence: 8 },
    },
    {
      id: 'hold-validation-contact',
      label: 'Hold validation contact',
      detail: 'Reserve the next hybrid contact for confidence repair telemetry.',
      impactLabel: 'contact +18, freshness +5',
      impact: { contact: 18, freshness: 5 },
    },
  ],
  'climate-reprocess': [
    {
      id: 'defer-earth-aggregation',
      label: 'Defer Earth-cloud aggregation',
      detail: 'Keep slow aggregation on Earth and preserve orbital compute for the preprocessing pass.',
      impactLabel: 'thermal +24, freshness +8',
      impact: { thermal: 24, freshness: 8 },
    },
    {
      id: 'compress-storage-queue',
      label: 'Compress storage queue',
      detail: 'Apply a lossy-safe feature cache so the batch does not crowd hot orbital storage.',
      impactLabel: 'contact +22, confidence +6',
      impact: { contact: 22, confidence: 6 },
    },
    {
      id: 'schedule-cool-pass',
      label: 'Schedule cool-orbit pass',
      detail: 'Move the next reprocessing chunk to a lower thermal-load window.',
      impactLabel: 'thermal +18',
      impact: { thermal: 18 },
    },
  ],
};

export function getIncidentCommands(scenario: Scenario): IncidentCommand[] {
  return scenarioCommandDecks[scenario.id] ?? [];
}

export function applyIncidentCommand(scenario: Scenario, appliedCommandIds: string[], commandId: string): string[] {
  const commandExists = getIncidentCommands(scenario).some((command) => command.id === commandId);

  if (!commandExists || appliedCommandIds.includes(commandId)) {
    return appliedCommandIds;
  }

  return [...appliedCommandIds, commandId];
}

export function summarizeIncidentCommands(scenario: Scenario, appliedCommandIds: string[]): IncidentCommandSummary {
  const commands = getIncidentCommands(scenario);
  const appliedCommands = commands.filter((command) => appliedCommandIds.includes(command.id));
  const metrics: Record<IncidentMetric, number> = {
    freshness: clampScore(100 - Math.max(0, scenario.deadlinePressure - 35) * 0.55),
    thermal: clampScore(100 - scenario.thermalSensitivity * 0.85),
    contact: clampScore(100 - scenario.contactSensitivity * 0.8 - scenario.blockedGroundStationIds.length * 14),
    confidence: clampScore(100 - scenario.confidenceSensitivity * 0.65),
  };

  for (const command of appliedCommands) {
    for (const [metric, delta] of Object.entries(command.impact)) {
      metrics[metric as IncidentMetric] = clampScore(metrics[metric as IncidentMetric] + (delta ?? 0));
    }
  }

  const readinessScore = clampScore(
    weightedAverage([
      { value: metrics.freshness, weight: 1.1 },
      { value: metrics.thermal, weight: scenario.thermalSensitivity / 60 },
      { value: metrics.contact, weight: scenario.contactSensitivity / 60 },
      { value: metrics.confidence, weight: scenario.confidenceSensitivity / 70 },
    ]),
  );
  const readinessLabel = readinessScore >= 80 ? 'stabilized' : readinessScore >= 64 ? 'watch' : 'active';
  const remainingRisks = Object.entries(metrics)
    .filter(([, score]) => score < 70)
    .map(([metric, score]) => `${metric}:${score}`);

  return {
    readinessScore,
    readinessLabel,
    metrics,
    appliedCommands,
    remainingRisks,
    stabilized: readinessLabel === 'stabilized',
  };
}
