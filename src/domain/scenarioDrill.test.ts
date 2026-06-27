import { describe, expect, it } from 'vitest';
import { scenarios } from '../data/demoState';
import { applyIncidentCommand, getIncidentCommands, summarizeIncidentCommands } from './incidentActions';
import { createStressDrill } from './scenarioDrill';

describe('stress drill generator', () => {
  it('creates a harder deterministic drill from the active scenario', () => {
    const drill = createStressDrill(scenarios[0], 1);

    expect(drill.id).toBe('stress-wildfire-sar-01');
    expect(drill.name).toBe('Stress Drill 01: Wildfire SAR Rapid Response');
    expect(drill.rawGb).toBeGreaterThan(scenarios[0].rawGb);
    expect(drill.freshnessMinutes).toBeLessThan(scenarios[0].freshnessMinutes);
    expect(drill.blockedGroundStationIds).toContain('new-mexico-hybrid');
  });

  it('gives generated drills a generic command deck that can stabilize readiness', () => {
    const drill = createStressDrill(scenarios[0], 1);
    const commandIds = getIncidentCommands(drill).reduce(
      (ids, command) => applyIncidentCommand(drill, ids, command.id),
      [] as string[],
    );
    const summary = summarizeIncidentCommands(drill, commandIds);

    expect(commandIds).toHaveLength(3);
    expect(summary.stabilized).toBe(true);
    expect(summary.readinessScore).toBeGreaterThanOrEqual(80);
  });
});
