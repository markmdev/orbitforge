export type FleetStatus = 'nominal' | 'watch' | 'degraded';

export type OrbitalNode = {
  id: string;
  name: string;
  orbit: string;
  role: string;
  computeScore: number;
  powerMargin: number;
  thermalMargin: number;
  radiationRisk: 'low' | 'medium' | 'high';
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
  primaryRisk: string;
  expectedBehavior: string;
};

export type PolicyVersion = {
  id: string;
  name: string;
  summary: string;
  score: number;
  promotedAt: string;
};

export type TraceEvent = {
  id: string;
  label: string;
  source: 'deterministic' | 'gemini-live' | 'gemini-fallback' | 'operator';
  status: 'ready' | 'running' | 'blocked' | 'complete';
  detail: string;
};
