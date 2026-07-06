import { NextRequest, NextResponse } from 'next/server';

import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { isCoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';
import { ensurePlatformCoreCommsContextualThread } from '@/lib/server/platform-core-comms-contextual-thread';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

type Body = {
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  pillarId?: string;
  sectionId?: string;
  source?: 'checkout' | 'registry' | 'api';
  initialMessage?: string;
};

/** POST — contextual thread для заказа (b2b_order) или артикула (workshop2_article). */
export async function POST(request: NextRequest) {
  const auth = await guardWorkshop2Route(request, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as Body;
    const orderId = body.orderId?.trim();
    const collectionId = body.collectionId?.trim();
    const articleId = body.articleId?.trim();

    if (!orderId && !(collectionId && articleId)) {
      return NextResponse.json(
        { ok: false, messageRu: 'Укажите orderId или collectionId+articleId.' },
        { status: 400 }
      );
    }

    if (orderId && !isPlatformCorePgB2bOrder(orderId)) {
      return NextResponse.json(
        { ok: false, messageRu: 'orderId должен быть wholesale B2B-DEMO-* или B2B-\\d+.' },
        { status: 400 }
      );
    }

    const pillarRaw = body.pillarId?.trim();
    const pillarId: CoreHubPillarId | undefined =
      pillarRaw && isCoreHubPillarId(pillarRaw) ? pillarRaw : undefined;

    const result = await ensurePlatformCoreCommsContextualThread({
      orderId: orderId || undefined,
      collectionId,
      articleId,
      pillarId,
      sectionId: body.sectionId?.trim() || undefined,
      source: body.source ?? 'api',
      initialMessage: body.initialMessage?.trim(),
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректное тело запроса.' }, { status: 400 });
  }
}
