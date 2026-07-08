import { NextResponse } from 'next/server';
import {
  buildPlatformCorePlanner,
  type PlatformCorePlannerItem,
} from '@/lib/platform-core-planner';
import {
  isDevPlannerApiEnabled,
  readPlannerRuntimeState,
  runtimeToOverlay,
} from '@/lib/server/platform-core-planner-runtime.server';

function pickNextOpen(
  snapshot: ReturnType<typeof buildPlatformCorePlanner>
): PlatformCorePlannerItem | null {
  return snapshot.queue.find((t) => t.status === 'open') ?? null;
}

export async function GET(request: Request) {
  if (!isDevPlannerApiEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const url = new URL(request.url);
  const collectionId = url.searchParams.get('collection') ?? 'SS27';
  const runtime = await readPlannerRuntimeState();
  const snapshot = buildPlatformCorePlanner(collectionId, runtimeToOverlay(runtime));
  return NextResponse.json({ ok: true, next: pickNextOpen(snapshot), counts: snapshot.counts });
}
