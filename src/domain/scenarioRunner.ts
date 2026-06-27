import type { AgentPlan, GroundStation, OrbitalNode, PolicyVersion, RadiationRisk, Scenario } from './types';
import { clampScore } from './math';

const radiationPenalty: Record<RadiationRisk, number> = {
  low: 4,
  medium: 16,
  high: 34,
};

export function runPolicyOnScenario(
  scenario: Scenario,
  policy: PolicyVersion,
  nodes: OrbitalNode[],
  stations: GroundStation[],
): AgentPlan {
  const node = chooseNode(scenario, policy, nodes);
  const station = chooseGroundStation(scenario, policy, stations);
  const reductionRatio = scenario.rawGb / scenario.targetGb;
  const contactDelay = station ? station.nextContactMinutes : scenario.freshnessMinutes * 2;
  const thermalDrag = node ? Math.max(0, scenario.thermalSensitivity - node.thermalMargin) * 0.12 : 18;
  const radiationDrag = node ? radiationPenalty[node.radiationRisk] * (scenario.radiationSensitivity / 100) : 20;
  const expectedFreshnessMinutes = Math.round(
    Math.max(4, contactDelay + scenario.rawGb / 180 + thermalDrag + radiationDrag - policy.weights.deadline * 4),
  );
  const confidence = clampScore(
    58 +
      policy.weights.confidence * 16 +
      policy.weights.thermal * (node ? node.thermalMargin / 12 : 0) +
      policy.weights.contact * (station && station.status === 'nominal' ? 8 : -6) -
      scenario.confidenceSensitivity / 5,
  );
  const placement = choosePlacement(scenario, policy, expectedFreshnessMinutes, reductionRatio);
  const risks = collectRisks(scenario, policy, node, station, expectedFreshnessMinutes);

  return {
    scenarioId: scenario.id,
    policyId: policy.id,
    placement,
    nodeId: node?.id ?? null,
    groundStationId: station?.id ?? null,
    expectedFreshnessMinutes,
    dataReductionRatio: Number(reductionRatio.toFixed(1)),
    confidence,
    rationale: buildRationale(scenario, policy, node, station, placement),
    risks,
    constraintsUsed: [
      'freshness',
      policy.weights.thermal >= 1 ? 'thermal-margin' : 'compute-availability',
      policy.weights.contact >= 1 ? 'contact-window' : 'downlink-throughput',
      policy.weights.radiation >= 1 ? 'radiation-risk' : 'baseline-risk',
    ],
  };
}

function chooseNode(scenario: Scenario, policy: PolicyVersion, nodes: OrbitalNode[]): OrbitalNode {
  return [...nodes].sort((a, b) => scoreNode(b, scenario, policy) - scoreNode(a, scenario, policy))[0];
}

function scoreNode(node: OrbitalNode, scenario: Scenario, policy: PolicyVersion): number {
  return (
    node.computeScore * policy.weights.compute +
    node.powerMargin * policy.weights.power +
    node.thermalMargin * policy.weights.thermal -
    radiationPenalty[node.radiationRisk] * policy.weights.radiation * (scenario.radiationSensitivity / 70) -
    Math.max(0, scenario.thermalSensitivity - node.thermalMargin) * policy.weights.thermal
  );
}

function chooseGroundStation(
  scenario: Scenario,
  policy: PolicyVersion,
  stations: GroundStation[],
): GroundStation | null {
  const available = stations.filter((station) => !scenario.blockedGroundStationIds.includes(station.id));
  const candidates = available.length > 0 ? available : stations;

  return [...candidates].sort((a, b) => scoreStation(b, policy) - scoreStation(a, policy))[0] ?? null;
}

function scoreStation(station: GroundStation, policy: PolicyVersion): number {
  const statusPenalty = station.status === 'nominal' ? 0 : station.status === 'watch' ? 14 : 40;

  return station.downlinkMbps / 18 - station.nextContactMinutes * policy.weights.contact - statusPenalty * policy.weights.contact;
}

function choosePlacement(
  scenario: Scenario,
  policy: PolicyVersion,
  expectedFreshnessMinutes: number,
  reductionRatio: number,
): AgentPlan['placement'] {
  if (expectedFreshnessMinutes > scenario.freshnessMinutes * 2.4) {
    return 'defer';
  }

  if (scenario.deadlinePressure > 80 && reductionRatio > 8) {
    return policy.weights.thermal >= 1 || policy.weights.contact >= 1 ? 'split' : 'orbital_preprocess';
  }

  if (scenario.deadlinePressure < 35) {
    return 'earth_cloud';
  }

  return 'ground_edge';
}

function collectRisks(
  scenario: Scenario,
  policy: PolicyVersion,
  node: OrbitalNode | undefined,
  station: GroundStation | null,
  expectedFreshnessMinutes: number,
): string[] {
  const risks: string[] = [];

  if (node && node.thermalMargin < scenario.thermalSensitivity) {
    risks.push('thermal-margin-shortfall');
  }

  if (station && station.status === 'degraded') {
    risks.push('ground-link-degraded');
  }

  if (node && node.radiationRisk === 'high' && scenario.radiationSensitivity > 50) {
    risks.push('radiation-validation-needed');
  }

  if (expectedFreshnessMinutes > scenario.freshnessMinutes) {
    risks.push('freshness-target-at-risk');
  }

  if (policy.guardrails.length === 0) {
    risks.push('missing-overclaim-guardrail');
  }

  return risks;
}

function buildRationale(
  scenario: Scenario,
  policy: PolicyVersion,
  node: OrbitalNode | undefined,
  station: GroundStation | null,
  placement: AgentPlan['placement'],
): string {
  const nodeName = node?.name ?? 'no orbital node';
  const stationName = station?.name ?? 'no ground station';

  return `${policy.name} selects ${placement.replace('_', ' ')} for ${scenario.workload}, using ${nodeName} and ${stationName} under ${scenario.freshnessMinutes} minute freshness pressure.`;
}
