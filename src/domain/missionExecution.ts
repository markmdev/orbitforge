import { runPolicyOnScenario } from './scenarioRunner';
import type { AgentPlan, GroundStation, OrbitalNode, PolicyVersion, Scenario } from './types';

export type MissionExecutionStep = {
  id: string;
  label: string;
  detail: string;
  minute: number;
  status: 'complete' | 'blocked';
};

export type MissionExecution = {
  scenarioId: string;
  policyId: string;
  placement: AgentPlan['placement'];
  nodeName: string;
  stationName: string;
  dataProductName: string;
  rawGb: number;
  targetGb: number;
  reductionRatio: number;
  plannedFreshnessMinutes: number;
  deliveredFreshnessMinutes: number;
  freshnessStatus: 'met' | 'late';
  readinessBonusMinutes: number;
  risks: string[];
  steps: MissionExecutionStep[];
};

export function buildMissionExecution(
  scenario: Scenario,
  policy: PolicyVersion,
  nodes: OrbitalNode[],
  stations: GroundStation[],
  readinessScore = 0,
): MissionExecution {
  const plan = runPolicyOnScenario(scenario, policy, nodes, stations);
  const node = nodes.find((item) => item.id === plan.nodeId);
  const station = stations.find((item) => item.id === plan.groundStationId);
  const readinessBonusMinutes = getReadinessBonusMinutes(readinessScore);
  const deliveredFreshnessMinutes = Math.max(4, plan.expectedFreshnessMinutes - readinessBonusMinutes);
  const freshnessStatus = deliveredFreshnessMinutes <= scenario.freshnessMinutes ? 'met' : 'late';
  const dataProductName = buildDataProductName(scenario);
  const latestContactMinute = Math.max(2, deliveredFreshnessMinutes - 2);
  const stationMinute = Math.max(
    2,
    Math.min(latestContactMinute, (station?.nextContactMinutes ?? deliveredFreshnessMinutes) - Math.round(readinessBonusMinutes / 2)),
  );
  const preprocessMinute = Math.max(1, Math.min(stationMinute - 1, Math.round(scenario.rawGb / 180)));

  return {
    scenarioId: scenario.id,
    policyId: policy.id,
    placement: plan.placement,
    nodeName: node?.name ?? 'No orbital node selected',
    stationName: station?.name ?? 'No ground station selected',
    dataProductName,
    rawGb: scenario.rawGb,
    targetGb: scenario.targetGb,
    reductionRatio: plan.dataReductionRatio,
    plannedFreshnessMinutes: plan.expectedFreshnessMinutes,
    deliveredFreshnessMinutes,
    freshnessStatus,
    readinessBonusMinutes,
    risks: plan.risks,
    steps: [
      {
        id: 'ingest',
        label: 'Ingest orbital workload',
        detail: `${scenario.rawGb} GB ${scenario.workload} staged from seeded orbital buffers.`,
        minute: 0,
        status: 'complete',
      },
      {
        id: 'preprocess',
        label: `Run ${formatPlacement(plan.placement)}`,
        detail: `${node?.name ?? 'Selected node'} reduces data ${plan.dataReductionRatio}:1 toward ${scenario.targetGb} GB output.`,
        minute: preprocessMinute,
        status: 'complete',
      },
      {
        id: 'contact',
        label: 'Reserve downlink contact',
        detail: `${station?.name ?? 'Selected ground path'} carries the reduced product while preserving seeded-data limits.`,
        minute: stationMinute,
        status: 'complete',
      },
      {
        id: 'deliver',
        label: freshnessStatus === 'met' ? 'Deliver data product' : 'Hold late product',
        detail:
          freshnessStatus === 'met'
            ? `${dataProductName} ready at T+${deliveredFreshnessMinutes}m, inside the ${scenario.freshnessMinutes}m target.`
            : `${dataProductName} would arrive at T+${deliveredFreshnessMinutes}m, missing the ${scenario.freshnessMinutes}m target.`,
        minute: deliveredFreshnessMinutes,
        status: freshnessStatus === 'met' ? 'complete' : 'blocked',
      },
    ],
  };
}

function getReadinessBonusMinutes(readinessScore: number): number {
  if (readinessScore >= 80) {
    return 7;
  }

  if (readinessScore >= 64) {
    return 3;
  }

  return 0;
}

function buildDataProductName(scenario: Scenario): string {
  if (scenario.id.includes('wildfire')) {
    return 'Fireline SAR tiles';
  }

  if (scenario.id.includes('radiation')) {
    return 'Confidence repair bundle';
  }

  if (scenario.id.includes('climate')) {
    return 'Climate feature cache';
  }

  return `${scenario.workload} product`;
}

function formatPlacement(placement: AgentPlan['placement']): string {
  return placement.replace('_', ' ');
}
