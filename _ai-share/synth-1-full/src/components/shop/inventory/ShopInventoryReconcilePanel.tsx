'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { listCycleCountSessions } from '@/lib/api';
import { buildShopInventoryOpsSession } from '@/lib/b2b/shop-inventory-ops';
import type { CycleCountSession } from '@/lib/shop/cycle-counting';
import {
  applyLedgerAdjustOverlay,
  summarizeShopInventoryReconcile,
  type ShopInventoryReconcileRow,
} from '@/lib/platform/shop-inventory-reconcile';
import type { ReplenishmentStockAtpSource } from '@/lib/platform/shop-replenishment-stock-atp';
import {
  buildLedgerAdjustDeltaMap,
  fetchShopInventoryLedgerAdjustments,
  postShopInventoryLedgerAdjust,
  postShopInventoryLedgerAdjustBulk,
} from '@/lib/shop/shop-inventory-ledger-adjust-store';
import type { ShopInventoryLedgerAdjustRecord } from '@/lib/shop/shop-inventory-ledger-adjust.types';

type Props = {
  collectionId?: string;
};

export function ShopInventoryReconcilePanel({ collectionId }: Props) {
  const [sessions, setSessions] = useState<CycleCountSession[]>([]);
  const [baseRows, setBaseRows] = useState<ShopInventoryReconcileRow[]>([]);
  const [ledgerSource, setLedgerSource] = useState<ReplenishmentStockAtpSource>('demo');
  const [adjustments, setAdjustments] = useState<ShopInventoryLedgerAdjustRecord[]>([]);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [busySku, setBusySku] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const reloadAdjustments = useCallback(async () => {
    const rows = await fetchShopInventoryLedgerAdjustments();
    setAdjustments(rows);
  }, []);

  const reloadRows = useCallback(async (cycleSessions: CycleCountSession[]) => {
    const res = await fetch('/api/shop/inventory/reconcile/rows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId: 'shop1',
        collectionId,
        limit: 12,
        cycleSessions,
      }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      rows?: ShopInventoryReconcileRow[];
      ledgerSource?: ReplenishmentStockAtpSource;
    };
    if (json.ok && Array.isArray(json.rows)) {
      setBaseRows(json.rows);
      setLedgerSource(json.ledgerSource ?? 'demo');
    }
  }, [collectionId]);

  useEffect(() => {
    void listCycleCountSessions().then(async (sess) => {
      setSessions(sess);
      await reloadRows(sess);
    });
    void reloadAdjustments();
  }, [reloadAdjustments, reloadRows]);

  const deltaBySku = useMemo(() => buildLedgerAdjustDeltaMap(adjustments), [adjustments]);

  const rows = useMemo(() => {
    return applyLedgerAdjustOverlay(baseRows, deltaBySku);
  }, [baseRows, deltaBySku]);

  const summary = useMemo(() => summarizeShopInventoryReconcile(rows), [rows]);
  const session = buildShopInventoryOpsSession({ collectionId });

  const adjustRow = async (row: (typeof rows)[number]) => {
    if (row.diff === 0) return;
    setBusySku(row.sku);
    setNotice(null);
    try {
      const res = await postShopInventoryLedgerAdjust({
        sku: row.sku,
        ledgerAtp: row.ledgerAtp,
        physicalOnHand: row.physicalOnHand,
      });
      if (!res.ok) {
        setNotice(res.messageRu);
        return;
      }
      if (res.storageMode) setStorageMode(res.storageMode);
      setNotice(res.result.diffAfter === 0 ? `Ledger ${row.sku} выровнен.` : `Adjust ${row.sku} записан.`);
      await reloadAdjustments();
      await reloadRows(sessions);
    } finally {
      setBusySku(null);
    }
  };

  const adjustAllMismatches = async () => {
    const mismatched = rows.filter((r) => r.diff !== 0);
    if (mismatched.length === 0) return;
    setBulkBusy(true);
    setNotice(null);
    try {
      const res = await postShopInventoryLedgerAdjustBulk({
        items: mismatched.map((r) => ({
          sku: r.sku,
          ledgerAtp: r.ledgerAtp,
          physicalOnHand: r.physicalOnHand,
        })),
      });
      if (!res.ok) {
        setNotice(res.messageRu);
        return;
      }
      if (res.storageMode) setStorageMode(res.storageMode);
      setNotice(res.messageRu ?? `Bulk adjust: ${res.count} SKU.`);
      await reloadAdjustments();
      await reloadRows(sessions);
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="shop-inventory-reconcile-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">SKU: {summary.total}</Badge>
        <Badge variant="outline">Расхождения: {summary.mismatches}</Badge>
        {summary.high > 0 ? (
          <Badge variant="destructive">High: {summary.high}</Badge>
        ) : (
          <Badge variant="outline">High: 0</Badge>
        )}
        {adjustments.length > 0 ? (
          <Badge variant="secondary" className="text-[10px]">
            Adjust journal: {adjustments.length}
          </Badge>
        ) : null}
        {ledgerSource === 'pg' ? (
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-700">
            Ledger PG
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] uppercase">
            Ledger {ledgerSource}
          </Badge>
        )}
      </div>

      {notice ? <p className="text-text-secondary text-xs">{notice}</p> : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ledger · physical</CardTitle>
          <CardDescription>
            Onfinity reconcile: ATP (ledger) vs cycle count. Сессий: {sessions.length}.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">ATP</TableHead>
                <TableHead className="text-right">Physical</TableHead>
                <TableHead className="text-right">Diff</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.sku} data-testid={`shop-inventory-reconcile-row-${row.sku}`}>
                  <TableCell>
                    <span className="font-mono text-xs">{row.sku}</span>
                    <p className="text-text-muted line-clamp-1 max-w-[160px] text-[10px]">
                      {row.name}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.ledgerAtp}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.physicalOnHand}</TableCell>
                  <TableCell
                    className={`text-right font-mono text-sm ${row.diff !== 0 ? 'text-amber-700' : ''}`}
                  >
                    {row.diff > 0 ? `+${row.diff}` : row.diff}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {row.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {row.diff !== 0 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        disabled={busySku === row.sku}
                        onClick={() => void adjustRow(row)}
                        data-testid={`shop-inventory-reconcile-adjust-${row.sku}`}
                      >
                        Adjust ledger
                      </Button>
                    ) : (
                      <span className="text-text-muted text-[10px]">OK</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {summary.mismatches > 0 ? (
          <Button
            size="sm"
            type="button"
            disabled={bulkBusy}
            onClick={() => void adjustAllMismatches()}
            data-testid="shop-inventory-reconcile-adjust-all"
          >
            Adjust all ({summary.mismatches})
          </Button>
        ) : null}
        <Button size="sm" asChild data-testid="shop-inventory-reconcile-cycle-count">
          <Link href={session.cycleCountHref}>Cycle counting</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={session.replenishmentAtpHref}>Пополнение · ATP</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={session.landedMarginHref}>Маржа с доставкой</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.orderCommsHref}>Трекинг заказа</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.matrixHref}>Wholesale matrix</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.overviewHref}>Обзор склада</Link>
        </Button>
      </div>
    </div>
  );
}
