import { NextResponse } from "next/server";

import {
  getCommercialExecutionRuntime,
  getCommercialOperationsReadModel,
} from "@/modules/commercial-execution";

export const runtime = "nodejs";

export async function GET(
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

  const { workflowId } = await context.params;
  const readModel = await getCommercialOperationsReadModel({
    repository: commercialRuntime.repository,
    workflowId,
  });
  if (!readModel) {
    return NextResponse.json({ error: "workflow_not_found" }, { status: 404 });
  }
  return NextResponse.json(readModel, {
    headers: { "cache-control": "no-store" },
  });
}
