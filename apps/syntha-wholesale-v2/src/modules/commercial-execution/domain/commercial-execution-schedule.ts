import { normalizeCommercialOrganizationId } from "../application/organization-scoped-commercial-workflow-repository";

export interface CommercialExecutionSchedule {
  readonly organizationId: string;
  readonly workflowId: string;
  readonly integrationIds: readonly string[];
  readonly intervalSeconds: number;
  readonly enabled: boolean;
  readonly nextRunAt: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly leaseOwner?: string;
  readonly leaseUntil?: string;
  readonly lastStartedAt?: string;
  readonly lastCompletedAt?: string;
  readonly lastError?: string;
}

function iso(value: string, field: string): string {
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(value).toISOString();
}

export function createCommercialExecutionSchedule(input: {
  readonly organizationId: string;
  readonly workflowId: string;
  readonly integrationIds: readonly string[];
  readonly intervalSeconds: number;
  readonly enabled?: boolean;
  readonly nextRunAt?: string;
  readonly updatedAt?: string;
  readonly updatedBy: string;
}): CommercialExecutionSchedule {
  const organizationId = normalizeCommercialOrganizationId(input.organizationId);
  if (!input.workflowId.trim()) throw new Error("Workflow id is required.");
  if (!input.updatedBy.trim()) throw new Error("Schedule actor id is required.");
  const integrationIds = [...new Set(input.integrationIds.map((id) => id.trim()))]
    .filter(Boolean)
    .sort();
  if (integrationIds.length === 0) {
    throw new Error("At least one integration id is required.");
  }
  const intervalSeconds = Math.floor(input.intervalSeconds);
  if (intervalSeconds < 60 || intervalSeconds > 86_400) {
    throw new Error("Schedule interval must be between 60 and 86400 seconds.");
  }
  const updatedAt = iso(
    input.updatedAt ?? new Date().toISOString(),
    "Schedule update time",
  );
  return Object.freeze({
    organizationId,
    workflowId: input.workflowId,
    integrationIds: Object.freeze(integrationIds),
    intervalSeconds,
    enabled: input.enabled ?? true,
    nextRunAt: iso(input.nextRunAt ?? updatedAt, "Schedule next run time"),
    updatedAt,
    updatedBy: input.updatedBy,
  });
}
