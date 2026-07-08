/**
 * Wave C1: import external wholesale orders → Syntha wholesaleOrderId + integration meta.
 */
import 'server-only';

import type { JoorOrderRaw } from '@/lib/b2b/integrations/archive/joor-orders';
import type { B2BOrderLineItem } from '@/lib/order/b2b-order-payload';
import type { B2BOrder } from '@/lib/types';
import {
  findImportedOrderByExternalKey,
  upsertImportedOrder,
  type ImportedOperationalOrderRecord,
} from './imported-orders-persistence';
import { upsertIntegrationMetaForOrder } from './integration-meta-persistence.file';
import { upsertExternalRef } from './integration-external-refs-persistence.file';
import {
  type IntegrationPlatform,
  isWholesaleImportPlatform,
  mapExternalOrderStatus,
  wholesaleOrderIdForExternalImport,
} from './integration-platform';
import { DEMO_BRAND_SYNTHA_LAB, normalizeDemoBrandName } from '@/lib/data/demo-platform-brands';
import { organizations } from '@/components/team/_fixtures/team-data';
import { WORKSHOP2_DEFAULT_TZ_BRAND_ORG_ID } from '@/lib/production/workshop2-tz-signatory-options';

export type OrderImportOutcome = {
  wholesaleOrderId: string;
  externalOrderId: string;
  platform: IntegrationPlatform;
  status: string;
  created: boolean;
  warnings: string[];
};

function unwrapImportPayload(raw: Record<string, unknown>): Record<string, unknown> {
  const nested = raw.raw;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...raw, ...(nested as Record<string, unknown>) };
  }
  return raw;
}

function linesFromJoor(raw: JoorOrderRaw): B2BOrderLineItem[] {
  const lines = Array.isArray(raw.lines) ? raw.lines : [];
  return lines.map((l, i) => ({
    productId: String(l.style_id ?? l.sku ?? `line-${i}`),
    size: 'M',
    quantity: typeof l.quantity === 'number' ? l.quantity : 1,
    price: typeof l.unit_price === 'number' ? l.unit_price : 0,
    currency: 'USD',
  }));
}

function b2bOrderFromJoor(
  raw: JoorOrderRaw,
  wholesaleOrderId: string,
  status: string,
  brandName: string
): B2BOrder {
  const partner = String(raw.customer_name ?? 'Оптовый партнёр');
  const total = typeof raw.total === 'number' ? raw.total : 0;
  return {
    order: wholesaleOrderId,
    status,
    shop: partner,
    brand: brandName,
    amount: total > 0 ? `$${total.toLocaleString('en-US')}` : '—',
    date: String(raw.created_at ?? new Date().toISOString()).slice(0, 10),
    deliveryDate: '—',
    orderMode: 'buy_now',
  };
}

function normalizeJoorPayload(order: Record<string, unknown>): JoorOrderRaw {
  return order as JoorOrderRaw;
}

function normalizeGenericPayload(
  platform: IntegrationPlatform,
  order: Record<string, unknown>
): {
  id: string;
  status?: string;
  lines?: unknown[];
  total?: number;
  created_at?: string;
  customer_name?: string;
} {
  const id = String(order.id ?? order._id ?? order.orderId ?? '');
  return {
    id,
    status: order.status as string | undefined,
    lines: Array.isArray(order.lines) ? order.lines : undefined,
    total: typeof order.total === 'number' ? order.total : undefined,
    created_at: order.created_at as string | undefined,
    customer_name: (order.customer_name ?? order.company_name) as string | undefined,
  };
}

/** Бренд импорта: payload → org header → demo fallback (не hardcode DEMO_BRAND_*). */
export function resolveSpineImportBrandName(input?: {
  organizationId?: string;
  brandFromPayload?: string;
}): string {
  const fromPayload = normalizeDemoBrandName(input?.brandFromPayload);
  if (fromPayload) return fromPayload;
  const orgId = input?.organizationId?.trim() || WORKSHOP2_DEFAULT_TZ_BRAND_ORG_ID;
  const orgName = organizations[orgId]?.name?.trim();
  if (orgName) return orgName;
  return DEMO_BRAND_SYNTHA_LAB;
}

export function importWholesaleOrder(params: {
  platform: IntegrationPlatform;
  externalOrderId: string;
  raw?: Record<string, unknown>;
  dryRun?: boolean;
  organizationId?: string;
}): OrderImportOutcome {
  const { platform, externalOrderId, raw, dryRun, organizationId } = params;
  const warnings: string[] = [];

  if (!isWholesaleImportPlatform(platform)) {
    throw new Error(`Platform ${platform} does not support wholesale order import`);
  }

  const externalKey = `${platform}:${externalOrderId}`;
  const existing = findImportedOrderByExternalKey(platform, externalOrderId);
  const wholesaleOrderId =
    existing?.wholesaleOrderId ?? wholesaleOrderIdForExternalImport(platform, externalOrderId);

  let externalStatus = 'draft';
  let lineItems: B2BOrderLineItem[] = [];
  let order: B2BOrder;
  const brandName = resolveSpineImportBrandName({
    organizationId,
    brandFromPayload:
      raw && typeof raw.brand === 'string'
        ? raw.brand
        : raw && typeof raw.brand_name === 'string'
          ? raw.brand_name
          : undefined,
  });

  if (platform === 'joor' && raw) {
    const joor = normalizeJoorPayload(raw);
    externalStatus = String(joor.status ?? 'draft');
    lineItems = linesFromJoor(joor);
    if (lineItems.length === 0) warnings.push('No line items in import payload');
    order = b2bOrderFromJoor(
      joor,
      wholesaleOrderId,
      mapExternalOrderStatus(platform, externalStatus),
      brandName
    );
  } else if (raw) {
    const g = normalizeGenericPayload(platform, raw);
    externalStatus = String(g.status ?? 'draft');
    lineItems =
      Array.isArray(g.lines) && g.lines.length > 0
        ? (g.lines as Array<Record<string, unknown>>).map((l, i) => ({
            productId: String(l.sku ?? l.style_id ?? `line-${i}`),
            size: 'M',
            quantity: typeof l.quantity === 'number' ? l.quantity : 1,
            price:
              typeof l.unit_price === 'number'
                ? l.unit_price
                : typeof l.price === 'number'
                  ? l.price
                  : 0,
            currency: 'USD',
          }))
        : [];
    order = {
      order: wholesaleOrderId,
      status: mapExternalOrderStatus(platform, externalStatus),
      shop: String(g.customer_name ?? 'Оптовый партнёр'),
      brand: brandName,
      amount: g.total ? `$${g.total}` : '—',
      date: String(g.created_at ?? new Date().toISOString()).slice(0, 10),
      deliveryDate: '—',
    };
  } else {
    externalStatus = 'draft';
    order = {
      order: wholesaleOrderId,
      status: mapExternalOrderStatus(platform, externalStatus),
      shop: 'Импорт B2B-канала',
      brand: brandName,
      amount: '—',
      date: new Date().toISOString().slice(0, 10),
      deliveryDate: '—',
    };
    warnings.push('Stub import without payload body');
  }

  const created = !existing;

  if (!dryRun) {
    const record: ImportedOperationalOrderRecord = {
      wholesaleOrderId,
      order,
      lineItems,
      importedAt: new Date().toISOString(),
    };
    upsertImportedOrder(record, externalKey);
    upsertIntegrationMetaForOrder(wholesaleOrderId, {
      sourcePlatform: platform,
      externalOrderId,
      externalStatus,
      lastSyncedAt: new Date().toISOString(),
      syncHealth: warnings.length ? 'degraded' : 'ok',
    });
    upsertExternalRef({
      platform,
      externalId: externalOrderId,
      synthaEntityType: 'wholesale_order',
      synthaEntityId: wholesaleOrderId,
      lastSyncedAt: new Date().toISOString(),
      syncDirection: 'inbound',
    });
  }

  return {
    wholesaleOrderId,
    externalOrderId,
    platform,
    status: order.status,
    created,
    warnings,
  };
}

export function importWholesaleOrdersBatch(params: {
  platform: IntegrationPlatform;
  orders: Record<string, unknown>[];
  dryRun?: boolean;
  organizationId?: string;
}): OrderImportOutcome[] {
  return params.orders.map((row) => {
    const raw = unwrapImportPayload(row);
    const externalOrderId = String(raw.id ?? raw._id ?? raw.orderId ?? '');
    if (!externalOrderId) {
      return {
        wholesaleOrderId: '',
        externalOrderId: '',
        platform: params.platform,
        status: 'error',
        created: false,
        warnings: ['Missing external order id'],
      };
    }
    return importWholesaleOrder({
      platform: params.platform,
      externalOrderId,
      raw,
      dryRun: params.dryRun,
      organizationId: params.organizationId,
    });
  });
}
