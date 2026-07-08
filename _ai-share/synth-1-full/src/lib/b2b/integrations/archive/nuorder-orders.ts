/**
 * NuOrder API — список заказов (GET /api/orders/{status}/detail).
 * Docs: NuORDER Help · Orders Exports · List Orders by Status.
 */
import type { NuOrderConfig } from './nuorder-client';
import { nuorderServerFetchOrdersByStatus, type NuOrderUpstreamOrderRaw } from './nuorder-server';

export type NuOrderOrderLine = {
  sku?: string;
  style?: string;
  quantity?: number;
  unit_price?: number;
  [key: string]: unknown;
};

export type NuOrderOrderRaw = NuOrderUpstreamOrderRaw;

export type NuOrderOrderImported = {
  id: string;
  source: 'nuorder';
  orderNumber: string;
  status: string;
  partnerName?: string;
  createdAt: string;
  total?: number;
  currency?: string;
  lineCount?: number;
  raw?: NuOrderOrderRaw;
};

function resolveNuOrderExternalId(raw: NuOrderOrderRaw): string {
  return String(raw.order_id ?? raw._id ?? raw.id ?? raw.order_number ?? '').trim();
}

function mapNuOrderRow(raw: NuOrderOrderRaw): NuOrderOrderImported | null {
  const id = resolveNuOrderExternalId(raw);
  if (!id) return null;
  const lines = Array.isArray(raw.lines) ? raw.lines : raw.line_items;
  return {
    id,
    source: 'nuorder',
    orderNumber: String(raw.order_number ?? id),
    status: String(raw.status ?? 'approved'),
    partnerName: String(raw.company_name ?? raw.customer_name ?? '').trim() || undefined,
    createdAt: String(raw.created_at ?? new Date().toISOString()),
    total: typeof raw.total === 'number' ? raw.total : undefined,
    currency: raw.currency as string | undefined,
    lineCount: Array.isArray(lines) ? lines.length : 0,
    raw,
  };
}

/** Загрузить заказы из NuOrder upstream (OAuth 1.0). */
export async function nuorderFetchOrders(
  config?: NuOrderConfig | null,
  options?: { status?: string; limit?: number }
): Promise<NuOrderOrderImported[]> {
  if (!config?.consumerKey || !config.oauthToken) return [];
  const status = options?.status?.trim() || 'approved';
  const limit = Math.min(50, Math.max(1, options?.limit ?? 20));

  const fetched = await nuorderServerFetchOrdersByStatus(config, { status, limit });
  if (!fetched.success) return [];

  return fetched.orders
    .map(mapNuOrderRow)
    .filter((row): row is NuOrderOrderImported => row != null)
    .slice(0, limit);
}
