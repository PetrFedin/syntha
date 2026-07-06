import { NextRequest, NextResponse } from 'next/server';

import {
  ensureSpineOperationalStoreReady,
  SPINE_TRACKING_READ_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';
import { isSpineOperationalPgEnabled } from '@/lib/integrations/spine/spine-operational-persistence.pg';
import { getMfrProductionOrdersTimeline } from '@/lib/server/mfr-production-orders-timeline-server';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

/** GET — Gantt/WIP timeline по production_orders из PG (Wave WJ). */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  if (isSpineOperationalPgEnabled()) {
    await ensureSpineOperationalStoreReady(SPINE_TRACKING_READ_SCOPES);
  }

  const factoryId = req.nextUrl.searchParams.get('factoryId')?.trim() || 'fact-1';
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() || undefined;
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = limitRaw != null ? Number(limitRaw) : undefined;

  const timeline = await getMfrProductionOrdersTimeline({ factoryId, orderId, limit });
  return NextResponse.json({
    ok: timeline.ok,
    timeline,
    messageRu: timeline.messageRu,
    storageModeLabelRu: timeline.storageModeLabelRu,
  });
}
