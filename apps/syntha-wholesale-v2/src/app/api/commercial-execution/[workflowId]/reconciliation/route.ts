import { NextResponse } from "next/server";

import {
  getCommercialExecutionRuntime,
  requireCommercialOrganizationId,
  runIntegrationReconciliationJob,
  scopeCommercialWorkflowRepository,
} from "@/modules/commercial-execution";

export const runtime = "nodejs";

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
    if (
      !(await commercialRuntime.operationsAuthorizer.authorizeAccess(request, {
        permission: "operate",
        organizationId,
      }))
    ) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const actorId = request.headers.get("x-syntha-actor-id")?.trim();
    if (!actorId) throw new Error("Operations actor id is required.");
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Reconciliation body must be a JSON object.");
    }
    const body = value as Record<string, unknown>;
    if (typeof body.jobId !== "string" || !body.jobId.trim()) {
      throw new Error("Reconciliation job id is required.");
    }
    const { workflowId } = await context.params;
    const maximumRecords =
      body.maximumRecords === undefined ? undefined : Number(body.maximumRecords);
    const result = await commercialRuntime.unitOfWork.execute((repository) =>
      runIntegrationReconciliationJob({
        repository: scopeCommercialWorkflowRepository(repository, organizationId),
        workflowId,
        jobId: body.jobId as string,
        actorId,
        maximumRecords,
      }),
    );
    return NextResponse.json(result, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "reconciliation_failed" },
      { status: 400 },
    );
  }
}
