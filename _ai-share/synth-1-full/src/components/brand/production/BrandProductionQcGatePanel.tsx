'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
import { buildBrandProductionQcGateSummary, type BrandProductionQcGateRow } from '@/lib/brand-production/qc-gate';
import { buildBrandProductionHandoffSession } from '@/lib/brand-production/brand-production-handoff';
import { buildManufacturerQcGateSession } from '@/lib/production/manufacturer-qc-gate';
import type { BrandProductionState } from '@/lib/brand-production';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { PlatformCoreQcGateInlineRecordStrip } from '@/components/platform/PlatformCoreQcGateInlineRecordStrip';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { ROUTES } from '@/lib/routes';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ClipboardCheck } from 'lucide-react';

type Props = {
  state: BrandProductionState;
  selectedCollectionId: string;
};

export function BrandProductionQcGatePanel({ state, selectedCollectionId }: Props) {
  const localSummary = useMemo(() => buildBrandProductionQcGateSummary(state), [state]);
  const [pgRows, setPgRows] = useState<BrandProductionQcGateRow[]>([]);
  const [pgMode, setPgMode] = useState<'pg' | 'empty'>('empty');
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(
          `/api/brand/production/qc-gate/inspections?collectionId=${encodeURIComponent(selectedCollectionId || PLATFORM_CORE_DEMO.collectionId)}`,
          { cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          rows?: BrandProductionQcGateRow[];
          storageMode?: 'pg' | 'empty';
        };
        if (json.ok && json.rows?.length) {
          setPgRows(json.rows);
          setPgMode(json.storageMode === 'pg' ? 'pg' : 'empty');
        } else {
          setPgRows(json.ok && json.rows ? json.rows : []);
          setPgMode(json.storageMode === 'pg' ? 'pg' : 'empty');
        }
      } catch {
        setPgRows([]);
      }
    })();
  }, [selectedCollectionId, reloadNonce]);

  const summary = useMemo(() => {
    if (!pgRows.length) return localSummary;
    const blockedShipments = pgRows.filter((r) => r.blocksShipment).length;
    return {
      plannedCount: localSummary.plannedCount,
      passCount: pgRows.filter((r) => r.result === 'pass').length,
      failCount: pgRows.filter((r) => r.result === 'fail' || r.result === 'rework').length,
      blockedShipments,
      rows: pgRows,
    };
  }, [localSummary, pgRows]);
  const resolvedOrderId = state.b2bOrderRefs.find((r) => r.status !== 'cancelled')?.orderRef;
  const mfrQc = buildManufacturerQcGateSession({
    collectionId: selectedCollectionId || PLATFORM_CORE_DEMO.collectionId,
    orderId: resolvedOrderId,
  });
  const handoff = buildBrandProductionHandoffSession({
    orderId: resolvedOrderId,
    collectionId: selectedCollectionId,
  });
  const { sseConnected } = usePlatformCoreChainStatusPoll(Boolean(resolvedOrderId), [
    resolvedOrderId ?? '',
  ]);

  return (
    <div className="space-y-4" data-testid="brand-production-qc-gate-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <CardTitle className="text-base">Гейт КК</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase">
              AQL
            </Badge>
            {resolvedOrderId ? (
              <PlatformCoreChainStatusRefreshBadge
                sseConnected={sseConnected}
                enabled
                sseTestId="brand-production-qc-chain-sse-live-badge"
                pollTestId="brand-production-qc-chain-poll-badge"
              />
            ) : null}
          </div>
          <CardDescription>
            Инспекции блокируют отгрузку до прохождения.
            {pgMode === 'pg' ? ' Контроль PG при отгрузке.' : ' Локальная модель, PG пуст.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline" data-testid={`brand-qc-gate-source-${pgMode}`}>
            {pgMode === 'pg' ? 'Гейт КК (PG)' : 'Локальная модель'}
          </Badge>
          <Badge variant="secondary">Запланировано: {summary.plannedCount}</Badge>
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-800">
            Пройдено: {summary.passCount}
          </Badge>
          <Badge variant="outline" className="border-rose-500/40 text-rose-800">
            Брак/доработка: {summary.failCount}
          </Badge>
          <Badge variant={summary.blockedShipments > 0 ? 'destructive' : 'secondary'}>
            Блок отгрузки: {summary.blockedShipments}
          </Badge>
        </CardContent>
      </Card>

      <PlatformCoreQcGateInlineRecordStrip
        collectionId={selectedCollectionId || PLATFORM_CORE_DEMO.collectionId}
        defaultOrderId={resolvedOrderId}
        articleId={state.b2bOrderRefs.find((r) => r.status !== 'cancelled')?.articleSku}
        inspectorLabel="Гейт КК бренда"
        testIdPrefix="brand-qc-gate"
        onRecorded={() => setReloadNonce((n) => n + 1)}
      />

      <Card>
        <CardContent className="p-0">
          {summary.rows.length === 0 ? (
            <p className="text-text-secondary px-6 py-4 text-sm">Инспекций пока нет.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO</TableHead>
                  <TableHead>Результат</TableHead>
                  <TableHead>Инспектор</TableHead>
                  <TableHead>Чеклист</TableHead>
                  <TableHead>Блок отгрузки</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.rows.map((row) => (
                  <TableRow key={row.id} data-testid={`brand-qc-gate-row-${row.id}`}>
                    <TableCell className="font-mono text-xs">{row.poId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {row.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{row.inspectorLabel}</TableCell>
                    <TableCell className="text-xs">{row.checklistTemplateId ?? '—'}</TableCell>
                    <TableCell>{row.blocksShipment ? 'да' : 'нет'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.productionQcApp}>QC-приложение · поле</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={handoff.handoffTabHref} data-testid="brand-qc-gate-handoff-tab-link">
            Вкладка передачи
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={mfrQc.qcTabHref} data-testid="brand-qc-gate-mfr-tab-link">
            КК производства
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={handoff.shopOrderCommsHref}>Трекинг заказа магазина</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={mfrQc.shopLandedMarginHref}>Маржа магазина</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={handoff.brandOrderCommsChatHref}>Чат заказа бренда</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.brand.processLiveQc}>Онлайн КК</Link>
        </Button>
      </div>
    </div>
  );
}
