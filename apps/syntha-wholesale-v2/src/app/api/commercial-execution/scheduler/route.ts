import { NextResponse } from "next/server";

import {
  getCommercialExecutionRuntime,
  runCommercialExecutionSchedulerCycle,
} from "@/modules/commercial-execution";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
    const value: unknown = await request.json().catch(() => ({}));
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Scheduler body must be a JSON object.");
    }
    const body = value as Record<string, unknown>;
    const settings = await commercialRuntime.workerSettings.load();
    const maximumSchedules = Math.min(
      100,
      Math.max(1, Math.floor(Number(body.maximumSchedules ?? 50))),
    );
    const maximumCommandsPerWorkflow = Math.min(
      settings.maximumCommands,
      Math.max(
        1,
        Math.floor(Number(body.maximumCommandsPerWorkflow ?? settings.maximumCommands)),
      ),
    );
    const result = await runCommercialExecutionSchedulerCycle({
      repository: commercialRuntime.repository,
      unitOfWork: commercialRuntime.unitOfWork,
      schedules: commercialRuntime.schedules,
      transports: commercialRuntime.transports,
      workerId: settings.workerId,
      leaseSeconds: Math.min(
        3600,
        Math.max(30, Math.floor(Number(body.leaseSeconds ?? 300))),
      ),
      maximumSchedules,
      maximumCommandsPerWorkflow,
    });
    return NextResponse.json(result, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "scheduler_failed" },
      { status: 400 },
    );
  }
}
