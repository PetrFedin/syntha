'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { buildShopReplenishmentSession } from '@/lib/b2b/shop-replenishment-workspace';
import {
  buildIntakeAllocationPayloadFromAtpRows,
  postB2bIntakeAllocation,
  type IntakeAllocationResult,
} from '@/lib/b2b/intake-allocation-client';
import {
  buildShopReplenishmentStockRows,
  type ReplenishmentStockAtpSource,
  type ReplenishmentStockRow,
} from '@/lib/platform/shop-replenishment-stock-atp';
import {
  buildReplenishmentStockSliceHref,
  readReplenishmentStockSliceFromSearchParams,
  REPLENISHMENT_STOCK_SLICE_PARAMS,
  type ReplenishmentStockSlice,
} from '@/lib/platform/shop-replenishment-stock-slices';
import {
  fetchShopReplenishmentFilterSlices,
  postShopReplenishmentFilterSlice,
  type ShopReplenishmentFilterSliceRecord,
} from '@/lib/shop/shop-replenishment-filter-slices-client';
import { ShopReplenishmentFilterSlicesSidebar } from '@/components/shop/replenishment/ShopReplenishmentFilterSlicesSidebar';
import { ShopReplenishmentWmsAtpBadge } from '@/components/shop/replenishment/ShopReplenishmentWmsAtpBadge';
import { ShopReplenishmentMatrixAutoLinesStrip } from '@/components/shop/replenishment/ShopReplenishmentMatrixAutoLinesStrip';

type Props = {
  collectionId?: string;
  orderId?: string;
};

export function ShopReplenishmentStockAtpPanel({ collectionId, orderId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = useMemo(
    () => buildShopReplenishmentSession({ collectionId, orderId }),
    [collectionId, orderId]
  );
  const slice = useMemo(
    () => readReplenishmentStockSliceFromSearchParams(searchParams),
    [searchParams]
  );
  const demoRows = useMemo(() => buildShopReplenishmentStockRows(12, slice), [slice]);
  const [rows, setRows] = useState<ReplenishmentStockRow[]>(demoRows);
  const [source, setSource] = useState<ReplenishmentStockAtpSource>('demo');
  const [sliceStorageMode, setSliceStorageMode] = useState<string | null>(null);
  const [savedSlices, setSavedSlices] = useState<ShopReplenishmentFilterSliceRecord[]>([]);
  const [activeSliceId, setActiveSliceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [allocateResult, setAllocateResult] = useState<IntakeAllocationResult | null>(null);
  const [allocateError, setAllocateError] = useState<string | null>(null);
  const [matrixLinesHint, setMatrixLinesHint] = useState<string | null>(null);
  const [matrixReorderCount, setMatrixReorderCount] = useState(0);
  const [matrixAtpQtyTotal, setMatrixAtpQtyTotal] = useState(0);
  const [matrixApplying, setMatrixApplying] = useState(false);
  const [matrixApplyMessage, setMatrixApplyMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionId?.trim()) return;
    const qs = new URLSearchParams({ collectionId });
    if (orderId?.trim()) qs.set('orderId', orderId.trim());
    void fetch(`/api/shop/b2b/replenishment/matrix-lines?${qs.toString()}`)
      .then((res) => res.json())
      .then((json: { ok?: boolean; messageRu?: string; lines?: unknown[] }) => {
        if (json.ok && json.messageRu) setMatrixLinesHint(json.messageRu);
        if (json.ok && Array.isArray(json.lines)) {
          setMatrixReorderCount(json.lines.length);
        }
      })
      .catch(() => {
        /* optional */
      });
  }, [collectionId, orderId]);

  useEffect(() => {
    void fetchShopReplenishmentFilterSlices().then((json) => {
      if (json.storageMode) setSliceStorageMode(json.storageMode);
      if (json.savedSlices?.length) setSavedSlices(json.savedSlices);
      if (json.activeSliceId) setActiveSliceId(json.activeSliceId);
      const hasSliceParams =
        searchParams.has(REPLENISHMENT_STOCK_SLICE_PARAMS.org) ||
        searchParams.has(REPLENISHMENT_STOCK_SLICE_PARAMS.season);
      if (hasSliceParams || !json.activeSlice) return;
      const href = buildReplenishmentStockSliceHref(
        pathname,
        json.activeSlice,
        new URLSearchParams(searchParams.toString())
      );
      router.replace(href, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    const qs = new URLSearchParams(searchParams.toString());
    qs.set('limit', '12');
    if (collectionId) qs.set('collection', collectionId);
    setLoading(true);
    void fetch(`/api/shop/b2b/replenishment/stock-atp?${qs.toString()}`)
      .then((res) => res.json())
      .then(
        (json: {
          ok?: boolean;
          rows?: ReplenishmentStockRow[];
          source?: ReplenishmentStockAtpSource;
        }) => {
          if (cancelled || json.ok !== true || !Array.isArray(json.rows)) return;
          setRows(json.rows);
          setSource(json.source ?? 'demo');
        }
      )
      .catch(() => {
        if (!cancelled) {
          setRows(demoRows);
          setSource('demo');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [collectionId, demoRows, searchParams]);

  const lowAtp = rows.filter((r) => r.atp < 5).length;

  const runMatrixApply = () => {
    if (!collectionId?.trim()) return;
    setMatrixApplying(true);
    setMatrixApplyMessage(null);
    void fetch('/api/shop/b2b/replenishment/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionId,
        orderId: session.orderId || orderId,
      }),
    })
      .then((res) => res.json())
      .then(
        (json: {
          ok?: boolean;
          matrixHref?: string;
          messageRu?: string;
          atpQtyTotal?: number;
          applied?: number;
        }) => {
          if (json.atpQtyTotal != null) setMatrixAtpQtyTotal(json.atpQtyTotal);
          if (json.ok && json.matrixHref) {
            router.push(json.matrixHref);
            return;
          }
          setMatrixApplyMessage(json.messageRu ?? 'Не удалось перенести SKU в матрицу.');
        }
      )
      .catch(() => {
        setMatrixApplyMessage('Ошибка API переноса в матрицу.');
      })
      .finally(() => setMatrixApplying(false));
  };

  const runIntakeAllocate = () => {
    setAllocating(true);
    setAllocateError(null);
    const batchId = `batch-${session.collectionId}-${Date.now()}`;
    const payload = buildIntakeAllocationPayloadFromAtpRows({
      rows,
      batchId,
      orderId: session.orderId,
    });
    void postB2bIntakeAllocation(payload)
      .then((result) => setAllocateResult(result))
      .catch((err: unknown) => {
        setAllocateResult(null);
        setAllocateError(err instanceof Error ? err.message : 'Ошибка аллокации');
      })
      .finally(() => setAllocating(false));
  };

  const setSlice = (next: ReplenishmentStockSlice, sliceId?: string) => {
    void postShopReplenishmentFilterSlice(next, 'shop1', sliceId).then((res) => {
      if (res.storageMode) setSliceStorageMode(res.storageMode);
      void fetchShopReplenishmentFilterSlices().then((json) => {
        if (json.savedSlices?.length) setSavedSlices(json.savedSlices);
        if (json.activeSliceId) setActiveSliceId(json.activeSliceId);
      });
    });
    const href = buildReplenishmentStockSliceHref(
      pathname,
      next,
      new URLSearchParams(searchParams.toString())
    );
    router.replace(href, { scroll: false });
  };

  const sidebarSlices =
    savedSlices.length > 0
      ? savedSlices
      : [
          {
            sliceId: `${slice.orgId}::${slice.seasonId}::${slice.collectionId}`,
            ...slice,
            isActive: true,
          },
        ];

  return (
    <div className="space-y-4" data-testid="shop-replenishment-feature-stock-atp">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <ShopReplenishmentFilterSlicesSidebar
          slices={sidebarSlices}
          activeSliceId={activeSliceId ?? sidebarSlices.find((s) => s.isActive)?.sliceId ?? null}
          storageMode={sliceStorageMode}
          onSelect={(row) =>
            setSlice(
              {
                orgId: row.orgId,
                seasonId: row.seasonId,
                collectionId: row.collectionId,
                labelRu: row.labelRu,
              },
              row.sliceId
            )
          }
        />
        <div className="min-w-0 flex-1 space-y-4">
          <ShopReplenishmentMatrixAutoLinesStrip
            collectionId={collectionId}
            orderId={orderId}
            lineCount={matrixReorderCount}
            atpQtyTotal={matrixAtpQtyTotal}
            hintRu={matrixLinesHint}
            buyerId="shop1"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">SKU: {rows.length}</Badge>
            <Badge variant="outline">{slice.labelRu}</Badge>
            <ShopReplenishmentWmsAtpBadge collectionId={collectionId} buyerId="shop1" />
            {loading ? (
              <Badge variant="outline" className="animate-pulse">
                Загрузка ATP…
              </Badge>
            ) : null}
            <Badge variant="outline" className="border-amber-500/40 text-amber-700">
              ATP &lt; 5: {lowAtp}
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href={session.inventoryOverviewHref}>Ритейл · inventory</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={session.rulesHref}>Правила</Link>
            </Button>
            <Button size="sm" asChild data-testid="shop-replenishment-stock-atp-matrix-link">
              <Link href={session.matrixHref}>Дозаказ · матрица</Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              disabled={matrixApplying || loading || !collectionId?.trim()}
              onClick={runMatrixApply}
              data-testid="shop-replenishment-matrix-lines-apply"
            >
              {matrixApplying
                ? 'Перенос…'
                : matrixReorderCount > 0
                  ? `В матрицу · ${matrixReorderCount} SKU${matrixAtpQtyTotal > 0 ? ` · ATP ${matrixAtpQtyTotal}` : ''}`
                  : 'В матрицу · ATP'}
            </Button>
            {matrixApplyMessage ? (
              <span
                className="text-[10px] text-destructive"
                data-testid="shop-replenishment-matrix-apply-error"
              >
                {matrixApplyMessage}
              </span>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              type="button"
              disabled={allocating || loading}
              onClick={runIntakeAllocate}
              data-testid="shop-replenishment-intake-allocate-run"
            >
              {allocating ? 'Аллокация…' : 'Приёмка · распределение'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              data-testid="shop-replenishment-supplier-forecast-link"
            >
              <Link href={session.supplierForecastHref}>Поставщик · прогноз</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={session.prepackHref}>Препак</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={session.workingOrderHref}>Рабочий заказ · пакетно</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={session.landedMarginHref}>Маржа с доставкой</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={session.orderCommsHref}>Трекинг заказа</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={session.collaborativeApprovalsHref}>Согласования совместного заказа</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={session.brandOrderChatHref}>Чат заказа бренда</Link>
            </Button>
          </div>

          {allocateResult?.planId ? (
            <Card
              className="border-emerald-200/60 bg-emerald-50/40"
              data-testid="shop-replenishment-intake-allocate-result"
            >
              <CardContent className="py-3 text-sm">
                <p className="font-medium text-emerald-900">
                  {allocateResult.messageRu ?? `План ${allocateResult.planId} сохранён.`}
                </p>
                <p className="text-text-muted mt-1 text-xs">
                  Распределено: {allocateResult.allocations?.length ?? 0} · Нераспределено:{' '}
                  {allocateResult.unallocated?.length ?? 0}
                  {allocateResult.persistMode ? ` · ${allocateResult.persistMode}` : ''}
                </p>
              </CardContent>
            </Card>
          ) : null}
          {allocateError ? (
            <p
              className="text-sm text-destructive"
              data-testid="shop-replenishment-intake-allocate-error"
            >
              {allocateError}
            </p>
          ) : null}

          <Card className="border-border-subtle">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Остатки и ATP</CardTitle>
              <CardDescription>
                На руках, резерв, ATP — зёрна ledger
                {source === 'pg'
                  ? ' из PostgreSQL'
                  : source === 'pg+wms'
                    ? ' · PG + WMS'
                    : source === 'wms'
                      ? ' · WMS'
                      : source === 'demo'
                        ? ' (демо)'
                        : ''}
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">На складе</TableHead>
                    <TableHead className="text-right">Резерв</TableHead>
                    <TableHead className="text-right">ATP</TableHead>
                    <TableHead className="text-right">В пути</TableHead>
                    <TableHead className="text-right">Не подтв.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.sku} data-testid={`shop-replenishment-stock-row-${r.sku}`}>
                      <TableCell>
                        <span className="font-mono text-xs">{r.sku}</span>
                        <p className="text-text-muted line-clamp-1 max-w-[180px] text-[10px]">
                          {r.name}
                        </p>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{r.onHand}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{r.reserved}</TableCell>
                      <TableCell
                        className={`text-right font-mono text-sm ${r.atp < 5 ? 'text-amber-600' : ''}`}
                      >
                        {r.atp}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{r.inTransit}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {r.unconfirmed}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
