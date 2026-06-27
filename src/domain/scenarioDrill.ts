import { clampScore } from './math';
import type { Scenario } from './types';

export function createStressDrill(baseScenario: Scenario, sequence: number): Scenario {
  const suffix = String(sequence).padStart(2, '0');
  const blockedGroundStationIds = Array.from(
    new Set([...baseScenario.blockedGroundStationIds, sequence % 2 === 0 ? 'alaska-optical' : 'new-mexico-hybrid']),
  );

  return {
    ...baseScenario,
    id: `stress-${baseScenario.id}-${suffix}`,
    name: `Stress Drill ${suffix}: ${baseScenario.name}`,
    incident: `What-if escalation: ${baseScenario.incident} plus compressed contact margin`,
    rawGb: Math.round(baseScenario.rawGb * (1.12 + sequence * 0.03)),
    targetGb: Math.max(1, Math.round(baseScenario.targetGb * 0.9)),
    freshnessMinutes: Math.max(5, baseScenario.freshnessMinutes - Math.min(8, 2 + sequence)),
    deadlinePressure: clampScore(baseScenario.deadlinePressure + 7 + sequence),
    thermalSensitivity: clampScore(baseScenario.thermalSensitivity + 10 + sequence),
    contactSensitivity: clampScore(baseScenario.contactSensitivity + 8 + sequence),
    radiationSensitivity: clampScore(baseScenario.radiationSensitivity + 4),
    confidenceSensitivity: clampScore(baseScenario.confidenceSensitivity + 6),
    expectedDataReduction: Math.max(2, baseScenario.expectedDataReduction + 1),
    blockedGroundStationIds,
    primaryRisk: `Generated drill amplifies ${baseScenario.primaryRisk.toLowerCase()}`,
    expectedBehavior: 'Treat as a seeded stress drill; stabilize with command deck before promoting policy evidence.',
  };
}
