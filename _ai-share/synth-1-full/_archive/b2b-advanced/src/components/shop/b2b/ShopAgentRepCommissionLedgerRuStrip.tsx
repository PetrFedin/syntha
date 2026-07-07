'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  fetchShopRepCommissionLedger,
  writeShopRepCommissionLedgerPayout,
  type ShopRepCommissionLedgerSummary,
} from '@/lib/shop/shop-rep-commission-ledger-store';

type Props = {
  repId: string;
  orderIds?: string[];
};

function storageLabel(mode: ShopRepCommissionLedgerSummary['storageMode']): string {
  if (mode === 'postgres') return 'PG ledger';
  if (mode === 'file') return 'File ledger';
  if (mode === 'memory') return 'Memory ledger';
  if (mode === 'unavailable') return 'Недоступно';
  return 'Пусто';
}

/** Commission ledger · PG write + RU status (Wave TE). */
export function ShopAgentRepCommissionLedgerRuStrip({ repId, orderIds }: Props) {
  const [summary, setSummary] = useState<ShopRepCommissionLedgerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchShopRepCommissionLedger(repId);
      setSummary(res);
    } finally {
      setLoading(false);
    }
  }, [repId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handlePayoutWrite = async () => {
    if (writing) return;
    setWriting(true);
    try {
      const res = await writeShopRepCommissionLedgerPayout({
        repId,
        orderIds,
      });
      setSummary((prev) => ({
        lines: prev?.lines ?? [],
        totalCommissionRub: prev?.totalCommissionRub ?? 0,
        storageMode: res.storageMode,
        messageRu: res.messageRu,
      }));
      if (res.ok) await reload();
    } finally {
      setWriting(false);
    }
  };

  const mode = summary?.storageMode ?? 'empty';

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-bg-surface2/50 px-3 py-2 text-xs"
      data-testid="shop-agent-rep-commission-ledger-ru-strip"
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        Комиссия · ledger
      </Badge>
      {loading ? (
        <span className="text-text-secondary">Загрузка ledger…</span>
      ) : (
        <>
          <Badge
            variant={mode === 'postgres' ? 'secondary' : 'outline'}
            data-testid={
              mode === 'postgres'
                ? 'shop-agent-rep-commission-ledger-storage-pg'
                : `shop-agent-rep-commission-ledger-storage-${mode}`
            }
          >
            {storageLabel(mode)}
          </Badge>
          <Badge variant="outline" data-testid="shop-agent-rep-commission-ledger-total">
            {(summary?.totalCommissionRub ?? 0).toLocaleString('ru-RU')} ₽
          </Badge>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-[10px]"
            disabled={writing || mode === 'unavailable'}
            data-testid="shop-agent-rep-commission-ledger-payout-write-btn"
            onClick={() => void handlePayoutWrite()}
          >
            {writing ? 'Запись…' : 'Записать payout в PG'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-[10px]"
            data-testid="shop-agent-rep-commission-ledger-refresh-btn"
            onClick={() => void reload()}
          >
            Обновить
          </Button>
          {summary?.messageRu ? (
            <span className="text-text-secondary" data-testid="shop-agent-rep-commission-ledger-message">
              {summary.messageRu}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
