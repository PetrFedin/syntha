import { NextRequest, NextResponse } from 'next/server';

import { getMfrProductionTimeline } from '@/lib/server/mfr-production-timeline-server';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

/** GET — WIP timeline по B2B order / production PO (Wave SJ). */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() ?? '';
  const productionOrderId = req.nextUrl.searchParams.get('productionOrderId')?.trim() || undefined;

  if (!orderId && !productionOrderId) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите orderId или productionOrderId.' },
      { status: 400 }
    );
  }

  const timeline = getMfrProductionTimeline({ orderId, productionOrderId });
  return NextResponse.json({ ok: timeline.ok, timeline, messageRu: timeline.messageRu });
}
