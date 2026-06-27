import type { AgentPlan, EvaluationScore, GroundStation, OrbitalNode, PolicyVersion, PromotionDecision, Scenario } from './types';
import { clampScore, weightedAverage } from './math';

export function evaluatePlan(
  scenario: Scenario,
  policy: PolicyVersion,
  plan: AgentPlan,
  nodes: OrbitalNode[],
  stations: GroundStation[],
): EvaluationScore {
  const node = nodes.find((item) => item.id === plan.nodeId) ?? null;
  const station = stations.find((item) => item.id === plan.groundStationId) ?? null;

  const freshness = clampScore(100 - Math.max(0, plan.expectedFreshnessMinutes - scenario.freshnessMinutes) * 4);
  const power = clampScore((node?.powerMargin ?? 30) + policy.weights.power * 8);
  const thermal = clampScore((node?.thermalMargin ?? 20) - scenario.thermalSensitivity * 0.35 + policy.weights.thermal * 18);
  const contact = clampScore(
    (station?.status === 'nominal' ? 84 : station?.status === 'watch' ? 68 : 38) -
      (station?.nextContactMinutes ?? 30) * 1.2 +
      policy.weights.contact * 12,
  );
  const dataReduction = clampScore(62 + Math.min(28, plan.dataReductionRatio * 2) + policy.weights.dataReduction * 8);
  const risk = clampScore(
    92 -
      plan.risks.length * 11 +
      policy.weights.radiation * 8 +
      policy.weights.thermal * 5 +
      policy.weights.contact * 4,
  );
  const explanation = clampScore(
    52 + plan.constraintsUsed.length * 7 + Math.min(14, plan.rationale.length / 12) + policy.weights.confidence * 7,
  );
  const guardrail = evaluateGuardrail(policy, plan);
  const dimensions = {
    freshness,
    power,
    thermal,
    contact,
    dataReduction,
    risk,
    explanation,
    guardrail,
  };
  const total = clampScore(
    weightedAverage([
      { value: freshness, weight: 1.35 },
      { value: power, weight: 0.8 },
      { value: thermal, weight: scenario.thermalSensitivity / 55 },
      { value: contact, weight: scenario.contactSensitivity / 55 },
      { value: dataReduction, weight: 0.85 },
      { value: risk, weight: 1 },
      { value: explanation, weight: 0.65 },
      { value: guardrail, weight: 1.2 },
    ]),
  );

  return {
    scenarioId: scenario.id,
    policyId: policy.id,
    total,
    dimensions,
    failures: collectFailures(dimensions),
    guardrailPassed: guardrail >= 90,
  };
}

export function decidePromotion(baseline: EvaluationScore, candidate: EvaluationScore): PromotionDecision {
  const delta = candidate.total - baseline.total;
  const guardrailRegression = candidate.dimensions.guardrail < baseline.dimensions.guardrail;
  const promoted = delta > 0 && candidate.guardrailPassed && !guardrailRegression;
  const reasons: string[] = [];

  if (delta > 0) {
    reasons.push(`Candidate improves total score by ${delta} points.`);
  } else {
    reasons.push(`Candidate does not improve total score; delta is ${delta}.`);
  }

  if (!candidate.guardrailPassed) {
    reasons.push('Candidate failed the no-overclaiming guardrail.');
  }

  if (guardrailRegression) {
    reasons.push('Candidate regressed guardrail score.');
  }

  if (promoted) {
    reasons.push('Promotion accepted because deterministic score improved without guardrail regression.');
  }

  return {
    baseline,
    candidate,
    promoted,
    delta,
    reasons,
  };
}

function evaluateGuardrail(policy: PolicyVersion, plan: AgentPlan): number {
  if (policy.guardrails.length === 0) {
    return 25;
  }

  if (plan.risks.includes('missing-overclaim-guardrail')) {
    return 40;
  }

  const hasSeededDataGuardrail = policy.guardrails.some((guardrail) => guardrail.includes('seeded'));
  const hasNoControlGuardrail = policy.guardrails.some((guardrail) => guardrail.includes('no real satellite'));

  return hasSeededDataGuardrail && hasNoControlGuardrail ? 100 : 82;
}

function collectFailures(dimensions: EvaluationScore['dimensions']): string[] {
  return Object.entries(dimensions)
    .filter(([, score]) => score < 70)
    .map(([dimension, score]) => `${dimension}:${score}`);
}
