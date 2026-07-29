import { NextResponse } from "next/server";

import {
  applyCommercialOperationsAction,
  getCommercialExecutionRuntime,
  type CommercialOperationsAction,
} from "@/modules/commercial-execution";

export const runtime = "nodejs";

function required(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  return value;
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
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Operations action body must be a JSON object.");
    }
    const body = value as Record<string, unknown>;
    const actionType = body.actionType;
    if (
      actionType !== "retry_command" &&
      actionType !== "cancel_command" &&
      actionType !== "reset_circuit"
    ) {
      throw new Error(
        "actionType must be retry_command, cancel_command or reset_circuit.",
      );
    }
    const action: CommercialOperationsAction = Object.freeze({
      actionId: required(body.actionId, "Operations action id"),
      actionType,
      targetId: required(body.targetId, "Operations target id"),
      actorId: required(
        request.headers.get("x-syntha-actor-id"),
        "Operations actor id",
      ),
      reason:
        body.reason === undefined
          ? undefined
          : required(body.reason, "Operations action reason"),
    });
    const { workflowId } = await context.params;
    const result = await commercialRuntime.unitOfWork.execute((repository) =>
      applyCommercialOperationsAction({ repository, workflowId, action }),
    );
    const status =
      result.status === "not_found"
        ? 404
        : result.status === "invalid_state"
          ? 409
          : 200;
    return NextResponse.json(
      {
        status: result.status,
        audit: result.audit,
        version: result.state?.version,
      },
      { status, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "invalid_action" },
      { status: 400 },
    );
  }
}
