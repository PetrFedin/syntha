/**
 * GET /api/workshop2/platform-core/calendar-events?collectionId=&orderId=
 * POST — PG calendar task при chain-status step (Wave UH/UP).
 * События календаря из тех же сущностей, что chain-status (W2 B2B, handoff, образцы).
 */
import { NextRequest, NextResponse } from 'next/server';

import type { Workshop2B2bBuyerTier } from '@/lib/production/workshop2-b2b-campaign-hub';
import { resolvePlatformCoreCalendarThreadChatId } from '@/lib/platform-core-calendar-thread-link';
import { getPlatformCoreB2bCalendarEvents } from '@/lib/server/platform-core-calendar-events';
import {
  ensureSpineOperationalStoreReady,
  SPINE_HUB_MINIMAL_SCOPES,
  SPINE_TRACKING_READ_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';
import {
  createPlatformCoreChainStepCalendarEvents,
  type PlatformCoreChainCalendarStepKind,
} from '@/lib/server/platform-core-chain-calendar-hook';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';

const CHAIN_STEP_KINDS = new Set<PlatformCoreChainCalendarStepKind>([
  'inventory_reserved',
  'materials_supplied',
  'chain_status',
]);

export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim();
  if (!collectionId) {
    return NextResponse.json(
      { ok: false, messageRu: 'Параметр collectionId обязателен.' },
      { status: 400 }
    );
  }

  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() || undefined;
  const buyerTier = (req.nextUrl.searchParams.get('buyerTier')?.trim() ??
    'standard') as Workshop2B2bBuyerTier;

  const goldenOrderContext = Boolean(orderId?.startsWith('B2B-DEMO-'));
  if (!goldenOrderContext) {
    await ensureSpineOperationalStoreReady(
      orderId?.startsWith('INT-') ? SPINE_TRACKING_READ_SCOPES : SPINE_HUB_MINIMAL_SCOPES
    );
  }

  const { events, count } = await getPlatformCoreB2bCalendarEvents({
    collectionId,
    orderId,
    buyerTier,
  });

  const eventsWithThread = events.map((event) => ({
    ...event,
    targetChatId: resolvePlatformCoreCalendarThreadChatId(event) ?? null,
  }));

  return NextResponse.json({
    ok: true,
    collectionId,
    orderId: orderId ?? null,
    events: eventsWithThread,
    count,
    messageRu: orderId
      ? `Календарь · ${orderId}: ${count} событий.`
      : `B2B календарь · ${collectionId}: ${count} событий.`,
  });
}

/** POST — PG calendar task при смене chain-status (Wave UH/UP server hook + API). */
export async function POST(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const orderId = String(b.orderId ?? '').trim();
  const collectionId = String(b.collectionId ?? 'SS27').trim();
  const stepKind = String(
    b.stepKind ?? b.kind ?? 'chain_status'
  ) as PlatformCoreChainCalendarStepKind;
  const titleRu = String(b.titleRu ?? '').trim();
  const bodyRu = String(b.bodyRu ?? '').trim() || undefined;

  if (!orderId || !titleRu) {
    return NextResponse.json({ ok: false, messageRu: 'Нужны orderId и titleRu.' }, { status: 400 });
  }
  if (!CHAIN_STEP_KINDS.has(stepKind)) {
    return NextResponse.json({ ok: false, messageRu: 'Недопустимый stepKind.' }, { status: 400 });
  }

  const result = await createPlatformCoreChainStepCalendarEvents({
    orderId,
    collectionId,
    kind: stepKind,
    titleRu,
    bodyRu,
  });

  return NextResponse.json({
    ok: true,
    orderId,
    collectionId,
    stepKind,
    taskIds: result.taskIds,
    messageRu: `Календарь · ${orderId}: ${result.taskIds.length} слотов.`,
  });
}
