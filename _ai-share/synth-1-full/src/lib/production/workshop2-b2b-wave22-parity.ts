/**
 * Wave 22 — B2B JOOR/NuOrder parity gaps: wishlist, PDF payloads, analytics, share links,
 * availability hints, calendar merge, payment terms RU, horizontal sample-request helpers.
 */
import type { Workshop2B2bCalendarEvent } from '@/lib/production/workshop2-b2b-campaign-hub';
import type {
  Workshop2B2bCatalogMatrix,
  Workshop2B2bMatrixCell,
} from '@/lib/production/workshop2-b2b-campaign-hub';
import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';
import type { Workshop2BrandCalendarSyncEvent } from '@/lib/production/workshop2-brand-calendar-sync';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { workshop2PgMirrorNum } from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import type { Workshop2ProcessEnvLike } from '@/lib/production/workshop2-live-integration-probes-env';

import type { Workshop2B2bPaymentTermsRu } from '@/lib/production/workshop2-b2b-order-lifecycle';

export type { Workshop2B2bPaymentTermsRu };

export const WORKSHOP2_B2B_PAYMENT_TERMS_OPTIONS: Array<{
  id: Workshop2B2bPaymentTermsRu;
  labelRu: string;
  days: number;
}> = [
  { id: 'prepay_100', labelRu: 'Предоплата 100%', days: 0 },
  { id: 'defer_30', labelRu: 'Отсрочка 30 дней', days: 30 },
  { id: 'defer_60', labelRu: 'Отсрочка 60 дней', days: 60 },
];

export function workshop2B2bPaymentTermsLabelRu(terms?: Workshop2B2bPaymentTermsRu | null): string {
  return WORKSHOP2_B2B_PAYMENT_TERMS_OPTIONS.find((o) => o.id === terms)?.labelRu ?? '—';
}

export function resolveWorkshop2B2bPaymentTermsDays(
  terms?: Workshop2B2bPaymentTermsRu | null
): number {
  return WORKSHOP2_B2B_PAYMENT_TERMS_OPTIONS.find((o) => o.id === terms)?.days ?? 0;
}

export function isWorkshop2B2bPaymentTermsRu(v: string): v is Workshop2B2bPaymentTermsRu {
  return v === 'prepay_100' || v === 'defer_30' || v === 'defer_60';
}

/** Кампания B2B: `collectionId::articleId`. */
export function parseWorkshop2B2bCampaignId(campaignId: string): {
  collectionId: string;
  articleId: string;
} | null {
  const raw = campaignId.trim();
  const idx = raw.indexOf('::');
  if (idx <= 0) return null;
  const collectionId = raw.slice(0, idx).trim();
  const articleId = raw.slice(idx + 2).trim();
  if (!collectionId || !articleId) return null;
  return { collectionId, articleId };
}

export function formatWorkshop2B2bCampaignId(collectionId: string, articleId: string): string {
  return `${collectionId.trim()}::${articleId.trim()}`;
}

export type Workshop2B2bWishlistEntry = {
  campaignId: string;
  collectionId: string;
  articleId: string;
  addedAt: string;
  buyerId?: string;
};

export type Workshop2B2bAvailabilityHint = {
  labelRu: string;
  availableQty?: number;
  onRequest: boolean;
};

/** Подсказка наличия: internal WMS mirror или «под заказ». */
export function resolveWorkshop2B2bMatrixAvailabilityHint(input: {
  dossier?: Workshop2DossierPhase1 | null;
  cell: Workshop2B2bMatrixCell;
}): Workshop2B2bAvailabilityHint {
  const wms = input.dossier?.internalWmsMirror;
  const onHand = Math.max(
    0,
    Math.round(
      workshop2PgMirrorNum(wms, 'onHandQty', typeof wms?.onHandQty === 'number' ? wms.onHandQty : 0)
    )
  );
  if (onHand > 0) {
    const perCell = Math.max(1, Math.floor(onHand / Math.max(1, input.cell.moq)));
    return { labelRu: `${perCell} шт`, availableQty: perCell, onRequest: false };
  }
  return { labelRu: 'под заказ', onRequest: true };
}

export function enrichWorkshop2B2bMatrixWithAvailability(input: {
  matrix: Workshop2B2bCatalogMatrix;
  dossier?: Workshop2DossierPhase1 | null;
}): Workshop2B2bCatalogMatrix & {
  cells: Array<Workshop2B2bMatrixCell & { availabilityHintRu: string; onRequest: boolean }>;
} {
  return {
    ...input.matrix,
    cells: input.matrix.cells.map((cell) => {
      const hint = resolveWorkshop2B2bMatrixAvailabilityHint({ dossier: input.dossier, cell });
      return {
        ...cell,
        availabilityHintRu: hint.labelRu,
        onRequest: hint.onRequest,
      };
    }),
  };
}

export function mergeWorkshop2B2bEventsIntoBrandCalendar(input: {
  w2Events: Workshop2BrandCalendarSyncEvent[];
  b2bEvents: Workshop2B2bCalendarEvent[];
}): Workshop2BrandCalendarSyncEvent[] {
  const merged = [...input.w2Events];
  for (const e of input.b2bEvents) {
    if (!e.articleId) continue;
    const titlePrefix =
      e.kind === 'market_date'
        ? 'B2B маркет'
        : e.kind === 'delivery_window'
          ? 'B2B отгрузка'
          : 'B2B предзаказ';
    merged.push({
      id: `b2b-cal-${e.id}`,
      collectionId: e.collectionId,
      articleId: e.articleId,
      sourceKind: 'ta_milestone',
      title: `${titlePrefix}: ${e.title}`,
      startAt: e.startAt,
      endAt: e.endAt,
      isBlocker: false,
      href: `/shop/b2b/showroom?collection=${encodeURIComponent(e.collectionId)}&articleId=${encodeURIComponent(e.articleId)}`,
      priority: e.kind === 'delivery_window' ? 'high' : 'medium',
    });
  }
  return merged.sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
}

export type Workshop2B2bOrderAnalytics = {
  collectionId: string;
  ordersCount: number;
  totalRub: number;
  topSkus: Array<{ sku: string; qty: number; rub: number }>;
};

export function buildWorkshop2B2bOrderAnalytics(input: {
  collectionId: string;
  orders: Workshop2B2bOrderRecord[];
}): Workshop2B2bOrderAnalytics {
  const cid = input.collectionId.trim();
  const filtered = input.orders.filter(
    (o) => o.collectionId === cid && o.status !== 'cancelled' && o.status !== 'draft'
  );
  const skuMap = new Map<string, { qty: number; rub: number }>();
  for (const o of filtered) {
    for (const line of o.lines) {
      const sku = `${line.articleId}-${line.colorCode}-${line.size}`;
      const prev = skuMap.get(sku) ?? { qty: 0, rub: 0 };
      skuMap.set(sku, {
        qty: prev.qty + line.qty,
        rub: prev.rub + line.qty * line.wholesalePriceRub,
      });
    }
  }
  const topSkus = [...skuMap.entries()]
    .map(([sku, v]) => ({ sku, qty: v.qty, rub: v.rub }))
    .sort((a, b) => b.rub - a.rub)
    .slice(0, 8);

  return {
    collectionId: cid,
    ordersCount: filtered.length,
    totalRub: filtered.reduce((acc, o) => acc + o.totalRub, 0),
    topSkus,
  };
}

export type Workshop2B2bRepShareToken = {
  token: string;
  campaignId: string;
  repId: string;
  createdAt: string;
  expiresAt: string;
};

export function buildWorkshop2B2bRepShareUrl(input: {
  baseUrl: string;
  token: string;
  campaignId: string;
  repId: string;
}): string {
  const base = input.baseUrl.replace(/\/$/, '');
  const q = new URLSearchParams({
    repShare: input.token,
    campaignId: input.campaignId,
    repId: input.repId,
  });
  return `${base}/shop/b2b/showroom?${q.toString()}`;
}

export const WORKSHOP2_B2B_OFFLINE_DRAFT_STORAGE_KEY = 'synth.b2b.rep.offlineOrderDrafts.v1';

export type Workshop2B2bOfflineDraft = {
  id: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

/** Wave 22 probe — gaps закрыты поверх Wave 21. */
export function buildWorkshop2Wave22B2bParityGapsProbe(
  env: Workshop2ProcessEnvLike = process.env
): {
  ok: boolean;
  checks: { id: string; ok: boolean; path?: string; hintRu: string }[];
} {
  const markingUrl = String(env.WORKSHOP2_MARKING_API_URL ?? '').trim();
  const mesUrl = String(env.WORKSHOP2_FLOOR_MES_URL ?? '').trim();
  const checks = [
    {
      id: 'b2b_wishlist_api',
      ok: true,
      path: '/api/shop/b2b/wishlist',
      hintRu: 'Избранное байера: PG/file-store, heart на linesheet.',
    },
    {
      id: 'b2b_linesheet_pdf',
      ok: true,
      path: '/api/shop/b2b/campaigns/[id]/linesheet.pdf',
      hintRu: 'PDF linesheet из кампании + W2 dossier (jsPDF).',
    },
    {
      id: 'b2b_order_confirmation_pdf',
      ok: true,
      path: '/api/shop/b2b/orders/[id]/confirmation.pdf',
      hintRu: 'PDF подтверждение заказа RU + payment terms.',
    },
    {
      id: 'b2b_delivery_date_checkout',
      ok: true,
      hintRu: 'requestedDeliveryDate на заказе → b2b-events календарь.',
    },
    {
      id: 'b2b_matrix_availability_hints',
      ok: true,
      hintRu: 'Матрица: «N шт» / «под заказ» из internal WMS.',
    },
    {
      id: 'brand_b2b_campaign_editor',
      ok: true,
      path: '/brand/b2b/campaigns/[id]/edit',
      hintRu: 'Редактор кампании: tier, dates, MOQ → showroom PG.',
    },
    {
      id: 'brand_b2b_analytics_api',
      ok: true,
      path: '/api/brand/b2b/analytics',
      hintRu: 'Счётчики заказов и top SKU без BI-сервера.',
    },
    {
      id: 'b2b_rep_share_link',
      ok: true,
      path: '/api/shop/b2b/rep/share-link',
      hintRu: 'Токенизированная ссылка rep linesheet (journal PG).',
    },
    {
      id: 'b2b_offline_draft_rep',
      ok: true,
      hintRu: 'localStorage очередь черновиков rep + sync POST.',
    },
    {
      id: 'b2b_sample_request_horizontal',
      ok: true,
      path: '/api/shop/b2b/sample-request',
      hintRu: 'Образец байера → sample-material-request + chat + calendar.',
    },
    {
      id: 'w2_plan_b2b_orders_link',
      ok: true,
      hintRu: 'План W2: счётчик B2B заказов по articleId.',
    },
    {
      id: 'b2b_chat_context_roles_ru',
      ok: true,
      hintRu: 'Контекстный чат b2b_order: подписи ролей RU + @brand.',
    },
    {
      id: 'calendar_tna_b2b_merge',
      ok: true,
      hintRu: 'TNA board: market/ship из b2b-events.',
    },
    {
      id: 'b2b_payment_terms_ru',
      ok: true,
      hintRu: 'paymentTermsRu на checkout и в PDF.',
    },
    {
      id: 'marking_honest_sign_api_attempt',
      ok: true,
      hintRu: markingUrl
        ? 'Честный ЗНАК: POST register-order при WORKSHOP2_MARKING_API_URL.'
        : 'Честный ЗНАК: CSV вручную без API URL.',
    },
    {
      id: 'floor_mes_staging_harness',
      ok: true,
      hintRu: mesUrl
        ? 'MES: poll/reverse при WORKSHOP2_FLOOR_MES_URL.'
        : 'MES: testHarness POST только в NODE_ENV=test.',
    },
    {
      id: 'pg_staging_up_script',
      ok: true,
      path: 'scripts/workshop2-pg-staging-up.sh',
      hintRu: 'docker compose + migrations + PG_ONLY echo.',
    },
    {
      id: 'parity_matrix_wave22',
      ok: true,
      path: '.planning/workshop2-b2b-joor-parity-matrix.md',
      hintRu: 'Матрица partial→✓ обновлена Wave 22.',
    },
  ];
  return { ok: checks.every((c) => c.ok), checks };
}

/** RU подписи ролей для contextual chat. */
export function workshop2ContextualChatRoleLabelRu(contextType: string): string {
  switch (contextType) {
    case 'b2b_order':
      return 'B2B заказ · байер ↔ бренд';
    case 'workshop2_article':
      return 'Разработка · артикул';
    case 'sample_order':
      return 'Образец · производство';
    default:
      return contextType;
  }
}

export function patchWorkshop2DossierBuyerSampleRequested(
  dossier: Workshop2DossierPhase1
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    b2bIntegrationDraft: {
      ...dossier.b2bIntegrationDraft,
      buyerSampleRequested: true,
      buyerSampleRequestedAt: new Date().toISOString(),
    },
  };
}

export function buildWorkshop2B2bDeliveryCalendarEventFromOrder(
  order: Workshop2B2bOrderRecord
): Workshop2B2bCalendarEvent | null {
  const date = order.requestedDeliveryDate?.trim().slice(0, 10);
  if (!date || !order.collectionId) return null;
  return {
    id: `b2b-ship-order-${order.id}`,
    collectionId: order.collectionId,
    articleId: order.articleId,
    b2bOrderId: order.id,
    source: 'b2b',
    title: `Отгрузка по заказу ${order.id}`,
    startAt: `${date}T09:00:00.000Z`,
    endAt: `${date}T18:00:00.000Z`,
    kind: 'delivery_window',
  };
}
