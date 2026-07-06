'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildShopReplenishmentSession } from '@/lib/b2b/shop-replenishment-workspace';
import {
  buildIntakeAllocationPayloadFromAtpRows,
  postB2bIntakeAllocation,
} from '@/lib/b2b/intake-allocation-client';
import {
  fetchShopReplenishmentRules,
  persistShopReplenishmentRules,
} from '@/lib/shop/shop-replenishment-rules-store';
import { REPLENISHMENT_RULE_PRESETS } from '@/lib/shop/shop-replenishment-rules-presets';
import type { ReplenishmentStockRow } from '@/lib/platform/shop-replenishment-stock-atp';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

type Props = {
  buyerId: string;
  collectionId: string;
  orderId: string;
  activePresetId: string;
};

/** Rules preset → intake allocate → supplier forecast bump (cross-spine, не только link). */
export function ShopReplenishmentRulesForecastSyncStrip({
  buyerId,
  collectionId,
  orderId,
  activePresetId,
}: Props) {
  const session = buildShopReplenishmentSession({ collectionId, orderId });
  const preset = REPLENISHMENT_RULE_PRESETS.find((p) => p.id === activePresetId);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setMessage(null);
    setOk(null);
    try {
      await persistShopReplenishmentRules({ buyerId, activePresetId });
      const cfg = await fetchShopReplenishmentRules(buyerId);
      if (!cfg?.activePresetId) {
        setOk(false);
        setMessage('Не удалось сохранить preset.');
        return;
      }

      const qs = new URLSearchParams({ limit: '12', collection: collectionId });
      const atpRes = await fetch(`/api/shop/b2b/replenishment/stock-atp?${qs.toString()}`, {
        cache: 'no-store',
      });
      const atpJson = (await atpRes.json()) as { ok?: boolean; rows?: ReplenishmentStockRow[] };
      const rows = atpJson.ok === true && Array.isArray(atpJson.rows) ? atpJson.rows : [];
      if (rows.length > 0) {
        const payload = buildIntakeAllocationPayloadFromAtpRows({
          rows,
          batchId: `batch-forecast-${collectionId}-${Date.now()}`,
          orderId,
        });
        await postB2bIntakeAllocation(payload);
      }

      const confirmRes = await fetch('/api/workshop2/supplier/material-request/bulk-confirm', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId,
          b2bOrderId: orderId,
          confirmAllArticles: true,
          updatedBy: 'shop-replenishment-rules-forecast-sync',
        }),
      });
      const confirmJson = (await confirmRes.json()) as {
        ok?: boolean;
        messageRu?: string;
        confirmed?: number;
      };
      if (!confirmRes.ok || !confirmJson.ok) {
        setOk(false);
        setMessage(confirmJson.messageRu ?? 'Синхронизация прогноза: проверьте очередь PO/BOM.');
        return;
      }
      setOk(true);
      setMessage(
        confirmJson.messageRu ??
          `Preset «${preset?.titleRu ?? activePresetId}» → forecast bump (${confirmJson.confirmed ?? 0} confirmed).`
      );
    } catch {
      setOk(false);
      setMessage('Ошибка сети при sync rules → forecast.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      className="border-border-subtle space-y-2 rounded-md border bg-bg-surface2/60 px-3 py-2 text-xs"
      data-testid="shop-replenishment-rules-forecast-sync-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[9px] uppercase">
          Supplier forecast
        </Badge>
        <span className="text-text-secondary">
          Save preset → intake allocate → supplier BOM confirm → forecast SSE.
        </span>
        <Button
          type="button"
          size="sm"
          variant="default"
          className="h-7 text-[10px]"
          disabled={syncing}
          data-testid="shop-replenishment-rules-forecast-sync-btn"
          onClick={() => void handleSync()}
        >
          {syncing ? 'Sync…' : 'Sync → forecast'}
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
          <Link
            href={session.supplierForecastHref}
            data-testid="shop-replenishment-rules-forecast-link"
          >
            Open forecast
          </Link>
        </Button>
      </div>
      {message ? (
        <p
          className={ok ? 'text-text-secondary' : 'text-destructive'}
          data-testid="shop-replenishment-rules-forecast-sync-message"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
