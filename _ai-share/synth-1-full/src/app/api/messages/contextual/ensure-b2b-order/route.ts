import { NextRequest, NextResponse } from 'next/server';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { isCoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';
import { ensureB2bOrderContextualThread } from '@/lib/server/ensure-b2b-order-contextual-thread';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

type Body = {
  orderId?: string;
  pillarId?: string;
  sectionId?: string;
  source?: 'checkout' | 'registry' | 'api';
};

/** POST — idempotent PG contextual thread для wholesale-заказа (B2B-\\d+ / registry). */
export async function POST(request: NextRequest) {
  const auth = await guardWorkshop2Route(request, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as Body;
    const orderId = body.orderId?.trim() ?? '';
    if (!orderId) {
      return NextResponse.json({ ok: false, messageRu: 'Укажите orderId.' }, { status: 400 });
    }
    if (!isPlatformCorePgB2bOrder(orderId)) {
      return NextResponse.json(
        { ok: false, messageRu: 'orderId должен быть wholesale B2B-DEMO-* или B2B-\\d+.' },
        { status: 400 }
      );
    }

    const pillarRaw = body.pillarId?.trim();
    const pillarId: CoreHubPillarId | undefined =
      pillarRaw && isCoreHubPillarId(pillarRaw) ? pillarRaw : undefined;

    const result = await ensureB2bOrderContextualThread({
      orderId,
      pillarId,
      sectionId: body.sectionId?.trim() || undefined,
      source: body.source ?? 'api',
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, messageRu: 'Некорректное тело запроса.' },
      { status: 400 }
    );
  }
}
