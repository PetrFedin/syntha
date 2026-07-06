'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { buildShopReplenishmentSession } from '@/lib/b2b/shop-replenishment-workspace';
import { ShopReplenishmentRulesForecastSyncStrip } from '@/components/shop/replenishment/ShopReplenishmentRulesForecastSyncStrip';
import {
  REPLENISHMENT_RULE_PRESETS,
  type ReplenishmentRulePreset,
} from '@/lib/shop/shop-replenishment-rules-presets';
import {
  fetchShopReplenishmentRules,
  persistShopReplenishmentRules,
} from '@/lib/shop/shop-replenishment-rules-store';
import {
  buildIntakeAllocationPayloadFromAtpRows,
  postB2bIntakeAllocation,
  type IntakeAllocationResult,
} from '@/lib/b2b/intake-allocation-client';
import type { ReplenishmentStockRow } from '@/lib/platform/shop-replenishment-stock-atp';
import { cn } from '@/lib/utils';

export type { ReplenishmentRulePreset };
export { REPLENISHMENT_RULE_PRESETS };

type Props = {
  collectionId?: string;
  orderId?: string;
};

export function ShopReplenishmentRulesPanel({ collectionId, orderId }: Props) {
  const { buyerId } = useShopCoreBuyerId();
  const session = useMemo(
    () => buildShopReplenishmentSession({ collectionId, orderId }),
    [collectionId, orderId]
  );
  const [activePresetId, setActivePresetId] = useState(REPLENISHMENT_RULE_PRESETS[0]?.id ?? '');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [allocateResult, setAllocateResult] = useState<IntakeAllocationResult | null>(null);
  const [allocateError, setAllocateError] = useState<string | null>(null);

  useEffect(() => {
    void fetchShopReplenishmentRules(buyerId).then((cfg) => {
      if (cfg?.activePresetId) {
        setActivePresetId(cfg.activePresetId);
        setSavedAt(cfg.updatedAt);
      }
    });
    void fetch(`/api/shop/b2b/replenishment/rules?buyerId=${encodeURIComponent(buyerId)}`, {
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((json: { storageMode?: string }) => {
        if (json.storageMode) setStorageMode(json.storageMode);
      })
      .catch(() => undefined);
  }, [buyerId]);

  const save = async () => {
    setBusy(true);
    try {
      const saved = await persistShopReplenishmentRules({ buyerId, activePresetId });
      setActivePresetId(saved.config.activePresetId);
      setSavedAt(saved.config.updatedAt);
      if (saved.storageMode) setStorageMode(saved.storageMode);
    } finally {
      setBusy(false);
    }
  };

  const activePreset = REPLENISHMENT_RULE_PRESETS.find((p) => p.id === activePresetId);

  const saveAndAllocate = async () => {
    setBusy(true);
    setAllocating(true);
    setAllocateError(null);
    setAllocateResult(null);
    try {
      const saved = await persistShopReplenishmentRules({ buyerId, activePresetId });
      setActivePresetId(saved.config.activePresetId);
      setSavedAt(saved.config.updatedAt);
      if (saved.storageMode) setStorageMode(saved.storageMode);

      const qs = new URLSearchParams({ limit: '12' });
      if (collectionId) qs.set('collection', collectionId);
      const atpRes = await fetch(`/api/shop/b2b/replenishment/stock-atp?${qs.toString()}`, {
        cache: 'no-store',
      });
      const atpJson = (await atpRes.json()) as {
        ok?: boolean;
        rows?: ReplenishmentStockRow[];
      };
      const rows = atpJson.ok === true && Array.isArray(atpJson.rows) ? atpJson.rows : [];
      if (rows.length === 0) {
        setAllocateError('Нет ATP строк — откройте Stock·ATP или проверьте коллекцию.');
        return;
      }
      const batchId = `batch-rules-${session.collectionId}-${Date.now()}`;
      const payload = buildIntakeAllocationPayloadFromAtpRows({
        rows,
        batchId,
        orderId: session.orderId,
      });
      const result = await postB2bIntakeAllocation(payload);
      setAllocateResult(result);
    } catch (err: unknown) {
      setAllocateError(err instanceof Error ? err.message : 'Ошибка save+allocate');
    } finally {
      setBusy(false);
      setAllocating(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="shop-replenishment-feature-rules">
      <ShopReplenishmentRulesForecastSyncStrip
        buyerId={buyerId}
        collectionId={session.collectionId}
        orderId={session.orderId}
        activePresetId={activePresetId}
      />
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-text-secondary text-sm">
          Onfinity preset · сохранение через API
          {storageMode === 'pg' ? ' (PostgreSQL)' : ''}.
        </p>
        {savedAt ? (
          <Badge variant="outline" className="text-[10px]">
            saved {new Date(savedAt).toLocaleString('ru-RU')}
          </Badge>
        ) : null}
        {storageMode ? (
          <Badge variant="secondary" className="text-[10px] uppercase">
            {storageMode}
          </Badge>
        ) : null}
        <Button
          size="sm"
          onClick={() => void save()}
          disabled={busy}
          data-testid="shop-replenishment-rules-save"
        >
          {busy ? 'Сохранение…' : 'Сохранить preset'}
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.stockAtpHref}>Stock · ATP</Link>
        </Button>
        <Button
          size="sm"
          variant="secondary"
          type="button"
          disabled={busy || allocating}
          onClick={() => void saveAndAllocate()}
          data-testid="shop-replenishment-rules-save-allocate-run"
        >
          {allocating ? 'Save + allocate…' : 'Save preset → allocate'}
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.stockAtpHref} data-testid="shop-replenishment-rules-atp-intake-link">
            ATP · intake
          </Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.alertsHref}>Алерты</Link>
        </Button>
      </div>

      {activePreset ? (
        <p className="text-text-muted text-xs" data-testid="shop-replenishment-rules-active-summary">
          Активно: <strong>{activePreset.titleRu}</strong> · {activePreset.summaryRu}
        </p>
      ) : null}

      {allocateResult?.planId ? (
        <p
          className="text-emerald-800 text-xs"
          data-testid="shop-replenishment-rules-allocate-result"
        >
          План {allocateResult.planId} · allocations{' '}
          {allocateResult.allocations?.length ?? 0}
        </p>
      ) : null}
      {allocateError ? (
        <p className="text-amber-800 text-xs" data-testid="shop-replenishment-rules-allocate-error">
          {allocateError}
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {REPLENISHMENT_RULE_PRESETS.map((preset) => {
          const active = preset.id === activePresetId;
          return (
            <Card
              key={preset.id}
              className={cn(
                'border-border-subtle cursor-pointer transition-colors',
                active && 'border-accent-primary ring-1 ring-accent-primary/30'
              )}
              onClick={() => setActivePresetId(preset.id)}
              data-testid={`shop-replenishment-rule-preset-${preset.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">{preset.titleRu}</CardTitle>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {preset.kind}
                  </Badge>
                  {active ? <Badge className="text-[10px]">active</Badge> : null}
                </div>
                <CardDescription className="text-xs">{preset.summaryRu}</CardDescription>
              </CardHeader>
              <CardContent>
                {active ? (
                  <Button size="sm" variant="outline" asChild onClick={(e) => e.stopPropagation()}>
                    <Link href={session.matrixHref}>В матрицу</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
