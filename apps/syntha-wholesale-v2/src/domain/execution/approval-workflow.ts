import type { DecisionExecutionPlan } from "@/domain/decision/decision-execution-gate";
import type {
  DecisionSeverity,
  RecommendedAction,
} from "@/domain/decision/decision";

export type ApprovalRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired";

export interface ApprovalVote {
  readonly approverId: string;
  readonly role: string;
  readonly outcome: "approve" | "reject";
  readonly decidedAt: string;
  readonly comment?: string;
}

export interface ApprovalRequest {
  readonly id: string;
  readonly contextId: string;
  readonly entryIndex: number;
  readonly action: RecommendedAction;
  readonly status: ApprovalRequestStatus;
  readonly requiredApprovals: number;
  readonly allowedRoles: readonly string[];
  readonly votes: readonly ApprovalVote[];
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly resolvedAt?: string;
}

export interface ApprovalWorkflowPolicy {
  readonly requiredApprovalsByPriority?: Partial<
    Record<DecisionSeverity, number>
  >;
  readonly allowedRoles?: readonly string[];
  readonly expiresInHours?: number;
}

export interface ApprovalWorkflow {
  readonly contextId: string;
  readonly status:
    | "not_required"
    | "pending"
    | "approved"
    | "rejected"
    | "expired";
  readonly requests: readonly ApprovalRequest[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

const defaultRequiredApprovals: Record<DecisionSeverity, number> = {
  info: 0,
  low: 1,
  medium: 1,
  high: 1,
  critical: 2,
};

function parseDate(value: string, field: string): Date {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp);
}

function addHours(date: Date, hours: number): string {
  return new Date(date.getTime() + hours * 3_600_000).toISOString();
}

function workflowStatus(
  requests: readonly ApprovalRequest[],
): ApprovalWorkflow["status"] {
  if (requests.length === 0) return "not_required";
  if (requests.some((request) => request.status === "rejected")) {
    return "rejected";
  }
  if (requests.some((request) => request.status === "expired")) {
    return "expired";
  }
  if (requests.every((request) => request.status === "approved")) {
    return "approved";
  }
  return "pending";
}

export function createApprovalWorkflow(input: {
  readonly executionPlan: DecisionExecutionPlan;
  readonly policy?: ApprovalWorkflowPolicy;
  readonly createdAt?: string;
}): ApprovalWorkflow {
  const createdAt = parseDate(
    input.createdAt ?? new Date().toISOString(),
    "Approval creation time",
  );
  const expiresInHours = Math.max(
    1,
    Math.floor(input.policy?.expiresInHours ?? 24),
  );
  const allowedRoles = Object.freeze([
    ...(input.policy?.allowedRoles ?? ["buyer", "manager", "admin"]),
  ]);
  const requiredApprovals = {
    ...defaultRequiredApprovals,
    ...input.policy?.requiredApprovalsByPriority,
  };

  const requests = input.executionPlan.entries.flatMap((entry, entryIndex) => {
    if (entry.disposition !== "approval_required") return [];
    const count = Math.max(
      1,
      Math.floor(requiredApprovals[entry.action.priority]),
    );
    const request: ApprovalRequest = {
      id: `${input.executionPlan.contextId}:approval:${entryIndex}:${entry.action.type}`,
      contextId: input.executionPlan.contextId,
      entryIndex,
      action: entry.action,
      status: "pending",
      requiredApprovals: count,
      allowedRoles,
      votes: Object.freeze([]),
      createdAt: createdAt.toISOString(),
      expiresAt: addHours(createdAt, expiresInHours),
    };
    return [Object.freeze(request)];
  });

  return Object.freeze({
    contextId: input.executionPlan.contextId,
    status: workflowStatus(requests),
    requests: Object.freeze(requests),
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  });
}

export function refreshApprovalWorkflow(
  workflow: ApprovalWorkflow,
  now: string = new Date().toISOString(),
): ApprovalWorkflow {
  const currentTime = parseDate(now, "Approval refresh time");
  const requests = workflow.requests.map((request) => {
    if (
      request.status === "pending" &&
      parseDate(request.expiresAt, "Approval expiry") <= currentTime
    ) {
      return Object.freeze({
        ...request,
        status: "expired" as const,
        resolvedAt: currentTime.toISOString(),
      });
    }
    return request;
  });
  return Object.freeze({
    ...workflow,
    status: workflowStatus(requests),
    requests: Object.freeze(requests),
    updatedAt: currentTime.toISOString(),
  });
}

export function recordApprovalVote(input: {
  readonly workflow: ApprovalWorkflow;
  readonly requestId: string;
  readonly approverId: string;
  readonly role: string;
  readonly outcome: "approve" | "reject";
  readonly comment?: string;
  readonly decidedAt?: string;
}): ApprovalWorkflow {
  if (!input.approverId.trim()) throw new Error("Approver id is required.");
  const decidedAt = parseDate(
    input.decidedAt ?? new Date().toISOString(),
    "Approval decision time",
  );
  const refreshed = refreshApprovalWorkflow(
    input.workflow,
    decidedAt.toISOString(),
  );
  const target = refreshed.requests.find(
    (request) => request.id === input.requestId,
  );
  if (!target) throw new Error("Approval request was not found.");
  if (target.status !== "pending") {
    throw new Error("Only a pending approval request can receive votes.");
  }
  if (!target.allowedRoles.includes(input.role)) {
    throw new Error(`Role ${input.role} is not allowed to approve this action.`);
  }
  if (target.votes.some((vote) => vote.approverId === input.approverId)) {
    throw new Error("The approver has already voted on this request.");
  }

  const vote: ApprovalVote = {
    approverId: input.approverId,
    role: input.role,
    outcome: input.outcome,
    decidedAt: decidedAt.toISOString(),
    comment: input.comment,
  };
  const requests = refreshed.requests.map((request) => {
    if (request.id !== input.requestId) return request;
    const votes = Object.freeze([...request.votes, Object.freeze(vote)]);
    const approvalCount = votes.filter(
      (candidate) => candidate.outcome === "approve",
    ).length;
    const status: ApprovalRequestStatus =
      input.outcome === "reject"
        ? "rejected"
        : approvalCount >= request.requiredApprovals
          ? "approved"
          : "pending";
    return Object.freeze({
      ...request,
      votes,
      status,
      resolvedAt:
        status === "approved" || status === "rejected"
          ? decidedAt.toISOString()
          : undefined,
    });
  });

  return Object.freeze({
    ...refreshed,
    requests: Object.freeze(requests),
    status: workflowStatus(requests),
    updatedAt: decidedAt.toISOString(),
  });
}
