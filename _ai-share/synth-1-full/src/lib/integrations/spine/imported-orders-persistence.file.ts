/**
 * Импортированные wholesale-заказы (merge в operational list, Wave C1 pattern).
 */
import 'server-only';

import fs from 'fs';
import path from 'path';
import type { B2BOrder } from '@/lib/types';
import type { B2BOrderLineItem } from '@/lib/order/b2b-order-payload';
import { isSpineOperationalPgEnabled } from './spine-operational-persistence.pg';

export type ImportedOperationalOrderRecord = {
  wholesaleOrderId: string;
  order: B2BOrder;
  lineItems: B2BOrderLineItem[];
  importedAt: string;
};

export type ImportedOrdersFileV1 = {
  schemaVersion: 1;
  orders: Record<string, ImportedOperationalOrderRecord>;
  externalIndex: Record<string, string>;
};

const EMPTY: ImportedOrdersFileV1 = {
  schemaVersion: 1,
  orders: {},
  externalIndex: {},
};

export function getImportedOrdersFilePath(): string {
  const fromEnv = process.env.B2B_IMPORTED_ORDERS_FILE?.trim();
  if (fromEnv) return fromEnv;
  return path.join(process.cwd(), 'data', 'b2b-imported-orders.json');
}

function load(): ImportedOrdersFileV1 {
  try {
    const raw = fs.readFileSync(getImportedOrdersFilePath(), 'utf8');
    const j = JSON.parse(raw) as ImportedOrdersFileV1;
    if (j?.schemaVersion !== 1 || typeof j.orders !== 'object') return { ...EMPTY };
    return {
      schemaVersion: 1,
      orders: j.orders ?? {},
      externalIndex: j.externalIndex ?? {},
    };
  } catch {
    return { ...EMPTY };
  }
}

function isImportedOrdersPgPrimaryWrite(): boolean {
  return process.env.SPINE_OPERATIONAL_PG_PRIMARY === '1' && isSpineOperationalPgEnabled();
}

function persistImportedOrdersToFile(data: ImportedOrdersFileV1): void {
  const p = getImportedOrdersFilePath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  void import('./imported-orders-persistence.pg')
    .then((m) => m.mirrorImportedOrdersSnapshotToPg(data))
    .catch(() => {});
}

function save(data: ImportedOrdersFileV1): void {
  if (isImportedOrdersPgPrimaryWrite()) {
    void import('./imported-orders-persistence.pg')
      .then((m) => m.mirrorImportedOrdersSnapshotToPg(data))
      .catch(() => {});
    return;
  }
  persistImportedOrdersToFile(data);
}

export function getImportedOrderExternalKey(wholesaleOrderId: string): string | undefined {
  const data = load();
  const id = wholesaleOrderId.trim();
  return Object.entries(data.externalIndex).find(([, v]) => v === id)?.[0];
}

export function findImportedOrderByExternalKey(
  platform: string,
  externalOrderId: string
): ImportedOperationalOrderRecord | undefined {
  const key = `${platform}:${externalOrderId}`;
  const wholesaleOrderId = load().externalIndex[key];
  if (!wholesaleOrderId) return undefined;
  return load().orders[wholesaleOrderId];
}

export function upsertImportedOrder(
  record: ImportedOperationalOrderRecord,
  externalKey: string
): void {
  if (isImportedOrdersPgPrimaryWrite()) {
    void import('./imported-orders-persistence.pg')
      .then((m) => m.upsertSpineImportedOrderToPg(record, externalKey))
      .catch(() => {});
    return;
  }
  const data = load();
  data.orders[record.wholesaleOrderId] = record;
  data.externalIndex[externalKey] = record.wholesaleOrderId;
  persistImportedOrdersToFile(data);
}

export function listImportedOrdersAsB2B(): B2BOrder[] {
  return Object.values(load().orders).map((r) => r.order);
}

export function getImportedLineItems(wholesaleOrderId: string): B2BOrderLineItem[] | undefined {
  const rec = load().orders[wholesaleOrderId];
  return rec?.lineItems;
}

export function getImportedOrderRecord(
  wholesaleOrderId: string
): ImportedOperationalOrderRecord | undefined {
  return load().orders[wholesaleOrderId.trim()];
}

/** Upstream discovery: импортированные заказы платформы (mirror JOOR archive pattern). */
export function listImportedOrdersForPlatform(platform: string): Array<Record<string, unknown>> {
  const plat = platform.trim().toLowerCase();
  if (!plat) return [];
  const data = load();
  const out: Array<Record<string, unknown>> = [];
  for (const [extKey, wholesaleOrderId] of Object.entries(data.externalIndex)) {
    if (!extKey.startsWith(`${plat}:`)) continue;
    const rec = data.orders[wholesaleOrderId];
    if (!rec) continue;
    const externalOrderId = extKey.slice(plat.length + 1);
    const orderExt = rec.order as {
      buyerName?: string;
      buyer?: string;
      shop?: string;
      shopName?: string;
    };
    out.push({
      id: externalOrderId,
      externalOrderId,
      wholesaleOrderId,
      status: rec.order.status,
      customer_name: orderExt.buyerName ?? orderExt.buyer ?? orderExt.shopName ?? orderExt.shop,
      lines: rec.lineItems,
      importedAt: rec.importedAt,
      _source: 'spine_mirror',
    });
  }
  return out.sort((a, b) => String(b.importedAt ?? '').localeCompare(String(a.importedAt ?? '')));
}

export function patchImportedOrderStatus(wholesaleOrderId: string, status: string): void {
  patchImportedOrderFields(wholesaleOrderId, { status });
}

export function patchImportedOrderFields(wholesaleOrderId: string, patch: Partial<B2BOrder>): void {
  const data = load();
  const id = wholesaleOrderId.trim();
  const rec = data.orders[id];
  if (!rec) return;
  rec.order = { ...rec.order, ...patch };
  data.orders[id] = rec;
  save(data);
}
