// This service will receive:
// - The new health-check result (UP, DOWN, or DEGRADED).
// - The service's current failure and success counters.
// - Its current unresolved incident, if one exists.

export type CheckStatus = "UP" | "DOWN" | "DEGRADED";

export type IncidentStatus = "OPEN" | "RECOVERING";

export type IncidentAction =
  | "NONE"
  | "CREATE"
  | "START_RECOVERY"
  | "REOPEN"
  | "RESOLVE";

//The input describes the current situation. The result describes the counters and incident action after processing the new check.  

interface IncidentLifecycleInput {
  checkStatus: CheckStatus;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  currentIncidentStatus: IncidentStatus | null;
}

interface IncidentLifecycleResult {
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  incidentAction: IncidentAction;
}


const FAILURE_THRESHOLD = 2;
const RECOVERY_THRESHOLD = 2;

export const evaluateIncidentLifecycle = (
  input: IncidentLifecycleInput,
): IncidentLifecycleResult => {
  let failures = input.consecutiveFailures;
  let successes = input.consecutiveSuccesses;
  let incidentAction: IncidentAction = "NONE";

  if (input.checkStatus === "DOWN") {
    failures += 1;
    successes = 0;

    if (input.currentIncidentStatus === "RECOVERING") {
      incidentAction = "REOPEN";
    } else if (
      input.currentIncidentStatus === null &&
      failures >= FAILURE_THRESHOLD
    ) {
      incidentAction = "CREATE";
    }
  } else if (input.checkStatus === "UP") {
    failures = 0;
    successes += 1;

    if (input.currentIncidentStatus === "OPEN") {
      incidentAction = "START_RECOVERY";
    } else if (
      input.currentIncidentStatus === "RECOVERING" &&
      successes >= RECOVERY_THRESHOLD
    ) {
      incidentAction = "RESOLVE";
    }
  } else {
    failures = 0;
    successes = 0;
  }

  return {
    consecutiveFailures: failures,
    consecutiveSuccesses: successes,
    incidentAction,
  };
};


// Case A: DOWN
// - Increment failure counter.
// - Reset success counter.
// - If already recovering, reopen the same incident.
// - If no incident exists and failures reach two, create one.
// - Otherwise, keep the existing incident unchanged.
// Case B: UP
// - Reset failure counter.
// - Increment success counter.
// - If incident is OPEN, start recovery.
// - If incident is RECOVERING and successes reach two, resolve it.
// Case C: DEGRADED
// - Reset both counters.
// - Don't create, reopen, or resolve an incident.
// - Keep the existing incident status unchanged.