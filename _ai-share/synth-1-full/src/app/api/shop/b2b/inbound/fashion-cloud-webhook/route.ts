import { NextRequest, NextResponse } from 'next/server';

import {
  buildWorkshop2B2bFashionCloudDraftOrder,
  isWorkshop2B2bFashionCloudWebhookEnabled,
  parseWorkshop2B2bFashionCloudWebhookBody,
  summarizeWorkshop2B2bFashionCloudInboundRu,
  verifyWorkshop2B2bFashionCloudWebhookHmac,
} from '@/lib/production/workshop2-b2b-fashion-cloud-inbound';
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { persistWorkshop2B2bInboundCalendarTask } from '@/lib/server/workshop2-b2b-inbound-calendar-persist';
import { buildWorkshop2B2bInboundCalendarStubEvent } from '@/lib/production/workshop2-b2b-inbound-webhook';
import { putWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';

/** POST — Fashion Cloud webhook → B2B order spine + calendar task. */
export async function POST(req: NextRequest) {
  if (!isWorkshop2B2bFashionCloudWebhookEnabled()) {
    return jsonWorkshop2ErrorRu(503, 'feature_disabled', {
      messageRu:
        'Fashion Cloud webhook отключён (WORKSHOP2_B2B_FASHION_CLOUD_WEBHOOK_ENABLED=false).',
    });
  }

  const rawBody = await req.text();
  const verify = verifyWorkshop2B2bFashionCloudWebhookHmac({
    rawBody,
    signatureHeader:
      req.headers.get('x-fc-signature') ?? req.headers.get('x-fashion-cloud-signature'),
  });
  if (!verify.ok) {
    return jsonWorkshop2ErrorRu(verify.status ?? 401, 'unauthorized', {
      messageRu: verify.messageRu ?? 'Fashion Cloud webhook: отказ авторизации.',
    });
  }

  let body: unknown;
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json', {
      messageRu: 'Некорректный JSON в теле webhook.',
    });
  }

  const payload = parseWorkshop2B2bFashionCloudWebhookBody(body);
  if (!payload) {
    return jsonWorkshop2ErrorRu(400, 'invalid_payload', {
      messageRu: 'Укажите order.id или orderNumber в теле Fashion Cloud webhook.',
    });
  }

  const order = buildWorkshop2B2bFashionCloudDraftOrder(payload);
  const persist = await putWorkshop2B2bOrder(order);
  const calendarStub = buildWorkshop2B2bInboundCalendarStubEvent(order, payload.externalOrderRef);
  const calendarPersist =
    persist.mode !== 'pg_only_blocked'
      ? await persistWorkshop2B2bInboundCalendarTask({ stub: calendarStub, order })
      : { ok: false, mode: 'failed' as const };
  const persistMode = persist.mode === 'pg_only_blocked' ? 'journal_only' : persist.mode;

  void enqueueWorkshop2DomainEvent({
    type: 'b2b.inbound_order.received',
    collectionId: order.collectionId ?? 'SS27',
    articleId: order.articleId ?? 'demo-ss27-01',
    payload: {
      provider: 'fashion_cloud',
      eventType: payload.eventType,
      externalOrderRef: payload.externalOrderRef,
      orderId: order.id,
      persistMode,
      calendarPersistMode: calendarPersist.mode,
      messageRu: summarizeWorkshop2B2bFashionCloudInboundRu({
        externalOrderRef: payload.externalOrderRef,
        orderId: order.id,
        eventType: payload.eventType,
        persistMode,
      }),
    },
    dispatchNow: true,
  }).catch(() => {
    /* best-effort */
  });

  return NextResponse.json({
    ok: true,
    provider: 'fashion_cloud',
    eventType: payload.eventType,
    orderId: order.id,
    externalOrderRef: payload.externalOrderRef,
    persistMode,
    calendarPersistMode: calendarPersist.mode,
    messageRu: summarizeWorkshop2B2bFashionCloudInboundRu({
      externalOrderRef: payload.externalOrderRef,
      orderId: order.id,
      eventType: payload.eventType,
      persistMode,
    }),
  });
}
