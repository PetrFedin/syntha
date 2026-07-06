'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WidgetCard } from '@/components/ui/widget-card';
import { EmptyStateB2B } from '@/components/ui/empty-state-b2b';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCustomerGroups } from '@/lib/b2b/customer-groups';
import { PRICE_TIER_LABELS } from '@/lib/b2b/price-tiers';
import {
  fetchBrandPricelistTierSync,
  pushBrandPricelistTierSync,
} from '@/lib/b2b/brand-pricelist-tier-sync-store';
import { summarizeBrandPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync';
import {
  fetchBrandPricelistVersions,
  patchBrandPricelistVersion,
  publishBrandPricelist,
  refreshBrandPricelistVersions,
} from '@/lib/b2b/brand-pricelist-versions-store';
import { filterBrandPricelistVersions } from '@/lib/b2b/brand-pricelist-versions-feed';
import { buildBrandPricelistSession, brandPricelistFeatureHref } from '@/lib/b2b/brand-pricelist-workspace';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import type { PriceTierId } from '@/lib/b2b/price-tiers';
import type { BrandPricelistVersionRow } from '@/lib/b2b/brand-pricelist-versions-feed';
import { DollarSign, Loader2 } from 'lucide-react';
import { BrandPricelistVersionDiffStrip } from '@/components/brand/b2b/BrandPricelistVersionDiffStrip';

type Props = {
  groupFilter?: string | null;
  collectionId?: string;
};

export function BrandPricelistVersionsPanel({
  groupFilter,
  collectionId = PLATFORM_CORE_DEMO.collectionId,
}: Props) {
  const groups = getCustomerGroups();
  const session = buildBrandPricelistSession({ collectionId, groupId: groupFilter ?? undefined });
  const [allRows, setAllRows] = useState<BrandPricelistVersionRow[]>([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, channels: 0 });
  const [storageMode, setStorageMode] = useState('demo');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [publishBusyId, setPublishBusyId] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const filtered = useMemo(
    () => filterBrandPricelistVersions(allRows, groupFilter),
    [allRows, groupFilter]
  );

  const reload = useCallback(async () => {
    const res = await fetchBrandPricelistVersions(collectionId);
    setAllRows(res.rows ?? []);
    setSummary({
      total: res.summary?.total ?? 0,
      active: res.summary?.active ?? 0,
      channels: res.summary?.channels ?? 0,
    });
    setStorageMode(res.storageMode ?? 'demo');
  }, [collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveMultiplier = async (row: BrandPricelistVersionRow, value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setBusyId(row.id);
    try {
      const res = await patchBrandPricelistVersion({
        collectionId,
        id: row.id,
        multiplier: parsed,
      });
      if (res.ok && res.rows) {
        setAllRows(res.rows);
        setSummary({
          total: res.summary?.total ?? summary.total,
          active: res.summary?.active ?? summary.active,
          channels: res.summary?.channels ?? summary.channels,
        });
        setStorageMode(res.storageMode ?? storageMode);
      }
    } finally {
      setBusyId(null);
    }
  };

  const syncVersions = async () => {
    setSyncBusy(true);
    try {
      const res = await refreshBrandPricelistVersions(collectionId);
      if (res.ok && res.rows) {
        setAllRows(res.rows);
        setSummary({
          total: res.summary?.total ?? 0,
          active: res.summary?.active ?? 0,
          channels: res.summary?.channels ?? 0,
        });
        setStorageMode(res.storageMode ?? storageMode);
      } else {
        await reload();
      }
    } finally {
      setSyncBusy(false);
    }
  };

  const publishVersion = async (row: BrandPricelistVersionRow) => {
    setPublishBusyId(row.id);
    try {
      await publishBrandPricelist({ collectionId, id: row.id });
      await reload();
    } finally {
      setPublishBusyId(null);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-pricelist-versions-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Total: {summary.total}</Badge>
        <Badge variant="outline">Active: {summary.active}</Badge>
        <Badge variant="outline">Channels: {summary.channels}</Badge>
        <Badge variant="outline" data-testid={`brand-pricelist-versions-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG pricelist' : `${storageMode} pricelist`}
        </Badge>
        <Button variant="outline" size="sm" type="button" onClick={() => void reload()}>
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={syncBusy}
          onClick={() => void syncVersions()}
          data-testid="brand-pricelist-versions-sync"
        >
          {syncBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sync seed'}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant={!groupFilter ? 'default' : 'outline'} size="sm" asChild>
          <Link href={session.versionsHref}>Все</Link>
        </Button>
        {groups.map((g) => (
          <Button
            key={g.id}
            variant={groupFilter === g.id ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={brandPricelistFeatureHref('versions', collectionId, g.id)}>{g.nameRu}</Link>
          </Button>
        ))}
      </div>
      <WidgetCard title="Прайс-листы" description="Версии по каналу и периоду · persisted PG/file.">
        {filtered.length === 0 ? (
          <EmptyStateB2B
            icon={DollarSign}
            title="Нет прайсов"
            description="Выберите другую группу или sync seed."
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href={session.tiersHref}>Группы клиентов</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">×</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((pl) => (
                  <TableRow key={pl.id} data-testid={`brand-pricelist-version-row-${pl.id}`}>
                    <TableCell className="text-sm">{pl.name}</TableCell>
                    <TableCell className="text-xs">
                      {PRICE_TIER_LABELS[pl.channel] ?? pl.channel}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {pl.validFrom} – {pl.validTo}
                    </TableCell>
                    <TableCell className="p-1 text-right">
                      {pl.type === 'multiplier' ? (
                        <Input
                          className="ml-auto h-7 w-20 font-mono text-xs"
                          defaultValue={pl.multiplier ?? ''}
                          disabled={busyId === pl.id}
                          onBlur={(e) => void saveMultiplier(pl, e.target.value)}
                          data-testid={`brand-pricelist-multiplier-${pl.id}`}
                        />
                      ) : (
                        'override'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                        disabled={publishBusyId != null}
                        onClick={() => void publishVersion(pl)}
                        data-testid={`brand-pricelist-publish-${pl.id}`}
                      >
                        {publishBusyId === pl.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Publish → shop'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </WidgetCard>
      {filtered.length >= 2 ? <BrandPricelistVersionDiffStrip rows={filtered} /> : null}
    </div>
  );
}

export function BrandPricelistTiersPanel({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
}: {
  collectionId?: string;
}) {
  const groups = getCustomerGroups();
  const session = buildBrandPricelistSession({ collectionId });
  const [rows, setRows] = useState<BrandPricelistVersionRow[]>([]);

  useEffect(() => {
    void fetchBrandPricelistVersions(collectionId).then((res) => {
      setRows(res.rows ?? []);
    });
  }, [collectionId]);

  return (
    <div className="space-y-4" data-testid="brand-pricelist-tiers-panel">
      <WidgetCard title="Группы клиентов" description="Tier → прайс-лист → shop matrix wholesale price.">
        <ul className="space-y-2">
          {groups.map((g) => {
            const count = rows.filter((pl) => pl.customerGroupIds?.includes(g.id)).length;
            return (
              <li
                key={g.id}
                className="border-border-subtle flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <span>{g.nameRu}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{count} lists</Badge>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`${session.versionsHref}&group=${g.id}`}>Versions</Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </WidgetCard>
    </div>
  );
}

export function BrandPricelistShopSyncPanel({
  collectionId = 'SS27',
}: {
  collectionId?: string;
}) {
  const session = buildBrandPricelistSession({ collectionId });
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchBrandPricelistTierSync>>['rows']>(
    []
  );
  const [storageMode, setStorageMode] = useState<string>('demo');
  const [busyTier, setBusyTier] = useState<PriceTierId | null>(null);

  const reload = useCallback(async () => {
    const res = await fetchBrandPricelistTierSync(collectionId);
    setRows(res.rows ?? []);
    setStorageMode(res.storageMode ?? 'demo');
  }, [collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const summary = useMemo(() => summarizeBrandPricelistTierSync(rows ?? []), [rows]);

  const pushTier = async (tierId: PriceTierId) => {
    setBusyTier(tierId);
    try {
      const res = await pushBrandPricelistTierSync({ collectionId, tierId });
      if (res.ok) {
        setRows(res.rows ?? []);
        setStorageMode(res.storageMode ?? storageMode);
      }
    } finally {
      setBusyTier(null);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-pricelist-shop-sync-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Tiers: {summary.total}</Badge>
        <Badge variant="outline">Synced: {summary.synced}</Badge>
        <Badge variant="outline">Pending: {summary.pending}</Badge>
        <Badge variant="outline" data-testid={`brand-pricelist-tier-sync-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG tier sync' : `${storageMode} tier sync`}
        </Badge>
        <Button size="sm" variant="outline" type="button" onClick={() => void reload()}>
          Refresh
        </Button>
      </div>

      <WidgetCard title="Tier sync · shop" description="Brand pricelist → shop matrix / landed margin multiplier.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Прайс-лист</TableHead>
                <TableHead className="text-right">×</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows ?? []).map((row) => (
                <TableRow key={row.tierId} data-testid={`brand-pricelist-tier-sync-row-${row.tierId}`}>
                  <TableCell>{PRICE_TIER_LABELS[row.tierId]}</TableCell>
                  <TableCell className="text-xs">{row.priceListName}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.multiplier}</TableCell>
                  <TableCell>
                    {row.shopSynced ? (
                      <Badge variant="secondary" className="text-[10px]">
                        synced
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!row.shopSynced ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                        disabled={busyTier != null}
                        onClick={() => void pushTier(row.tierId)}
                        data-testid={`brand-pricelist-tier-sync-push-${row.tierId}`}
                      >
                        {busyTier === row.tierId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Push shop'
                        )}
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.shopMatrixHref}>Wholesale matrix</Link>
          </Button>
        </div>
      </WidgetCard>
    </div>
  );
}
