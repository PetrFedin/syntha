'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
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
import type { ReplenishmentStockAtpSource } from '@/lib/platform-core-ports/platform/shop-replenishment-stock-atp';
import { fetchShopInventoryLedgerFeed } from '@/lib/platform-core-ports/legacy/shop/shop-inventory-ledger-feed-store';
import { Loader2 } from 'lucide-react';

type Props = {
  collectionId?: string;
  reconcileHref: string;
  variant: 'shop' | 'brand';
  limit?: number;
  testId?: string;
};

export function PlatformCoreInventoryLedgerStrip({
  collectionId,
  reconcileHref,
  variant,
  limit = 6,
  testId,
}: Props) {
  const [rows, setRows] = useState<
    Awaited<ReturnType<typeof fetchShopInventoryLedgerFeed>>['rows']
  >([]);
  const [ledgerSource, setLedgerSource] = useState<ReplenishmentStockAtpSource>('demo');
  const [loading, setLoading] = useState(true);
  const [refreshBusy, setRefreshBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetchShopInventoryLedgerFeed({ collectionId, limit });
    setRows(res.rows);
    setLedgerSource(res.ledgerSource);
  }, [collectionId, limit]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        await reload();
      } finally {
        setLoading(false);
      }
    })();
  }, [reload]);

  const refresh = async () => {
    setRefreshBusy(true);
    try {
      await reload();
    } finally {
      setRefreshBusy(false);
    }
  };

  const rootTestId = testId ?? `platform-core-inventory-ledger-${variant}`;

  return (
    <Card data-testid={rootTestId}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Ledger · ATP snapshot</CardTitle>
            <CardDescription>
              {variant === 'brand'
                ? 'Brand network view · shop PG ledger (read-only).'
                : 'Shop reconcile source · PG grains + adjustments.'}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" data-testid={`${rootTestId}-source-${ledgerSource}`}>
              {ledgerSource === 'pg' ? 'PG ledger' : `Ledger ${ledgerSource}`}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              disabled={refreshBusy}
              onClick={() => void refresh()}
            >
              {refreshBusy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href={reconcileHref} data-testid={`${rootTestId}-reconcile-link`}>
                Сверка
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {loading ? (
          <p className="text-text-secondary p-4 text-sm">Загрузка ledger…</p>
        ) : rows.length === 0 ? (
          <p className="text-text-secondary p-4 text-sm">Нет SKU в ledger feed.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Ledger ATP</TableHead>
                <TableHead className="text-right">Physical</TableHead>
                <TableHead className="text-right">Δ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.sku} data-testid={`${rootTestId}-row-${row.sku}`}>
                  <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.ledgerAtp}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.physicalOnHand}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-sm ${
                      row.diff === 0
                        ? 'text-emerald-600'
                        : row.severity === 'high'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                    }`}
                  >
                    {row.diff > 0 ? `+${row.diff}` : row.diff}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
