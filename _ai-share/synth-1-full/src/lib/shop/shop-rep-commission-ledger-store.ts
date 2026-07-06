import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

export type ShopRepCommissionLedgerLine = {
  orderId: string;
  commissionRub: number;
  orderTotalRub: number;
  customerName?: string;
  attributedAt: string;
};

export type ShopRepCommissionLedgerSummary = {
  lines: ShopRepCommissionLedgerLine[];
  totalCommissionRub: number;
  storageMode: 'postgres' | 'file' | 'memory' | 'empty' | 'unavailable';
  messageRu: string;
};

export async function fetchShopRepCommissionLedger(
  repId: string
): Promise<ShopRepCommissionLedgerSummary> {
  const res = await fetch(
    `/api/shop/b2b/rep/commission-ledger?repId=${encodeURIComponent(repId)}`,
    { cache: 'no-store' }
  );
  const json = (await res.json()) as {
    ok?: boolean;
    lines?: ShopRepCommissionLedgerLine[];
    totalCommissionRub?: number;
    storageMode?: ShopRepCommissionLedgerSummary['storageMode'];
    messageRu?: string;
  };

  if (!res.ok || !json.ok) {
    if (isPlatformCoreMode()) {
      return {
        lines: [],
        totalCommissionRub: 0,
        storageMode: 'unavailable',
        messageRu: json.messageRu ?? 'Ledger недоступен (core fail-closed).',
      };
    }
    return {
      lines: [],
      totalCommissionRub: 0,
      storageMode: 'empty',
      messageRu: json.messageRu ?? 'Не удалось загрузить ledger.',
    };
  }

  return {
    lines: json.lines ?? [],
    totalCommissionRub: json.totalCommissionRub ?? 0,
    storageMode: json.storageMode ?? 'empty',
    messageRu: json.messageRu ?? '',
  };
}

export async function writeShopRepCommissionLedgerPayout(input: {
  repId: string;
  orderIds?: string[];
}): Promise<{
  ok: boolean;
  updatedCount: number;
  storageMode: ShopRepCommissionLedgerSummary['storageMode'];
  messageRu: string;
}> {
  const res = await fetch('/api/shop/b2b/commissions/payout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repId: input.repId,
      orderIds: input.orderIds,
      action: 'payout_request',
    }),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    updatedCount?: number;
    storageMode?: ShopRepCommissionLedgerSummary['storageMode'];
    messageRu?: string;
  };

  if (!res.ok || !json.ok) {
    return {
      ok: false,
      updatedCount: 0,
      storageMode: json.storageMode ?? (isPlatformCoreMode() ? 'unavailable' : 'empty'),
      messageRu: json.messageRu ?? 'Запись payout в ledger не удалась.',
    };
  }

  return {
    ok: true,
    updatedCount: json.updatedCount ?? 0,
    storageMode: json.storageMode ?? 'postgres',
    messageRu: json.messageRu ?? 'Payout записан в ledger.',
  };
}
