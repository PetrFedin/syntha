/**
 * Fashion Cloud inbound webhook → B2B wholesale spine (shop path).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

import type {
  Workshop2B2bOrderLine,
  Workshop2B2bOrderRecord,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { mapWorkshop2B2bInboundExternalRefToOrderId } from '@/lib/production/workshop2-b2b-inbound-webhook';

export function isWorkshop2B2bFashionCloudWebhookEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return (
    String(env.WORKSHOP2_B2B_FASHION_CLOUD_WEBHOOK_ENABLED ?? 'true')
      .trim()
      .toLowerCase() !== 'false'
  );
}

export function verifyWorkshop2B2bFashionCloudWebhookHmac(input: {
  rawBody: string;
  signatureHeader?: string | null;
  env?: Record<string, string | undefined>;
}): { ok: boolean; status?: 401; messageRu?: string } {
  const secret = String(
    input.env?.FASHION_CLOUD_WEBHOOK_SECRET ??
      input.env?.WORKSHOP2_B2B_FASHION_CLOUD_WEBHOOK_SECRET ??
      process.env.FASHION_CLOUD_WEBHOOK_SECRET ??
      process.env.WORKSHOP2_B2B_FASHION_CLOUD_WEBHOOK_SECRET ??
      ''
  ).trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return {
        ok: false,
        status: 401,
        messageRu:
          'Fashion Cloud webhook: задайте FASHION_CLOUD_WEBHOOK_SECRET (fail-closed в production).',
      };
    }
    return { ok: true };
  }
  const header = String(input.signatureHeader ?? '').trim();
  if (!header) {
    return {
      ok: false,
      status: 401,
      messageRu: 'Fashion Cloud webhook: заголовок x-fc-signature обязателен.',
    };
  }
  const expected = createHmac('sha256', secret).update(input.rawBody).digest('hex');
  try {
    const a = Buffer.from(header.replace(/^sha256=/, ''));
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, status: 401, messageRu: 'Fashion Cloud webhook: неверная подпись.' };
    }
  } catch {
    return { ok: false, status: 401, messageRu: 'Fashion Cloud webhook: неверная подпись.' };
  }
  return { ok: true };
}

export type Workshop2B2bFashionCloudInboundPayload = {
  externalOrderRef: string;
  eventType: string;
  collectionId?: string;
  articleId?: string;
  buyerId?: string;
  brandId?: string;
  lines?: Workshop2B2bOrderLine[];
  requestedDeliveryDate?: string;
};

function parseLines(raw: unknown): Workshop2B2bOrderLine[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const lines: Workshop2B2bOrderLine[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const qty = Number(r.quantity ?? r.qty ?? 0);
    if (!Number.isFinite(qty) || qty <= 0) continue;
    lines.push({
      collectionId: String(r.collectionId ?? 'SS27'),
      articleId: String(r.articleId ?? r.sku ?? 'demo-ss27-01'),
      colorCode: String(r.colorCode ?? r.color ?? '001'),
      size: String(r.size ?? 'M'),
      qty: Math.floor(qty),
      wholesalePriceRub: Number(r.wholesalePriceRub ?? r.priceRub ?? 0) || 0,
      lineNote: r.lineNote != null ? String(r.lineNote) : undefined,
    });
  }
  return lines.length ? lines : undefined;
}

/** Parse Fashion Cloud webhook JSON (order.created | order.updated | draft.*). */
export function parseWorkshop2B2bFashionCloudWebhookBody(
  body: unknown
): Workshop2B2bFashionCloudInboundPayload | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const eventType = String(b.type ?? b.event ?? b.eventType ?? 'order.created').trim();
  const order =
    b.order && typeof b.order === 'object'
      ? (b.order as Record<string, unknown>)
      : b.data && typeof b.data === 'object'
        ? (b.data as Record<string, unknown>)
        : b;
  const externalOrderRef = String(
    order.id ?? order.orderNumber ?? b.externalOrderRef ?? b.orderId ?? ''
  ).trim();
  if (!externalOrderRef) return null;

  return {
    externalOrderRef,
    eventType,
    collectionId: String(order.collectionId ?? b.collectionId ?? 'SS27').trim() || 'SS27',
    articleId: String(order.articleId ?? b.articleId ?? 'demo-ss27-01').trim() || 'demo-ss27-01',
    buyerId: String(order.buyerId ?? b.buyerId ?? 'fashion-cloud-buyer').trim(),
    brandId: String(order.brandId ?? b.brandId ?? 'syntha-lab').trim(),
    lines: parseLines(order.lines ?? b.lines),
    requestedDeliveryDate:
      typeof order.requestedDeliveryDate === 'string'
        ? order.requestedDeliveryDate
        : typeof b.requestedDeliveryDate === 'string'
          ? b.requestedDeliveryDate
          : undefined,
  };
}

export function buildWorkshop2B2bFashionCloudDraftOrder(
  payload: Workshop2B2bFashionCloudInboundPayload
): Workshop2B2bOrderRecord {
  const now = new Date().toISOString();
  const lines = payload.lines ?? [
    {
      collectionId: payload.collectionId ?? 'SS27',
      articleId: payload.articleId ?? 'demo-ss27-01',
      colorCode: '001',
      size: 'M',
      qty: 1,
      wholesalePriceRub: 0,
    },
  ];
  const totalRub = lines.reduce((s, l) => s + l.qty * l.wholesalePriceRub, 0);
  return {
    id: mapWorkshop2B2bInboundExternalRefToOrderId(`fc:${payload.externalOrderRef}`),
    collectionId: payload.collectionId ?? 'SS27',
    articleId: payload.articleId ?? 'demo-ss27-01',
    buyerId: payload.buyerId ?? 'fashion-cloud-buyer',
    brandId: payload.brandId,
    status: payload.eventType.includes('draft') ? 'draft' : 'submitted',
    tier: 'standard',
    totalRub,
    lines,
    requestedDeliveryDate: payload.requestedDeliveryDate,
    createdAt: now,
    updatedAt: now,
  };
}

export function summarizeWorkshop2B2bFashionCloudInboundRu(input: {
  externalOrderRef: string;
  orderId: string;
  eventType: string;
  persistMode: string;
}): string {
  return `[Fashion Cloud] ${input.eventType}: ${input.externalOrderRef} → ${input.orderId} (${input.persistMode}).`;
}
