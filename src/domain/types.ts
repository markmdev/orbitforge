export type FleetStatus = 'nominal' | 'watch' | 'degraded';

export type RadiationRisk = 'low' | 'medium' | 'high';

export type OrbitalNode = {
  id: string;
  name: string;
  orbit: string;
  role: string;
  computeScore: number;
  powerMargin: number;
  thermalMargin: number;
  radiationRisk: RadiationRisk;
  status: FleetStatus;
};

export type GroundStation = {
  id: string;
  name: string;
  linkType: 'rf' | 'optical' | 'hybrid';
  status: FleetStatus;
  nextContactMinutes: number;
  downlinkMbps: number;
};

export type Scenario = {
  id: string;
  name: string;
  incident: string;
  workload: string;
  rawGb: number;
  targetGb: number;
  freshnessMinutes: number;
  deadlinePressure: number;
  thermalSensitivity: number;
  contactSensitivity: number;
  radiationSensitivity: number;
  confidenceSensitivity: number;
  expectedDataReduction: number;
  blockedGroundStationIds: string[];
  primaryRisk: string;
  expectedBehavior: string;
};

export type PolicyVersion = {
  id: string;
  name: string;
  summary: string;
  weights: PolicyWeights;
  guardrails: string[];
  promotedAt: string;
};

export type PolicyWeights = {
  deadline: number;
  compute: number;
  power: number;
  thermal: number;
  contact: number;
  radiation: number;
  confidence: number;
  dataReduction: number;
};

export type Placement = 'orbital_preprocess' | 'ground_edge' | 'earth_cloud' | 'split' | 'defer' | 'reject';

export type AgentPlan = {
  scenarioId: string;
  policyId: string;
  placement: Placement;
  nodeId: string | null;
  groundStationId: string | null;
  expectedFreshnessMinutes: number;
  dataReductionRatio: number;
  confidence: number;
  rationale: string;
  risks: string[];
  constraintsUsed: string[];
};

export type ScoreDimension =
  | 'freshness'
  | 'power'
  | 'thermal'
  | 'contact'
  | 'dataReduction'
  | 'risk'
  | 'explanation'
  | 'guardrail';

export type EvaluationScore = {
  scenarioId: string;
  policyId: string;
  total: number;
  dimensions: Record<ScoreDimension, number>;
  failures: string[];
  guardrailPassed: boolean;
};

export type PromotionDecision = {
  baseline: EvaluationScore;
  candidate: EvaluationScore;
  promoted: boolean;
  delta: number;
  reasons: string[];
};

export type PolicyMutation = {
  id: string;
  source: 'deterministic' | 'gemini-live' | 'gemini-fallback';
  summary: string;
  targetFailures: string[];
  diff: string[];
  candidatePolicy: PolicyVersion;
  expectedEffect: string;
};

export type ScenarioEvaluationResult = {
  scenarioId: string;
  baselinePlan: AgentPlan;
  candidatePlan: AgentPlan;
  baselineScore: EvaluationScore;
  candidateScore: EvaluationScore;
  decision: PromotionDecision;
};

export type ImprovementCycle = {
  baselinePolicy: PolicyVersion;
  mutation: PolicyMutation;
  scenarioResults: ScenarioEvaluationResult[];
  primaryScenarioId: string;
  averageDelta: number;
  promoted: boolean;
  reasons: string[];
};

export type TraceEvent = {
  id: string;
  label: string;
  source: 'deterministic' | 'gemini-live' | 'gemini-fallback' | 'operator';
  status: 'ready' | 'running' | 'blocked' | 'complete';
  detail: string;
};
