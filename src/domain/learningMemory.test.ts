import { describe, expect, it } from 'vitest';
import { scenarios, policyVersions } from '../data/demoState';
import { createPolicyMutation } from './improvement';
import { buildLearningMemoryEntry, upsertLearningMemory } from './learningMemory';

describe('learning memory', () => {
  it('builds a retained memory entry from an accepted improvement pass', () => {
    const mutation = createPolicyMutation(scenarios[0], policyVersions[0], {
      scenarioId: scenarios[0].id,
      policyId: policyVersions[0].id,
      total: 70,
      dimensions: {
        freshness: 66,
        power: 85,
        thermal: 21,
        contact: 27,
        dataReduction: 88,
        risk: 62,
        explanation: 92,
        guardrail: 100,
      },
      failures: ['thermal:21', 'contact:27'],
      guardrailPassed: true,
    });

    const entry = buildLearningMemoryEntry({
      scenario: scenarios[0],
      mutation,
      candidatePolicy: mutation.candidatePolicy,
      failureSignature: 'thermal:21, contact:27',
      activeDelta: 15,
      averageDelta: 11,
      guardrailHeld: true,
      promoted: true,
      createdAt: '2026-06-27T22:54:00.000Z',
    });

    expect(entry).toMatchObject({
      id: 'wildfire-sar:mutation-wildfire-sar-thermal-contact',
      scenarioName: 'Wildfire SAR Rapid Response',
      candidatePolicyName: 'v1 generated thermal-contact candidate',
      failureSignature: 'thermal:21, contact:27',
      activeDelta: 15,
      averageDelta: 11,
      guardrailStatus: 'held',
      retained: true,
    });
  });

  it('upserts by scenario and mutation while keeping newest first', () => {
    const first = {
      id: 'a:one',
      scenarioId: 'a',
      scenarioName: 'A',
      mutationId: 'one',
      candidatePolicyName: 'Policy A',
      failureSignature: 'thermal:21',
      activeDelta: 5,
      averageDelta: 4,
      guardrailStatus: 'held' as const,
      retained: true,
      createdAt: '2026-06-27T22:54:00.000Z',
    };
    const updated = { ...first, averageDelta: 8, createdAt: '2026-06-27T22:55:00.000Z' };
    const other = { ...first, id: 'b:two', scenarioId: 'b', mutationId: 'two', scenarioName: 'B' };

    expect(upsertLearningMemory([first, other], updated)).toEqual([updated, other]);
    expect(upsertLearningMemory([first, other], updated, 1)).toEqual([updated]);
  });
});
