import type {
  ShopInventoryLedgerAdjustRecord,
  ShopInventoryLedgerAdjustResult,
} from '@/lib/shop/shop-inventory-ledger-adjust.types';

const DEFAULT_SHOP = 'shop1';

export async function fetchShopInventoryLedgerAdjustments(
  shopId = DEFAULT_SHOP
): Promise<ShopInventoryLedgerAdjustRecord[]> {
  const res = await fetch(
    `/api/shop/inventory/reconcile/adjust?shopId=${encodeURIComponent(shopId)}`,
    { cache: 'no-store' }
  );
  const json = (await res.json()) as {
    ok?: boolean;
    adjustments?: ShopInventoryLedgerAdjustRecord[];
  };
  if (!res.ok || !json.ok || !Array.isArray(json.adjustments)) return [];
  return json.adjustments;
}

export async function postShopInventoryLedgerAdjust(input: {
  sku: string;
  ledgerAtp: number;
  physicalOnHand: number;
  shopId?: string;
}): Promise<
  | { ok: true; result: ShopInventoryLedgerAdjustResult; storageMode?: string }
  | { ok: false; messageRu: string }
> {
  const res = await fetch('/api/shop/inventory/reconcile/adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    result?: ShopInventoryLedgerAdjustResult;
    storageMode?: string;
    messageRu?: string;
  };
  if (!res.ok || !json.ok || !json.result) {
    return { ok: false, messageRu: json.messageRu ?? 'Adjust не выполнен.' };
  }
  return { ok: true, result: json.result, storageMode: json.storageMode };
}

export async function postShopInventoryLedgerAdjustBulk(input: {
  items: { sku: string; ledgerAtp: number; physicalOnHand: number }[];
  shopId?: string;
}): Promise<
  | { ok: true; count: number; storageMode?: string; messageRu?: string }
  | { ok: false; messageRu: string }
> {
  const res = await fetch('/api/shop/inventory/reconcile/adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    count?: number;
    storageMode?: string;
    messageRu?: string;
  };
  if (!res.ok || !json.ok) {
    return { ok: false, messageRu: json.messageRu ?? 'Bulk adjust не выполнен.' };
  }
  return {
    ok: true,
    count: json.count ?? input.items.length,
    storageMode: json.storageMode,
    messageRu: json.messageRu,
  };
}

export function buildLedgerAdjustDeltaMap(
  adjustments: readonly ShopInventoryLedgerAdjustRecord[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of adjustments) {
    map.set(row.sku, (map.get(row.sku) ?? 0) + row.delta);
  }
  return map;
}
