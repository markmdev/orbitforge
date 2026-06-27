import type { GroundStation, OrbitalNode, PolicyVersion, Scenario, TraceEvent } from '../domain/types';

export const orbitalNodes: OrbitalNode[] = [
  {
    id: 'helios-1',
    name: 'Helios-1',
    orbit: 'Dawn-dusk SSO',
    role: 'Primary orbital edge compute',
    computeScore: 91,
    powerMargin: 74,
    thermalMargin: 42,
    radiationRisk: 'low',
    status: 'watch',
  },
  {
    id: 'kepler-2',
    name: 'Kepler-2',
    orbit: 'Sun-synchronous LEO',
    role: 'Storage and inference support',
    computeScore: 68,
    powerMargin: 61,
    thermalMargin: 77,
    radiationRisk: 'medium',
    status: 'nominal',
  },
  {
    id: 'aster-3',
    name: 'Aster-3',
    orbit: 'Inclined LEO',
    role: 'Experimental accelerator node',
    computeScore: 88,
    powerMargin: 58,
    thermalMargin: 29,
    radiationRisk: 'high',
    status: 'degraded',
  },
];

export const groundStations: GroundStation[] = [
  {
    id: 'alaska-optical',
    name: 'Alaska Optical Ground',
    linkType: 'optical',
    status: 'degraded',
    nextContactMinutes: 11,
    downlinkMbps: 1800,
  },
  {
    id: 'new-mexico-hybrid',
    name: 'New Mexico RF/Optical Hybrid',
    linkType: 'hybrid',
    status: 'nominal',
    nextContactMinutes: 18,
    downlinkMbps: 940,
  },
  {
    id: 'svalbard-relay',
    name: 'Svalbard Relay',
    linkType: 'rf',
    status: 'watch',
    nextContactMinutes: 7,
    downlinkMbps: 620,
  },
];

export const scenarios: Scenario[] = [
  {
    id: 'wildfire-sar',
    name: 'Wildfire SAR Rapid Response',
    incident: 'Thermal pressure plus optical-weather outage',
    workload: 'Synthetic aperture radar inference',
    rawGb: 420,
    targetGb: 26,
    freshnessMinutes: 15,
    primaryRisk: 'Baseline policy favors hot accelerator node and misses optical outage.',
    expectedBehavior: 'Preprocess in orbit only if thermal and contact-window constraints fit.',
  },
  {
    id: 'radiation-spike',
    name: 'Radiation Spike During Inference',
    incident: 'ECC anomaly during accelerator run',
    workload: 'Event validation and confidence repair',
    rawGb: 35,
    targetGb: 2,
    freshnessMinutes: 30,
    primaryRisk: 'Policy may overtrust the accelerator result after anomaly detection.',
    expectedBehavior: 'Move or rerun validation on safer node before declaring confidence.',
  },
  {
    id: 'climate-reprocess',
    name: 'Climate Sensor Reprocessing',
    incident: 'Storage pressure during batch reprocessing',
    workload: 'Multi-pass climate model feature extraction',
    rawGb: 1800,
    targetGb: 220,
    freshnessMinutes: 720,
    primaryRisk: 'Urgency bias can waste orbital compute on a non-urgent batch.',
    expectedBehavior: 'Split preprocessing from Earth-cloud aggregation.',
  },
];

export const policyVersions: PolicyVersion[] = [
  {
    id: 'policy-v0',
    name: 'v0 deadline-first',
    summary: 'Optimizes for freshness and compute availability. Weak on thermal and contact risk.',
    score: 72,
    promotedAt: 'Seed baseline',
  },
  {
    id: 'policy-v1',
    name: 'v1 thermal-aware candidate',
    summary: 'Adds thermal cooldown weighting and optical outage checks before orbital preprocessing.',
    score: 84,
    promotedAt: 'Candidate from improvement loop',
  },
];

export const traceEvents: TraceEvent[] = [
  {
    id: 'trace-scenario',
    label: 'Scenario loaded',
    source: 'deterministic',
    status: 'complete',
    detail: 'Seeded wildfire SAR incident selected with thermal pressure and optical outage.',
  },
  {
    id: 'trace-plan',
    label: 'Gemini operator plan',
    source: 'gemini-fallback',
    status: 'ready',
    detail: 'Live Gemini wiring will attach here; fallback trace is labeled until integration lands.',
  },
  {
    id: 'trace-eval',
    label: 'Deterministic evaluator',
    source: 'deterministic',
    status: 'ready',
    detail: 'Scorecard dimensions are app-owned and will decide promotion.',
  },
  {
    id: 'trace-audit',
    label: 'Computer-use audit',
    source: 'gemini-fallback',
    status: 'blocked',
    detail: 'Awaiting Gemini computer-use API confirmation; UI will surface exact blocker.',
  },
];
