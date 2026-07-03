import { describe, expect, it } from 'vitest';

import { evaluateIncidentTransition } from '../src/incident-policy.js';

describe('evaluateIncidentTransition', () => {
  it('opens an incident after enough consecutive failures', () => {
    expect(
      evaluateIncidentTransition({
        latestOutcome: 'DOWN',
        recentOutcomesNewestFirst: ['DOWN', 'DOWN', 'UP'],
        consecutiveFailuresToOpen: 2,
        consecutiveSuccessesToResolve: 1,
        hasOpenIncident: false,
      }).action,
    ).toBe('open');
  });

  it('resolves an open incident after enough consecutive successes', () => {
    expect(
      evaluateIncidentTransition({
        latestOutcome: 'UP',
        recentOutcomesNewestFirst: ['UP', 'UP', 'DOWN'],
        consecutiveFailuresToOpen: 2,
        consecutiveSuccessesToResolve: 2,
        hasOpenIncident: true,
      }).action,
    ).toBe('resolve');
  });

  it('keeps state unchanged before thresholds are reached', () => {
    expect(
      evaluateIncidentTransition({
        latestOutcome: 'DOWN',
        recentOutcomesNewestFirst: ['DOWN', 'UP', 'DOWN'],
        consecutiveFailuresToOpen: 2,
        consecutiveSuccessesToResolve: 1,
        hasOpenIncident: false,
      }).action,
    ).toBe('none');
  });
});

