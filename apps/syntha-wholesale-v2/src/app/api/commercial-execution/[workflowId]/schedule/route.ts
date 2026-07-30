import { NextResponse } from "next/server";

import {
  createCommercialExecutionSchedule,
  getCommercialExecutionRuntime,
  requireCommercialOrganizationId,
} from "@/modules/commercial-execution";

export const runtime = "nodejs";

function actor(request: Request): string {
  const value = request.headers.get("x-syntha-actor-id")?.trim();
  if (!value) throw new Error("Schedule actor id is required.");
  return value;
}

function integrations(value: unknown): readonly string[] {
  if (!Array.isArray(value)) throw new Error("integrationIds must be an array.");
  return value.map((item) => {
    if (typeof item !== "string" || !item.trim()) {
      throw new Error("integrationIds must contain non-empty strings.");
    }
    return item;
  });
}

async function runtimeFor(request: Request, organizationId: string) {
  const commercialRuntime = await getCommercialExecutionRuntime();
  if (!(await commercialRuntime.operationsAuthorizer.authorize(request))) {
    throw new Error("unauthorized");
  }
  if (
    !(await commercialRuntime.operationsAuthorizer.authorizeAccess(request, {
      permission: "schedule",
      organizationId,
    }))
  ) {
    throw new Error("forbidden");
  }
  return commercialRuntime;
}

function errorStatus(message: string): number {
  return message === "unauthorized" ? 401 : message === "forbidden" ? 403 : 400;
}

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly workflowId: string }> },
) {
  try {
    const organizationId = requireCommercialOrganizationId(
      request.headers.get("x-syntha-organization-id"),
    );
    const commercialRuntime = await runtimeFor(request, organizationId);
    const { workflowId } = await context.params;
    const schedule = await commercialRuntime.schedules.findById(
      organizationId,
      workflowId,
    );
    return schedule
      ? NextResponse.json(schedule, { headers: { "cache-control": "no-store" } })
      : NextResponse.json({ error: "schedule_not_found" }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_request";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}

export async function PUT(
  request: Request,
  context: { readonly params: Promise<{ readonly workflowId: string }> },
) {
  try {
    const organizationId = requireCommercialOrganizationId(
      request.headers.get("x-syntha-organization-id"),
    );
    const commercialRuntime = await runtimeFor(request, organizationId);
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Schedule body must be a JSON object.");
    }
    const body = value as Record<string, unknown>;
    const { workflowId } = await context.params;
    const schedule = createCommercialExecutionSchedule({
      organizationId,
      workflowId,
      integrationIds: integrations(body.integrationIds),
      intervalSeconds: Number(body.intervalSeconds),
      enabled: body.enabled === undefined ? true : body.enabled === true,
      nextRunAt:
        typeof body.nextRunAt === "string" ? body.nextRunAt : undefined,
      updatedBy: actor(request),
    });
    const saved = await commercialRuntime.schedules.upsert(schedule);
    return NextResponse.json(saved, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_schedule";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}

export async function DELETE(
  request: Request,
  context: { readonly params: Promise<{ readonly workflowId: string }> },
) {
  try {
    const organizationId = requireCommercialOrganizationId(
      request.headers.get("x-syntha-organization-id"),
    );
    const commercialRuntime = await runtimeFor(request, organizationId);
    const { workflowId } = await context.params;
    const current = await commercialRuntime.schedules.findById(
      organizationId,
      workflowId,
    );
    if (!current) {
      return NextResponse.json({ error: "schedule_not_found" }, { status: 404 });
    }
    const disabled = createCommercialExecutionSchedule({
      organizationId,
      workflowId,
      integrationIds: current.integrationIds,
      intervalSeconds: current.intervalSeconds,
      enabled: false,
      nextRunAt: current.nextRunAt,
      updatedBy: actor(request),
    });
    await commercialRuntime.schedules.upsert(disabled);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_schedule";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}
