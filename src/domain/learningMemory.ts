import type { PolicyMutation, PolicyVersion, Scenario } from './types';

export type LearningMemoryEntry = {
  id: string;
  scenarioId: string;
  scenarioName: string;
  mutationId: string;
  candidatePolicyName: string;
  failureSignature: string;
  activeDelta: number;
  averageDelta: number;
  guardrailStatus: 'held' | 'regressed';
  retained: boolean;
  createdAt: string;
};

export type LearningMemoryInput = {
  scenario: Scenario;
  mutation: PolicyMutation;
  candidatePolicy: PolicyVersion;
  failureSignature: string;
  activeDelta: number;
  averageDelta: number;
  guardrailHeld: boolean;
  promoted: boolean;
  createdAt: string;
};

export function buildLearningMemoryEntry(input: LearningMemoryInput): LearningMemoryEntry {
  return {
    id: `${input.scenario.id}:${input.mutation.id}`,
    scenarioId: input.scenario.id,
    scenarioName: input.scenario.name,
    mutationId: input.mutation.id,
    candidatePolicyName: input.candidatePolicy.name,
    failureSignature: input.failureSignature,
    activeDelta: input.activeDelta,
    averageDelta: input.averageDelta,
    guardrailStatus: input.guardrailHeld ? 'held' : 'regressed',
    retained: input.promoted && input.guardrailHeld,
    createdAt: input.createdAt,
  };
}

export function upsertLearningMemory(
  entries: LearningMemoryEntry[],
  nextEntry: LearningMemoryEntry,
  limit = 8,
): LearningMemoryEntry[] {
  return [nextEntry, ...entries.filter((entry) => entry.id !== nextEntry.id)].slice(0, limit);
}
