import {
  createDecisionExecutionPlan,
  type DecisionExecutionPlan,
  type DecisionExecutionPolicy,
} from "@/domain/decision/decision-execution-gate";
import {
  createCommercialDecisionEvents,
  type CommercialDecisionEvent,
} from "@/domain/events/commercial-decision-events";
import {
  analyzeGuardedReplenishment,
  type GuardedReplenishmentInput,
  type GuardedReplenishmentResult,
} from "@/domain/procurement/guarded-replenishment-engine";

export interface AutomatedReplenishmentInput
  extends GuardedReplenishmentInput {
  readonly executionPolicy?: DecisionExecutionPolicy;
}

export interface AutomatedReplenishmentResult {
  readonly id: string;
  readonly analysis: GuardedReplenishmentResult;
  readonly executionPlan: DecisionExecutionPlan;
  readonly events: readonly CommercialDecisionEvent[];
}

export function analyzeAutomatedReplenishment(
  input: AutomatedReplenishmentInput,
): AutomatedReplenishmentResult {
  const analysis = analyzeGuardedReplenishment(input);
  const executionPlan = createDecisionExecutionPlan({
    resolution: analysis.decisionResolution,
    policy: input.executionPolicy,
    generatedAt: input.analysisAt,
  });
  const events = createCommercialDecisionEvents({
    resolution: analysis.decisionResolution,
    executionPlan,
    occurredAt: input.analysisAt,
  });

  return Object.freeze({
    id: input.id,
    analysis,
    executionPlan,
    events,
  });
}
