import { describe, expect, it } from 'vitest';
import { groundStations, orbitalNodes, policyVersions, scenarios } from '../data/demoState';
import { decidePromotion, evaluatePlan } from './evaluator';
import { runPolicyOnScenario } from './scenarioRunner';

describe('deterministic evaluator', () => {
  it('returns the same score for the same scenario and policy', () => {
    const scenario = scenarios[0];
    const policy = policyVersions[0];
    const firstPlan = runPolicyOnScenario(scenario, policy, orbitalNodes, groundStations);
    const secondPlan = runPolicyOnScenario(scenario, policy, orbitalNodes, groundStations);

    expect(firstPlan).toEqual(secondPlan);
    expect(evaluatePlan(scenario, policy, firstPlan, orbitalNodes, groundStations)).toEqual(
      evaluatePlan(scenario, policy, secondPlan, orbitalNodes, groundStations),
    );
  });

  it('promotes the thermal-aware candidate on the wildfire scenario', () => {
    const scenario = scenarios[0];
    const baseline = policyVersions[0];
    const candidate = policyVersions[1];
    const baselineScore = evaluatePlan(
      scenario,
      baseline,
      runPolicyOnScenario(scenario, baseline, orbitalNodes, groundStations),
      orbitalNodes,
      groundStations,
    );
    const candidateScore = evaluatePlan(
      scenario,
      candidate,
      runPolicyOnScenario(scenario, candidate, orbitalNodes, groundStations),
      orbitalNodes,
      groundStations,
    );
    const decision = decidePromotion(baselineScore, candidateScore);

    expect(decision.promoted).toBe(true);
    expect(decision.delta).toBeGreaterThan(0);
    expect(candidateScore.dimensions.thermal).toBeGreaterThan(baselineScore.dimensions.thermal);
  });

  it('rejects policies that lack seeded-data and no-control guardrails', () => {
    const scenario = scenarios[0];
    const unsafePolicy = {
      ...policyVersions[1],
      id: 'unsafe-policy',
      guardrails: [],
    };
    const baselineScore = evaluatePlan(
      scenario,
      policyVersions[0],
      runPolicyOnScenario(scenario, policyVersions[0], orbitalNodes, groundStations),
      orbitalNodes,
      groundStations,
    );
    const score = evaluatePlan(
      scenario,
      unsafePolicy,
      runPolicyOnScenario(scenario, unsafePolicy, orbitalNodes, groundStations),
      orbitalNodes,
      groundStations,
    );
    const decision = decidePromotion(baselineScore, score);

    expect(score.guardrailPassed).toBe(false);
    expect(score.dimensions.guardrail).toBeLessThan(90);
    expect(decision.promoted).toBe(false);
    expect(decision.reasons).toContain('Candidate failed the no-overclaiming guardrail.');
  });
});
