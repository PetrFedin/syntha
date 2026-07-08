/**
 * POST sample request from B2B buyer → W2 requisition + dossier flag + chat + calendar hint.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  buildWorkshop2B2bDeliveryCalendarEventFromOrder,
  formatWorkshop2B2bCampaignId,
  patchWorkshop2DossierBuyerSampleRequested,
} from '@/lib/production/workshop2-b2b-wave22-parity';
import { WORKSHOP2_B2B_ORDER_CONTEXT_TYPE } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { appendWorkshop2ContextualMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import { createWorkshop2MaterialRequisition } from '@/lib/server/workshop2-material-requisition-repository';
import {
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';

export async function POST(req: NextRequest) {
  const auth = await guardShopB2bCheckoutRoute(req);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const collectionId = String(body.collectionId ?? '').trim();
  const articleId = String(body.articleId ?? '').trim();
  const buyerId = resolveShopCoreBuyerIdFromRequest(req, String(body.buyerId ?? ''));
  const orderId = String(body.orderId ?? '').trim();
  const note = String(body.note ?? '').trim();

  if (!collectionId || !articleId) {
    return NextResponse.json(
      { ok: false, messageRu: 'collectionId и articleId обязательны.' },
      { status: 400 }
    );
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  if (!record?.dossier) {
    return NextResponse.json(
      { ok: false, messageRu: 'Досье артикула не найдено.' },
      { status: 404 }
    );
  }

  const requisition = await createWorkshop2MaterialRequisition({
    collectionId,
    articleId,
    organizationId: 'org-brand-001',
    materialLabel: 'Образец байера (B2B)',
    quantity: 1,
    unit: 'шт',
    createdBy: buyerId,
    payload: { source: 'b2b_sample_request', orderId: orderId || undefined, note },
  });

  const nextDossier = patchWorkshop2DossierBuyerSampleRequested(record.dossier);
  await putWorkshop2ServerDossierRecord({
    collectionId,
    articleId,
    dossier: nextDossier,
    updatedBy: buyerId,
    txMeta: { eventType: 'b2b_buyer_sample_requested' },
  });

  const chatContextId = orderId || formatWorkshop2B2bCampaignId(collectionId, articleId);
  await appendWorkshop2ContextualMessage({
    contextType: orderId ? WORKSHOP2_B2B_ORDER_CONTEXT_TYPE : 'workshop2_article',
    contextId: chatContextId,
    message: `[B2B] @brand запрос образца по ${collectionId}/${articleId}${note ? `: ${note}` : ''}`,
    sender: buyerId,
    isSystem: true,
  });

  void enqueueWorkshop2DomainEvent({
    type: 'sample_order.status_changed',
    collectionId,
    articleId,
    payload: {
      status: 'requested',
      source: 'b2b_sample_request',
      buyerId,
      requisitionId: requisition.id,
      orderId: orderId || null,
    },
    dispatchNow: true,
  }).catch(() => {});

  const { bumpPlatformCoreDevelopmentStatus } =
    await import('@/lib/server/platform-core-development-status-hub');
  bumpPlatformCoreDevelopmentStatus([collectionId]);
  const { bumpPlatformCoreCommsInbox } = await import('@/lib/server/platform-core-comms-inbox-hub');
  bumpPlatformCoreCommsInbox('sample_order.status_changed');
  const { bumpPlatformCoreB2bRegistry } =
    await import('@/lib/server/platform-core-b2b-registry-hub');
  bumpPlatformCoreB2bRegistry('sample_order.status_changed');

  const calendarHint = orderId
    ? null
    : {
        campaignId: formatWorkshop2B2bCampaignId(collectionId, articleId),
        kind: 'buyer_sample',
      };

  return NextResponse.json({
    ok: true,
    requisitionId: requisition.id,
    buyerSampleRequested: true,
    calendarHint,
    calendarEvent: buildWorkshop2B2bDeliveryCalendarEventFromOrder({
      id: orderId || `sample-${requisition.id}`,
      collectionId,
      articleId,
      status: 'submitted',
      tier: 'standard',
      totalRub: 0,
      lines: [],
      requestedDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    messageRu: 'Заявка на образец создана · уведомление в чат · флаг в досье W2.',
  });
}
