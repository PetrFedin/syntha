import { NextResponse } from "next/server";

import { getCommercialExecutionRuntime } from "@/modules/commercial-execution";

export const runtime = "nodejs";

export async function GET() {
  let commercialRuntime;
  try {
    commercialRuntime = await getCommercialExecutionRuntime();
  } catch {
    return NextResponse.json(
      {
        status: "not_ready",
        components: {
          runtime: {
            status: "down",
            message: "Commercial execution runtime is not configured.",
          },
        },
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
  const report = await commercialRuntime.healthCheck.check();
  return NextResponse.json(report, {
    status: report.status === "not_ready" ? 503 : 200,
    headers: { "cache-control": "no-store" },
  });
}
