import {
  type CommercialDecision,
  type DecisionActionType,
  type DecisionSeverity,
  type RecommendedAction,
} from "./decision";
import type { UnifiedDecisionResult } from "./unified-decision-engine";

export type ActionDisposition =
  | "informational"
  | "auto_execute"
  | "approval_required"
  | "blocked";

export interface DecisionExecutionPolicy {
  readonly minimumConfidence?: number;
  readonly maximumAutomaticPriority?: DecisionSeverity;
  readonly automaticActionTypes?: readonly DecisionActionType[];
}

export interface ActionExecutionEntry {
  readonly action: RecommendedAction;
  readonly disposition: ActionDisposition;
  readonly reasons: readonly string[];
}

export interface DecisionExecutionPlan {
  readonly contextId: string;
  readonly status:
    | "no_action"
    | "automatic"
    | "approval_required"
    | "blocked";
  readonly confidence: number;
  readonly entries: readonly ActionExecutionEntry[];
  readonly automaticActions: readonly RecommendedAction[];
  readonly approvalActions: readonly RecommendedAction[];
  readonly blockedActions: readonly RecommendedAction[];
  readonly decision: CommercialDecision;
}

const severityRank: Record<DecisionSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const defaultAutomaticActions: readonly DecisionActionType[] = [
  "none",
  "create_replenishment",
  "create_purchase_order",
  "select_supplier",
  "allocate_budget",
  "transfer_stock",
];

const manualOnlyActions = new Set<DecisionActionType>([
  "review",
  "repair_data",
  "supplier_review",
  "budget_review",
  "markdown_review",
  "liquidate",
]);

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function classifyAction(input: {
  action: RecommendedAction;
  resolution: UnifiedDecisionResult;
  minimumConfidence: number;
  maximumAutomaticPriority: DecisionSeverity;
  automaticActionTypes: Set<DecisionActionType>;
}): ActionExecutionEntry {
  const reasons: string[] = [];

  if (input.action.type === "none") {
    return {
      action: input.action,
      disposition: "informational",
      reasons: Object.freeze(["The action is informational and does not mutate state."]),
    };
  }

  if (
    input.resolution.status === "blocked" ||
    input.resolution.conflicts.length > 0 ||
    (input.action.type === "repair_data" && input.action.priority === "critical")
  ) {
    reasons.push(
      input.resolution.conflicts.length > 0
        ? "Conflicting commercial decisions must be resolved before execution."
        : input.action.type === "repair_data"
          ? "Critical data-quality defects block downstream automation."
          : "The unified decision is blocked.",
    );
    return {
      action: input.action,
      disposition: "blocked",
      reasons: Object.freeze(reasons),
    };
  }

  if (manualOnlyActions.has(input.action.type)) {
    reasons.push("This action type always requires human approval.");
  }
  if (input.resolution.status === "requires_review") {
    reasons.push("The unified commercial decision requires review.");
  }
  if (input.resolution.confidence < input.minimumConfidence) {
    reasons.push(
      `Decision confidence is below the automatic threshold ${input.minimumConfidence}.`,
    );
  }
  if (
    severityRank[input.action.priority] >
    severityRank[input.maximumAutomaticPriority]
  ) {
    reasons.push(
      `Action priority exceeds the automatic limit ${input.maximumAutomaticPriority}.`,
    );
  }
  if (!input.automaticActionTypes.has(input.action.type)) {
    reasons.push("The action is not included in the automatic execution allowlist.");
  }

  return {
    action: input.action,
    disposition: reasons.length > 0 ? "approval_required" : "auto_execute",
    reasons: Object.freeze(reasons),
  };
}

export function createDecisionExecutionPlan(input: {
  resolution: UnifiedDecisionResult;
  policy?: DecisionExecutionPolicy;
  generatedAt?: string;
}): DecisionExecutionPlan {
  const minimumConfidence = clamp01(input.policy?.minimumConfidence ?? 0.8);
  const maximumAutomaticPriority =
    input.policy?.maximumAutomaticPriority ?? "medium";
  const automaticActionTypes = new Set(
    input.policy?.automaticActionTypes ?? defaultAutomaticActions,
  );
  const entries = input.resolution.actions.map((action) =>
    classifyAction({
      action,
      resolution: input.resolution,
      minimumConfidence,
      maximumAutomaticPriority,
      automaticActionTypes,
    }),
  );
  const automaticActions = entries
    .filter((entry) => entry.disposition === "auto_execute")
    .map((entry) => entry.action);
  const approvalActions = entries
    .filter((entry) => entry.disposition === "approval_required")
    .map((entry) => entry.action);
  const blockedActions = entries
    .filter((entry) => entry.disposition === "blocked")
    .map((entry) => entry.action);
  const mutatingEntries = entries.filter(
    (entry) => entry.disposition !== "informational",
  );
  const status: DecisionExecutionPlan["status"] =
    blockedActions.length > 0
      ? "blocked"
      : approvalActions.length > 0
        ? "approval_required"
        : automaticActions.length > 0
          ? "automatic"
          : "no_action";
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const decision: CommercialDecision = {
    id: `execution-gate:${input.resolution.contextId}:${generatedAt}`,
    entityType: input.resolution.resolutionDecision.entityType,
    entityId: input.resolution.resolutionDecision.entityId,
    decisionType: "decision_execution_gate",
    severity:
      status === "blocked"
        ? "critical"
        : status === "approval_required"
          ? "high"
          : "info",
    confidence: input.resolution.confidence,
    reasons: [
      {
        code: `execution.${status}`,
        message:
          status === "automatic"
            ? `${automaticActions.length} action(s) satisfy the automatic execution policy.`
            : status === "approval_required"
              ? `${approvalActions.length} action(s) require approval before execution.`
              : status === "blocked"
                ? `${blockedActions.length} action(s) are blocked.`
                : "No mutating commercial action is required.",
      },
    ],
    impacts: [
      {
        metric: "automaticActionCount",
        value: automaticActions.length,
        unit: "actions",
        direction: "neutral",
      },
      {
        metric: "manualActionCount",
        value: approvalActions.length + blockedActions.length,
        unit: "actions",
        direction: "decrease",
      },
    ],
    actions:
      status === "approval_required" || status === "blocked"
        ? [
            {
              type: "review",
              priority: status === "blocked" ? "critical" : "high",
              title:
                status === "blocked"
                  ? "Resolve execution blockers"
                  : "Approve commercial actions",
              description:
                status === "blocked"
                  ? "Correct blocking conflicts or data issues before any state-changing action."
                  : "Review the proposed commercial actions and approve selected executions.",
              metadata: {
                actionCount: mutatingEntries.length,
                blockedActionCount: blockedActions.length,
                approvalActionCount: approvalActions.length,
              },
            },
          ]
        : [
            {
              type: "none",
              priority: "info",
              title:
                status === "automatic"
                  ? "Automatic execution permitted"
                  : "No execution required",
              description:
                status === "automatic"
                  ? "All proposed actions satisfy the configured execution policy."
                  : "The resolved decision contains no mutating action.",
              metadata: {
                automaticActionCount: automaticActions.length,
              },
            },
          ],
    createdAt: generatedAt,
    source: "decision-execution-gate",
    version: 1,
  };

  return Object.freeze({
    contextId: input.resolution.contextId,
    status,
    confidence: input.resolution.confidence,
    entries: Object.freeze(entries),
    automaticActions: Object.freeze(automaticActions),
    approvalActions: Object.freeze(approvalActions),
    blockedActions: Object.freeze(blockedActions),
    decision,
  });
}
