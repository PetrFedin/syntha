import {
  clampConfidence,
  type CommercialDecision,
  type DecisionActionType,
  type DecisionSeverity,
  type RecommendedAction,
} from "./decision";

export type DecisionResolutionStatus =
  | "clear"
  | "requires_review"
  | "blocked";

export interface DecisionConflict {
  readonly leftAction: DecisionActionType;
  readonly rightAction: DecisionActionType;
  readonly decisionIds: readonly string[];
  readonly message: string;
  readonly severity: DecisionSeverity;
}

export interface UnifiedDecisionResult {
  readonly contextId: string;
  readonly status: DecisionResolutionStatus;
  readonly maxSeverity: DecisionSeverity;
  readonly confidence: number;
  readonly orderedDecisions: readonly CommercialDecision[];
  readonly actions: readonly RecommendedAction[];
  readonly suppressedActions: readonly RecommendedAction[];
  readonly conflicts: readonly DecisionConflict[];
  readonly resolutionDecision: CommercialDecision;
}

const severityRank: Record<DecisionSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const conflictRules: ReadonlyArray<{
  left: DecisionActionType;
  right: DecisionActionType;
  message: string;
}> = [
  {
    left: "stop_replenishment",
    right: "create_replenishment",
    message:
      "Inventory policy recommends stopping replenishment while another decision recommends replenishment.",
  },
  {
    left: "stop_replenishment",
    right: "create_purchase_order",
    message:
      "Inventory policy recommends stopping replenishment while procurement recommends a purchase order.",
  },
  {
    left: "liquidate",
    right: "create_replenishment",
    message:
      "The SKU cannot be liquidated and replenished automatically at the same time.",
  },
  {
    left: "liquidate",
    right: "create_purchase_order",
    message:
      "The SKU cannot be liquidated while a new purchase order is being created.",
  },
  {
    left: "defer_purchase",
    right: "create_purchase_order",
    message:
      "One policy defers the purchase while another decision recommends immediate order creation.",
  },
];

function maxSeverity(values: readonly DecisionSeverity[]): DecisionSeverity {
  return values.reduce<DecisionSeverity>(
    (highest, current) =>
      severityRank[current] > severityRank[highest] ? current : highest,
    "info",
  );
}

function actionKey(action: RecommendedAction): string {
  return JSON.stringify([
    action.type,
    action.title,
    action.quantity ?? null,
    action.dueAt ?? null,
    action.metadata ?? null,
  ]);
}

function deduplicateActions(
  decisions: readonly CommercialDecision[],
): RecommendedAction[] {
  const seen = new Set<string>();
  const actions: RecommendedAction[] = [];

  for (const decision of decisions) {
    for (const action of decision.actions) {
      const key = actionKey(action);
      if (seen.has(key)) continue;
      seen.add(key);
      actions.push(action);
    }
  }

  return actions;
}

function findConflicts(
  decisions: readonly CommercialDecision[],
): DecisionConflict[] {
  const owners = new Map<DecisionActionType, Set<string>>();
  for (const decision of decisions) {
    for (const action of decision.actions) {
      const current = owners.get(action.type) ?? new Set<string>();
      current.add(decision.id);
      owners.set(action.type, current);
    }
  }

  return conflictRules.flatMap((rule) => {
    const leftOwners = owners.get(rule.left);
    const rightOwners = owners.get(rule.right);
    if (!leftOwners || !rightOwners) return [];

    return [
      {
        leftAction: rule.left,
        rightAction: rule.right,
        decisionIds: Object.freeze([
          ...new Set([...leftOwners, ...rightOwners]),
        ]),
        message: rule.message,
        severity: "critical" as const,
      },
    ];
  });
}

function weightedConfidence(decisions: readonly CommercialDecision[]): number {
  let weightedTotal = 0;
  let totalWeight = 0;

  for (const decision of decisions) {
    const weight = severityRank[decision.severity] + 1;
    weightedTotal += clampConfidence(decision.confidence) * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? 0 : weightedTotal / totalWeight;
}

export function resolveCommercialDecisions(input: {
  contextId: string;
  decisions: readonly CommercialDecision[];
  generatedAt?: string;
}): UnifiedDecisionResult {
  if (!input.contextId.trim()) {
    throw new Error("Decision context id is required.");
  }
  if (input.decisions.length === 0) {
    throw new Error("At least one commercial decision is required.");
  }

  const orderedDecisions = [...input.decisions].sort(
    (left, right) =>
      severityRank[right.severity] - severityRank[left.severity] ||
      right.confidence - left.confidence ||
      left.createdAt.localeCompare(right.createdAt) ||
      left.id.localeCompare(right.id),
  );
  const candidateActions = deduplicateActions(orderedDecisions);
  const conflicts = findConflicts(orderedDecisions);
  const conflictingTypes = new Set<DecisionActionType>(
    conflicts.flatMap((conflict) => [
      conflict.leftAction,
      conflict.rightAction,
    ]),
  );
  const suppressedActions = candidateActions.filter((action) =>
    conflictingTypes.has(action.type),
  );
  const actions = candidateActions.filter(
    (action) => !conflictingTypes.has(action.type),
  );

  const hasCriticalBlocker = candidateActions.some(
    (action) =>
      (action.type === "supplier_review" ||
        action.type === "budget_review") &&
      action.priority === "critical",
  );
  const hasManualReview = candidateActions.some(
    (action) =>
      (action.type === "review" || action.type === "supplier_review" ||
        action.type === "budget_review") &&
      severityRank[action.priority] >= severityRank.high,
  );

  let status: DecisionResolutionStatus = "clear";
  if (hasCriticalBlocker) status = "blocked";
  else if (conflicts.length > 0 || hasManualReview) status = "requires_review";

  if (conflicts.length > 0) {
    actions.unshift({
      type: "review",
      priority: "critical",
      title: "Resolve conflicting commercial decisions",
      description:
        "Conflicting automatic actions were suppressed. Review the underlying forecast, inventory policy, and procurement constraints.",
      metadata: {
        conflictCount: conflicts.length,
        suppressedActionCount: suppressedActions.length,
      },
    });
  }

  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const highestSeverity = maxSeverity(
    orderedDecisions.map((decision) => decision.severity),
  );
  const confidence = clampConfidence(
    weightedConfidence(orderedDecisions) * (conflicts.length > 0 ? 0.7 : 1),
  );
  const primary = orderedDecisions[0];

  const resolutionDecision: CommercialDecision = {
    id: `unified:${input.contextId}:${generatedAt}`,
    entityType: primary.entityType,
    entityId: primary.entityId,
    decisionType: "unified_commercial_decision",
    severity:
      status === "blocked" || conflicts.length > 0
        ? "critical"
        : highestSeverity,
    confidence,
    reasons:
      conflicts.length > 0
        ? conflicts.map((conflict) => ({
            code: "decision.conflict",
            message: conflict.message,
          }))
        : [
            {
              code: "decision.resolved",
              message: `${orderedDecisions.length} commercial decisions were ranked and consolidated without action conflicts.`,
            },
          ],
    impacts: orderedDecisions.flatMap((decision) => decision.impacts),
    actions,
    createdAt: generatedAt,
    source: "unified-decision-engine",
    version: 1,
  };

  return Object.freeze({
    contextId: input.contextId,
    status,
    maxSeverity: resolutionDecision.severity,
    confidence,
    orderedDecisions: Object.freeze(orderedDecisions),
    actions: Object.freeze(actions),
    suppressedActions: Object.freeze(suppressedActions),
    conflicts: Object.freeze(conflicts),
    resolutionDecision,
  });
}
