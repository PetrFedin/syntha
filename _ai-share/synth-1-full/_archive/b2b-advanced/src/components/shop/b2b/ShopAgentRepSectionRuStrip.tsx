'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { SHOP_AGENT_REP_SECTION_RU_STRIP_TESTID } from '@/lib/b2b/shop-agent-rep-wave-ws';
import { fetchShopRepCommissionLedger } from '@/lib/shop/shop-rep-commission-ledger-store';
import { fetchShopRepOfflineDrafts } from '@/lib/shop/shop-rep-offline-drafts-store';

type Props = {
  repId: string;
};

/** Wave WS: единая RU-полоса секции shop-co-agent-rep (ledger + PG sync queue, без дублей). */
export function ShopAgentRepSectionRuStrip({ repId }: Props) {
  const [ledgerMode, setLedgerMode] = useState<string>('…');
  const [ledgerTotalRub, setLedgerTotalRub] = useState(0);
  const [ledgerMessageRu, setLedgerMessageRu] = useState<string | null>(null);
  const [draftCount, setDraftCount] = useState(0);
  const [draftMode, setDraftMode] = useState<string | null>(null);
  const [draftMessageRu, setDraftMessageRu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const ledger = await fetchShopRepCommissionLedger(repId);
      setLedgerMode(ledger.storageMode);
      setLedgerTotalRub(ledger.totalCommissionRub);
      setLedgerMessageRu(ledger.messageRu || null);

      const drafts = await fetchShopRepOfflineDrafts(repId);
      setDraftCount(drafts.config.drafts.length);
      setDraftMode(drafts.storageMode ?? null);
      setDraftMessageRu(
        drafts.messageRu ??
          (drafts.storageMode === 'postgres'
            ? `Очередь в PG · ${drafts.config.drafts.length} черновик(ов).`
            : drafts.storageMode === 'unavailable'
              ? 'Очередь недоступна — нужен PostgreSQL (core fail-closed).'
              : drafts.storageMode
                ? `Очередь · ${drafts.storageMode} · ${drafts.config.drafts.length}.`
                : null)
      );
    } finally {
      setLoading(false);
    }
  }, [repId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className={hubGadget.goldenPath} data-testid={SHOP_AGENT_REP_SECTION_RU_STRIP_TESTID}>
      <Badge variant="outline" className="text-[9px] uppercase">
        Rep · PG честность
      </Badge>
      {loading ? (
        <span className="text-text-muted text-[10px]">Загрузка статуса…</span>
      ) : (
        <>
          <Badge
            variant={ledgerMode === 'postgres' ? 'secondary' : 'outline'}
            data-testid={
              ledgerMode === 'postgres'
                ? 'shop-agent-rep-workspace-ledger-storage-pg'
                : `shop-agent-rep-workspace-ledger-storage-${ledgerMode}`
            }
          >
            Ledger: {ledgerMode === 'postgres' ? 'PG' : ledgerMode} ·{' '}
            {ledgerTotalRub.toLocaleString('ru-RU')} ₽
          </Badge>
          {draftMode ? (
            <Badge
              variant={draftMode === 'postgres' ? 'secondary' : 'outline'}
              data-testid={
                draftMode === 'postgres'
                  ? 'shop-agent-rep-workspace-drafts-storage-pg'
                  : 'shop-agent-rep-workspace-drafts-storage-mode'
              }
            >
              Очередь: {draftCount} · {draftMode === 'postgres' ? 'PG' : draftMode}
            </Badge>
          ) : null}
          <Badge variant="outline" data-testid="shop-agent-rep-offline-drafts-sync-queue-badge">
            Синхр. очередь: {draftCount}
          </Badge>
          {ledgerMessageRu ? (
            <span
              className="text-text-muted text-[10px]"
              data-testid="shop-agent-rep-workspace-ledger-message-ru"
            >
              {ledgerMessageRu}
            </span>
          ) : null}
          {draftMessageRu ? (
            <span
              className="text-text-muted text-[10px]"
              data-testid="shop-agent-rep-workspace-drafts-message-ru"
            >
              {draftMessageRu}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
