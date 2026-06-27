import { describe, expect, it } from 'vitest';
import { scenarios } from '../data/demoState';
import { applyIncidentCommand, getIncidentCommands, summarizeIncidentCommands } from './incidentActions';

describe('incident command deck', () => {
  it('starts the wildfire incident below stabilized readiness', () => {
    const summary = summarizeIncidentCommands(scenarios[0], []);

    expect(summary.stabilized).toBe(false);
    expect(summary.readinessScore).toBeLessThan(80);
    expect(summary.remainingRisks).toContain('contact:20');
  });

  it('raises wildfire readiness after applying all scenario commands', () => {
    const scenario = scenarios[0];
    const appliedCommandIds = getIncidentCommands(scenario).reduce(
      (ids, command) => applyIncidentCommand(scenario, ids, command.id),
      [] as string[],
    );
    const summary = summarizeIncidentCommands(scenario, appliedCommandIds);

    expect(summary.appliedCommands).toHaveLength(3);
    expect(summary.stabilized).toBe(true);
    expect(summary.readinessScore).toBeGreaterThanOrEqual(80);
    expect(summary.metrics.thermal).toBeGreaterThan(80);
  });

  it('does not duplicate commands or apply commands from another scenario', () => {
    const wildfire = scenarios[0];
    const radiation = scenarios[1];
    const wildfireCommand = getIncidentCommands(wildfire)[0];
    const radiationCommand = getIncidentCommands(radiation)[0];
    const once = applyIncidentCommand(wildfire, [], wildfireCommand.id);
    const duplicate = applyIncidentCommand(wildfire, once, wildfireCommand.id);
    const wrongScenario = applyIncidentCommand(wildfire, duplicate, radiationCommand.id);

    expect(wrongScenario).toEqual([wildfireCommand.id]);
  });
});
