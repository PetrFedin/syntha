import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  getCommercialExecutionRuntime,
  requireCommercialOrganizationId,
  runIntegrationReconciliationJob,
  runIntegrationWorkerCycle,
  scopeCommercialWorkflowRepository,
} from "@/modules/commercial-execution";

export const runtime = "nodejs";

function integrationIds(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    throw new Error("integrationIds must be an array.");
  }
  const ids = value.map((candidate) => {
    if (typeof candidate !== "string" || !candidate.trim()) {
      throw new Error("integrationIds must contain non-empty strings.");
    }
    return candidate;
  });
  if (ids.length === 0) throw new Error("At least one integration id is required.");
  return Object.freeze([...new Set(ids)]);
}

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly workflowId: string }> },
) {
  let commercialRuntime;
  try {
    commercialRuntime = await getCommercialExecutionRuntime();
  } catch {
    return NextResponse.json(
      { error: "commercial_execution_runtime_unavailable" },
      { status: 503 },
    );
  }
  if (!(await commercialRuntime.operationsAuthorizer.authorize(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const organizationId = requireCommercialOrganizationId(
      request.headers.get("x-syntha-organization-id"),
    );
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Worker request body must be a JSON object.");
    }
    const body = value as Record<string, unknown>;
    const settings = await commercialRuntime.workerSettings.load();
    const requestedMaximum =
      body.maximumCommands === undefined
        ? settings.maximumCommands
        : Number(body.maximumCommands);
    if (!Number.isInteger(requestedMaximum) || requestedMaximum < 1) {
      throw new Error("maximumCommands must be a positive integer.");
    }
    const { workflowId } = await context.params;
    const worker = await runIntegrationWorkerCycle({
      repository: scopeCommercialWorkflowRepository(
        commercialRuntime.repository,
        organizationId,
      ),
      transports: commercialRuntime.transports,
      workflowId,
      integrationIds: integrationIds(body.integrationIds),
      workerId: settings.workerId,
      maximumCommands: Math.min(requestedMaximum, settings.maximumCommands),
    });
    const reconciliation = await commercialRuntime.unitOfWork.execute((repository) =>
      runIntegrationReconciliationJob({
        repository: scopeCommercialWorkflowRepository(repository, organizationId),
        workflowId,
        jobId: request.headers.get("x-syntha-job-id")?.trim() || randomUUID(),
        actorId: settings.workerId,
        maximumRecords: 100,
      }),
    );
    return NextResponse.json(
      { organizationId, worker, reconciliation },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "worker_failed" },
      { status: 400 },
    );
  }
}
