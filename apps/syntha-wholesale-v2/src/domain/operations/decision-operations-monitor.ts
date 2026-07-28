import type { CommercialDecision, DecisionSeverity, RecommendedAction } from "@/domain/decision/decision";
import type { ApprovalWorkflow } from "@/domain/execution/approval-workflow";
import type { ExecutionJournal } from "@/domain/execution/execution-journal";
import type { TransactionalOutbox } from "@/domain/events/transactional-outbox";

export type DecisionOperationsStatus = "healthy" | "degraded" | "critical";

export type DecisionOperationsAlertType =
  | "approval_aging"
  | "approval_expired"
  | "execution_blocked"
  | "execution_failed"
  | "execution_stuck_queued"
  | "execution_stuck_running"
  | "outbox_retry_delayed"
  | "outbox_stale_processing"
  | "outbox_dead_letter";

export interface DecisionOperationsPolicy {
  readonly approvalWarningMinutes?: number;
  readonly queuedExecutionWarningMinutes?: number;
  readonly runningExecutionCriticalMinutes?: number;
  readonly outboxPendingWarningMinutes?: number;
  readonly outboxProcessingGraceMinutes?: number;
}

export interface DecisionOperationsAlert {
  readonly id: string;
  readonly type: DecisionOperationsAlertType;
  readonly severity: "medium" | "high" | "critical";
  readonly entityId: string;
  readonly contextId?: string;
  readonly ageMinutes: number;
  readonly message: string;
  readonly ownerRole: "buyer" | "manager" | "operations" | "engineering";
  readonly action: RecommendedAction;
}

export interface DecisionOperationsMetrics {
  readonly pendingApprovals: number;
  readonly expiredApprovals: number;
  readonly queuedExecutions: number;
  readonly runningExecutions: number;
  readonly failedExecutions: number;
  readonly blockedExecutions: number;
  readonly pendingOutboxRecords: number;
  readonly processingOutboxRecords: number;
  readonly deadLetterRecords: number;
  readonly alertCount: number;
  readonly criticalAlertCount: number;
  readonly approvalSloViolationRate: number;
  readonly executionSloViolationRate: number;
  readonly outboxSloViolationRate: number;
}

export interface DecisionOperationsAssessment {
  readonly monitorId: string;
  readonly status: DecisionOperationsStatus;
  readonly assessedAt: string;
  readonly metrics: DecisionOperationsMetrics;
  readonly alerts: readonly DecisionOperationsAlert[];
  readonly decision: CommercialDecision;
}

const severityRank: Record<DecisionOperationsAlert["severity"], number> = {
  medium: 1,
  high: 2,
  critical: 3,
};

function parseDate(value: string, field: string): Date {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) throw new Error(`${field} must be a valid ISO date string.`);
  return new Date(timestamp);
}

function ageMinutes(now: Date, since: string): number {
  return Math.max(0, Math.floor((now.getTime() - parseDate(since, "Operations timestamp").getTime()) / 60_000));
}

function rate(violations: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((violations / total) * 10_000) / 10_000;
}

function actionForAlert(input: {
  type: DecisionOperationsAlertType;
  severity: DecisionOperationsAlert["severity"];
  entityId: string;
  contextId?: string;
}): RecommendedAction {
  if (input.type === "approval_aging" || input.type === "approval_expired") {
    return {
      type: "escalate_approval",
      priority: input.severity,
      title: "Escalate commercial approval",
      description: "Route the overdue approval to the responsible manager and preserve the decision audit trail.",
      metadata: {
        approvalRequestId: input.entityId,
        ...(input.contextId ? { contextId: input.contextId } : {}),
      },
    };
  }
  if (input.type.startsWith("outbox_")) {
    return {
      type: "retry_delivery",
      priority: input.severity,
      title: "Recover event delivery",
      description: "Retry the event publication or investigate the dead-letter record before downstream state diverges.",
      metadata: { outboxRecordId: input.entityId },
    };
  }
  return {
    type: "retry_execution",
    priority: input.severity,
    title: "Recover action execution",
    description: "Inspect the execution journal, resolve the failure and retry with the existing idempotency key.",
    metadata: {
      executionEntryId: input.entityId,
      ...(input.contextId ? { contextId: input.contextId } : {}),
    },
  };
}

function createAlert(input: Omit<DecisionOperationsAlert, "id" | "action">): DecisionOperationsAlert {
  return Object.freeze({
    ...input,
    id: `${input.type}:${input.entityId}`,
    action: Object.freeze(actionForAlert(input)),
  });
}

export function assessDecisionOperations(input: {
  readonly monitorId: string;
  readonly approvalWorkflows?: readonly ApprovalWorkflow[];
  readonly executionJournals?: readonly ExecutionJournal[];
  readonly outboxes?: readonly TransactionalOutbox[];
  readonly policy?: DecisionOperationsPolicy;
  readonly assessedAt?: string;
}): DecisionOperationsAssessment {
  if (!input.monitorId.trim()) throw new Error("Decision operations monitor id is required.");
  const now = parseDate(input.assessedAt ?? new Date().toISOString(), "Operations assessment time");
  const policy = {
    approvalWarningMinutes: Math.max(1, Math.floor(input.policy?.approvalWarningMinutes ?? 120)),
    queuedExecutionWarningMinutes: Math.max(1, Math.floor(input.policy?.queuedExecutionWarningMinutes ?? 15)),
    runningExecutionCriticalMinutes: Math.max(1, Math.floor(input.policy?.runningExecutionCriticalMinutes ?? 30)),
    outboxPendingWarningMinutes: Math.max(1, Math.floor(input.policy?.outboxPendingWarningMinutes ?? 10)),
    outboxProcessingGraceMinutes: Math.max(0, Math.floor(input.policy?.outboxProcessingGraceMinutes ?? 2)),
  };
  const workflows = input.approvalWorkflows ?? [];
  const journals = input.executionJournals ?? [];
  const outboxes = input.outboxes ?? [];
  const alerts: DecisionOperationsAlert[] = [];

  let pendingApprovals = 0;
  let expiredApprovals = 0;
  let approvalViolations = 0;
  for (const workflow of workflows) {
    for (const request of workflow.requests) {
      if (request.status === "pending") {
        pendingApprovals += 1;
        const age = ageMinutes(now, request.createdAt);
        if (age >= policy.approvalWarningMinutes) {
          approvalViolations += 1;
          alerts.push(createAlert({
            type: "approval_aging",
            severity: Date.parse(request.expiresAt) <= now.getTime() ? "critical" : "high",
            entityId: request.id,
            contextId: workflow.contextId,
            ageMinutes: age,
            message: `Approval request has been pending for ${age} minutes.`,
            ownerRole: "manager",
          }));
        }
      } else if (request.status === "expired") {
        expiredApprovals += 1;
        approvalViolations += 1;
        alerts.push(createAlert({
          type: "approval_expired",
          severity: "critical",
          entityId: request.id,
          contextId: workflow.contextId,
          ageMinutes: ageMinutes(now, request.createdAt),
          message: "Approval request expired without a decision.",
          ownerRole: "manager",
        }));
      }
    }
  }

  let queuedExecutions = 0;
  let runningExecutions = 0;
  let failedExecutions = 0;
  let blockedExecutions = 0;
  let executionViolations = 0;
  let mutableExecutionCount = 0;
  for (const journal of journals) {
    for (const entry of journal.entries) {
      if (entry.status === "informational") continue;
      mutableExecutionCount += 1;
      const age = ageMinutes(now, entry.updatedAt);
      if (entry.status === "queued") {
        queuedExecutions += 1;
        if (age >= policy.queuedExecutionWarningMinutes) {
          executionViolations += 1;
          alerts.push(createAlert({
            type: "execution_stuck_queued",
            severity: "high",
            entityId: entry.id,
            contextId: journal.contextId,
            ageMinutes: age,
            message: `Execution has remained queued for ${age} minutes.`,
            ownerRole: "operations",
          }));
        }
      } else if (entry.status === "running") {
        runningExecutions += 1;
        if (age >= policy.runningExecutionCriticalMinutes) {
          executionViolations += 1;
          alerts.push(createAlert({
            type: "execution_stuck_running",
            severity: "critical",
            entityId: entry.id,
            contextId: journal.contextId,
            ageMinutes: age,
            message: `Execution has remained running for ${age} minutes.`,
            ownerRole: "engineering",
          }));
        }
      } else if (entry.status === "failed") {
        failedExecutions += 1;
        executionViolations += 1;
        alerts.push(createAlert({
          type: "execution_failed",
          severity: "critical",
          entityId: entry.id,
          contextId: journal.contextId,
          ageMinutes: age,
          message: entry.error ? `Execution failed: ${entry.error}` : "Execution failed.",
          ownerRole: "operations",
        }));
      } else if (entry.status === "blocked") {
        blockedExecutions += 1;
        executionViolations += 1;
        alerts.push(createAlert({
          type: "execution_blocked",
          severity: "high",
          entityId: entry.id,
          contextId: journal.contextId,
          ageMinutes: age,
          message: "Execution is blocked by policy, conflicts or data quality.",
          ownerRole: "manager",
        }));
      }
    }
  }

  let pendingOutboxRecords = 0;
  let processingOutboxRecords = 0;
  let deadLetterRecords = 0;
  let outboxViolations = 0;
  let deliverableOutboxCount = 0;
  for (const outbox of outboxes) {
    for (const record of outbox.records) {
      if (record.status === "published") continue;
      deliverableOutboxCount += 1;
      const age = ageMinutes(now, record.updatedAt);
      if (record.status === "pending") {
        pendingOutboxRecords += 1;
        if (age >= policy.outboxPendingWarningMinutes) {
          outboxViolations += 1;
          alerts.push(createAlert({
            type: "outbox_retry_delayed",
            severity: "high",
            entityId: record.id,
            ageMinutes: age,
            message: `Outbox record has remained pending for ${age} minutes.`,
            ownerRole: "engineering",
          }));
        }
      } else if (record.status === "processing") {
        processingOutboxRecords += 1;
        const stale = record.lockedUntil
          ? now.getTime() > Date.parse(record.lockedUntil) + policy.outboxProcessingGraceMinutes * 60_000
          : age >= policy.outboxProcessingGraceMinutes;
        if (stale) {
          outboxViolations += 1;
          alerts.push(createAlert({
            type: "outbox_stale_processing",
            severity: "critical",
            entityId: record.id,
            ageMinutes: age,
            message: "Outbox processing lease is stale and must be recovered.",
            ownerRole: "engineering",
          }));
        }
      } else if (record.status === "dead_letter") {
        deadLetterRecords += 1;
        outboxViolations += 1;
        alerts.push(createAlert({
          type: "outbox_dead_letter",
          severity: "critical",
          entityId: record.id,
          ageMinutes: age,
          message: record.lastError
            ? `Outbox delivery moved to dead letter: ${record.lastError}`
            : "Outbox delivery moved to dead letter.",
          ownerRole: "engineering",
        }));
      }
    }
  }

  alerts.sort((left, right) =>
    severityRank[right.severity] - severityRank[left.severity] ||
    right.ageMinutes - left.ageMinutes ||
    left.id.localeCompare(right.id),
  );
  const criticalAlertCount = alerts.filter((alert) => alert.severity === "critical").length;
  const status: DecisionOperationsStatus = criticalAlertCount > 0
    ? "critical"
    : alerts.length > 0
      ? "degraded"
      : "healthy";
  const metrics: DecisionOperationsMetrics = Object.freeze({
    pendingApprovals,
    expiredApprovals,
    queuedExecutions,
    runningExecutions,
    failedExecutions,
    blockedExecutions,
    pendingOutboxRecords,
    processingOutboxRecords,
    deadLetterRecords,
    alertCount: alerts.length,
    criticalAlertCount,
    approvalSloViolationRate: rate(approvalViolations, pendingApprovals + expiredApprovals),
    executionSloViolationRate: rate(executionViolations, mutableExecutionCount),
    outboxSloViolationRate: rate(outboxViolations, deliverableOutboxCount),
  });
  const severity: DecisionSeverity = status === "critical" ? "critical" : status === "degraded" ? "high" : "info";
  const uniqueActions = new Map<string, RecommendedAction>();
  for (const alert of alerts) {
    const key = `${alert.action.type}:${alert.ownerRole}`;
    if (!uniqueActions.has(key)) uniqueActions.set(key, alert.action);
  }
  const decision: CommercialDecision = Object.freeze({
    id: `decision-operations:${input.monitorId}:${now.toISOString()}`,
    entityType: "system",
    entityId: input.monitorId,
    decisionType: "decision_operations_health",
    severity,
    confidence: 1,
    reasons: alerts.length === 0
      ? [{ code: "operations.healthy", message: "Decision execution operations are within configured SLOs." }]
      : alerts.map((alert) => ({
          code: `operations.${alert.type}`,
          message: alert.message,
          metric: "ageMinutes",
          actual: alert.ageMinutes,
          threshold: 0,
          unit: "minutes",
        })),
    impacts: [
      { metric: "criticalAlertCount", value: criticalAlertCount, unit: "alerts", direction: "decrease" },
      { metric: "alertCount", value: alerts.length, unit: "alerts", direction: "decrease" },
    ],
    actions: alerts.length === 0
      ? [{ type: "none", priority: "info", title: "Operations healthy", description: "No operational intervention is required." }]
      : [...uniqueActions.values()],
    createdAt: now.toISOString(),
    source: "decision-operations-monitor",
    version: 1,
  });

  return Object.freeze({
    monitorId: input.monitorId,
    status,
    assessedAt: now.toISOString(),
    metrics,
    alerts: Object.freeze(alerts),
    decision,
  });
}
