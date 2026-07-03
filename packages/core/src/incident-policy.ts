export type CheckOutcome = 'UP' | 'DOWN' | 'DEGRADED';

export interface IncidentPolicyInput {
  latestOutcome: CheckOutcome;
  recentOutcomesNewestFirst: CheckOutcome[];
  consecutiveFailuresToOpen: number;
  consecutiveSuccessesToResolve: number;
  hasOpenIncident: boolean;
}

export type IncidentDecision =
  | { action: 'open'; reason: string }
  | { action: 'resolve'; reason: string }
  | { action: 'none'; reason: string };

function countPrefix<T>(items: T[], predicate: (item: T) => boolean) {
  let count = 0;
  for (const item of items) {
    if (!predicate(item)) break;
    count += 1;
  }
  return count;
}

export function evaluateIncidentTransition(input: IncidentPolicyInput): IncidentDecision {
  const failures = countPrefix(
    input.recentOutcomesNewestFirst,
    (status) => status === 'DOWN' || status === 'DEGRADED',
  );
  const successes = countPrefix(input.recentOutcomesNewestFirst, (status) => status === 'UP');

  if (!input.hasOpenIncident && failures >= input.consecutiveFailuresToOpen) {
    return {
      action: 'open',
      reason: `${failures} consecutive failing checks reached the incident threshold.`,
    };
  }

  if (input.hasOpenIncident && successes >= input.consecutiveSuccessesToResolve) {
    return {
      action: 'resolve',
      reason: `${successes} consecutive successful checks reached the recovery threshold.`,
    };
  }

  return {
    action: 'none',
    reason: `Latest outcome ${input.latestOutcome} did not cross an incident threshold.`,
  };
}

