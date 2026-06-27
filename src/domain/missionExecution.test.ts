import { describe, expect, it } from 'vitest';
import { groundStations, orbitalNodes, policyVersions, scenarios } from '../data/demoState';
import { buildMissionExecution } from './missionExecution';

describe('mission execution timeline', () => {
  it('turns the active policy plan into a concrete data-product handoff', () => {
    const execution = buildMissionExecution(scenarios[0], policyVersions[1], orbitalNodes, groundStations, 82);

    expect(execution.nodeName).toBe('Kepler-2');
    expect(execution.stationName).toBe('New Mexico RF/Optical Hybrid');
    expect(execution.dataProductName).toBe('Fireline SAR tiles');
    expect(execution.targetGb).toBe(26);
    expect(execution.freshnessStatus).toBe('met');
    expect(execution.deliveredFreshnessMinutes).toBeLessThanOrEqual(scenarios[0].freshnessMinutes);
    expect(execution.steps.map((step) => step.id)).toEqual(['ingest', 'preprocess', 'contact', 'deliver']);
    expect(execution.steps.map((step) => step.minute)).toEqual([...execution.steps.map((step) => step.minute)].sort((a, b) => a - b));
    expect(execution.manifestStatus).toBe('verified');
    expect(execution.manifest.map((item) => item.sizeGb).reduce((sum, sizeGb) => sum + sizeGb, 0)).toBe(execution.targetGb);
    expect(execution.manifest.map((item) => item.region)).toEqual([
      'North ridge',
      'West flank',
      'Evacuation corridor',
      'Ignition perimeter',
    ]);
    expect(execution.manifest.every((item) => item.validation === 'verified' && item.watermark === 'attached')).toBe(true);
  });

  it('keeps skipped stabilization visible as late execution risk', () => {
    const execution = buildMissionExecution(scenarios[0], policyVersions[1], orbitalNodes, groundStations, 45);

    expect(execution.freshnessStatus).toBe('late');
    expect(execution.readinessBonusMinutes).toBe(0);
    expect(execution.steps[3]?.status).toBe('blocked');
    expect(execution.manifestStatus).toBe('held');
    expect(execution.manifest.every((item) => item.watermark === 'pending')).toBe(true);
  });
});
