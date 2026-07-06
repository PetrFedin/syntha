import { NextResponse } from 'next/server';
import {
  runPlatformAiTaskDev,
  type PlatformAiTaskContext,
} from '@/lib/server/platform-ai-task.server';
import { isDevPlannerApiEnabled } from '@/lib/server/platform-core-planner-runtime.server';

export async function POST(request: Request) {
  if (!isDevPlannerApiEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    task?: string;
    context?: PlatformAiTaskContext;
  };
  const task = body.task?.trim();
  if (!task) {
    return NextResponse.json({ ok: false, error: 'task required' }, { status: 400 });
  }

  const result = await runPlatformAiTaskDev(task, body.context);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, status: result.status },
      { status: result.status && result.status >= 400 ? result.status : 502 }
    );
  }

  return NextResponse.json({ ok: true, data: result.data });
}
