import { describe, expect, it } from 'vitest';
import { groundStations, orbitalNodes, policyVersions, scenarios } from '../data/demoState';
import { runImprovementCycle } from './improvement';

describe('self-improvement loop', () => {
  it('generates a candidate mutation and runs every golden scenario', () => {
    const cycle = runImprovementCycle(scenarios[0], policyVersions[0], scenarios, orbitalNodes, groundStations);

    expect(cycle.mutation.candidatePolicy.id).not.toBe(policyVersions[0].id);
    expect(cycle.mutation.candidatePolicy.id).toContain(scenarios[0].id);
    expect(cycle.scenarioResults).toHaveLength(scenarios.length);
    expect(cycle.mutation.diff.length).toBeGreaterThan(0);
  });

  it('uses scenario-scoped candidate ids so promotion state cannot leak between scenarios', () => {
    const wildfireCycle = runImprovementCycle(scenarios[0], policyVersions[0], scenarios, orbitalNodes, groundStations);
    const radiationCycle = runImprovementCycle(scenarios[1], policyVersions[0], scenarios, orbitalNodes, groundStations);

    expect(wildfireCycle.mutation.candidatePolicy.id).not.toBe(radiationCycle.mutation.candidatePolicy.id);
  });

  it('promotes the generated mutation when primary scenario improves without critical regression', () => {
    const cycle = runImprovementCycle(scenarios[0], policyVersions[0], scenarios, orbitalNodes, groundStations);
    const primary = cycle.scenarioResults.find((result) => result.scenarioId === scenarios[0].id);

    expect(primary?.decision.delta).toBeGreaterThan(0);
    expect(cycle.averageDelta).toBeGreaterThanOrEqual(0);
    expect(cycle.promoted).toBe(true);
  });

  it('preserves seeded-data and no-control guardrails in generated policies', () => {
    const cycle = runImprovementCycle(scenarios[0], policyVersions[0], scenarios, orbitalNodes, groundStations);

    expect(cycle.mutation.candidatePolicy.guardrails).toContain('label seeded telemetry');
    expect(cycle.mutation.candidatePolicy.guardrails).toContain('make no real satellite control claims');
  });
});
