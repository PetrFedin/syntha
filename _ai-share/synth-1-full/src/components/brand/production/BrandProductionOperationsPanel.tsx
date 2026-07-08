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
import {
  fetchBrandProductionOpsSnapshot,
  syncBrandProductionOpsToSpine,
} from '@/lib/brand-production/brand-production-ops-store';
import { buildBrandProductionOpsSession } from '@/lib/brand-production/brand-production-ops-session';
import type { BrandProductionState } from '@/lib/brand-production';
import { computeProductionAlerts } from '@/lib/brand-production/alerts';
import { buildBrandProductionOpsLocalSyncPayload } from '@/lib/production/brand-production-ops-local-sync';
import {
  labelBrandProductionOpsPoStatusRu,
  type BrandProductionOpsBomRow,
  type BrandProductionOpsPoRow,
} from '@/lib/production/brand-production-ops-spine';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { AlertTriangle, ClipboardList, Factory, Loader2, Package, Upload } from 'lucide-react';

type Props = {
  state: BrandProductionState;
  selectedCollectionId: string;
  /** Коллекция localStorage mock (может отличаться от target PG, напр. col-fw26 → SS27). */
  localSourceCollectionId?: string;
  orderId?: string;
};

export function BrandProductionOperationsPanel({
  state,
  selectedCollectionId,
  localSourceCollectionId,
  orderId,
}: Props) {
  const collectionId = selectedCollectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const sourceCollectionId =
    localSourceCollectionId?.trim() || state.collections[0]?.id || undefined;
  const resolvedOrderId =
    orderId?.trim() || state.b2bOrderRefs.find((r) => r.status !== 'cancelled')?.orderRef;
  const [poRows, setPoRows] = useState<BrandProductionOpsPoRow[]>([]);
  const [bomRows, setBomRows] = useState<BrandProductionOpsBomRow[]>([]);
  const [storageMode, setStorageMode] = useState<'pg' | 'file' | 'empty'>('empty');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const session = buildBrandProductionOpsSession({
    orderId: resolvedOrderId,
    collectionId,
  });
  const alerts = useMemo(() => computeProductionAlerts(state), [state]);
  const localPoCount = state.purchaseOrders.filter(
    (po) => !collectionId || po.collectionId === collectionId
  ).length;
  const localBomCount = state.bomLines.filter((b) => {
    const art = state.articles.find((a) => a.id === b.articleId);
    return !collectionId || art?.collectionId === collectionId;
  }).length;

  useEffect(() => {
    void fetchBrandProductionOpsSnapshot({
      collectionId,
      orderId: resolvedOrderId,
    }).then((res) => {
      if (!res.ok) return;
      setPoRows(res.poRows);
      setBomRows(res.bomRows);
      setStorageMode(res.storageMode);
    });
  }, [collectionId, resolvedOrderId]);

  const pushToSpine = () => {
    if (syncing) return;
    void (async () => {
      setSyncing(true);
      setSyncMsg(null);
      try {
        const payload = buildBrandProductionOpsLocalSyncPayload({
          targetCollectionId: collectionId,
          orderId: resolvedOrderId,
          sourceCollectionId,
          purchaseOrders: state.purchaseOrders,
          bomLines: state.bomLines,
          articles: state.articles,
          factories: state.factories,
        });
        const res = await syncBrandProductionOpsToSpine(payload);
        if (res.ok) {
          setPoRows(res.poRows);
          setBomRows(res.bomRows);
          setStorageMode(res.storageMode);
          setSyncMsg(res.messageRu ?? null);
        } else {
          setSyncMsg('Не удалось синхронизировать local → spine.');
        }
      } finally {
        setSyncing(false);
      }
    })();
  };

  return (
    <div className="space-y-4" data-testid="brand-production-operations-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={syncing || localPoCount === 0}
          onClick={pushToSpine}
          data-testid="brand-production-ops-push-spine-btn"
        >
          {syncing ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Upload className="mr-1 h-3 w-3" />
          )}
          Отправить local → spine
        </Button>
        {syncMsg ? (
          <span className="text-text-secondary text-xs" data-testid="brand-production-ops-sync-msg">
            {syncMsg}
          </span>
        ) : null}
      </div>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Factory className="h-4 w-4" />
            <CardTitle className="text-base">PO · цепочка производства</CardTitle>
            <Badge variant="outline" data-testid={`brand-production-ops-po-source-${storageMode}`}>
              {poRows.length ? `PG · ${storageMode}` : `Local · ${localPoCount} PO`}
            </Badge>
          </div>
          <CardDescription>
            workshop2_purchase_orders — связка с передачей, техкартой и ERP (столп 4).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {poRows.length === 0 ? (
            <p className="text-text-secondary px-6 py-4 text-sm">
              PG PO пуст — ниже local mock ({localPoCount} PO).
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Цех / поставщик</TableHead>
                  <TableHead>Кол-во</TableHead>
                  <TableHead>MES</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poRows.map((row) => (
                  <TableRow key={row.id} data-testid={`brand-production-ops-po-row-${row.id}`}>
                    <TableCell className="font-medium">{row.poCode}</TableCell>
                    <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                    <TableCell>{row.supplierOrFactory}</TableCell>
                    <TableCell className="tabular-nums">{row.qty}</TableCell>
                    <TableCell className="text-xs">{row.mesReleaseStage ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {labelBrandProductionOpsPoStatusRu(row.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Package className="h-4 w-4" />
            <CardTitle className="text-base">BOM · заявки на материалы</CardTitle>
            <Badge variant="outline" data-testid={`brand-production-ops-bom-source-${storageMode}`}>
              {bomRows.length ? `PG · ${storageMode}` : `Local · ${localBomCount} lines`}
            </Badge>
          </div>
          <CardDescription>
            workshop2_material_requisitions — BOM поставщика и закупки (столп 4 ↔ поставщик).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {bomRows.length === 0 ? (
            <p className="text-text-secondary px-6 py-4 text-sm">
              PG BOM пуст — ниже local mock ({localBomCount} строк).
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Материал</TableHead>
                  <TableHead>Кол-во</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bomRows.map((row) => (
                  <TableRow key={row.id} data-testid={`brand-production-ops-bom-row-${row.id}`}>
                    <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                    <TableCell>{row.materialLabel}</TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {row.qty != null ? `${row.qty} ${row.unit ?? ''}`.trim() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {alerts.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Оповещения (локальная модель)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            {alerts.slice(0, 3).map((a) => (
              <p key={a.id}>
                {a.title}: {a.detail}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href={session.handoffTabHref}>Передача</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.cutTicketTabHref}>Техкарта раскроя</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.qcGateTabHref}>Контроль качества</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.supplierBomHref} data-testid="brand-production-ops-supplier-bom-link">
            BOM поставщика
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.factoryMaterialsHref}>Материалы цеха</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.w2ArticlePoHref}>План PO W2</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.shopOrderCommsHref}>Трекинг магазина</Link>
        </Button>
      </div>

      <p className="text-text-muted flex items-center gap-1 text-[11px]">
        <ClipboardList className="h-3 w-3" />
        {isPlatformCoreMode()
          ? 'Platform Core: состояние PO/BOM — PostgreSQL spine; правки модели — auto-persist в PG.'
          : 'Ниже — localStorage mock для детального редактирования до полного REST cutover.'}
      </p>
    </div>
  );
}
