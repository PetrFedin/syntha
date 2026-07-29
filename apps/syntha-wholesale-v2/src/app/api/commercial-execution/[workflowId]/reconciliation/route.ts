import { NextResponse } from "next/server";

import {
  getCommercialExecutionRuntime,
  runIntegrationReconciliationJob,
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
  const actorId = request.headers.get("x-syntha-actor-id")?.trim();
  if (!actorId) {
    return NextResponse.json({ error: "actor_id_required" }, { status: 400 });
  }
  let body: Record<string, unknown>;
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Reconciliation body must be a JSON object.");
    }
    body = value as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "invalid_request" },
      { status: 400 },
    );
  }
  if (typeof body.jobId !== "string" || !body.jobId.trim()) {
    return NextResponse.json({ error: "job_id_required" }, { status: 400 });
  }
  const { workflowId } = await context.params;
  const maximumRecords =
    body.maximumRecords === undefined ? undefined : Number(body.maximumRecords);
  try {
    const result = await commercialRuntime.unitOfWork.execute((repository) =>
      runIntegrationReconciliationJob({
        repository,
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
