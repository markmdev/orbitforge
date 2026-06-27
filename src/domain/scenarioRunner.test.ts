import { describe, expect, it } from 'vitest';
import { groundStations, orbitalNodes, policyVersions, scenarios } from '../data/demoState';
import { runPolicyOnScenario } from './scenarioRunner';

describe('scenario runner', () => {
  it('allows weak contact policies to miss blocked high-throughput links', () => {
    const plan = runPolicyOnScenario(scenarios[0], policyVersions[0], orbitalNodes, groundStations);

    expect(plan.groundStationId).toBe('alaska-optical');
    expect(scenarios[0].blockedGroundStationIds).toContain(plan.groundStationId);
    expect(plan.risks).toContain('ground-link-degraded');
  });

  it('routes contact-aware candidates around blocked links', () => {
    const plan = runPolicyOnScenario(scenarios[0], policyVersions[1], orbitalNodes, groundStations);

    expect(plan.groundStationId).not.toBe('alaska-optical');
    expect(scenarios[0].blockedGroundStationIds).not.toContain(plan.groundStationId);
  });
});
