'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { buildBrandLandedMarginSession } from '@/lib/b2b/brand-landed-margin';
import {
  fetchBrandLandedMarginFeed,
  refreshBrandLandedMarginFeed,
} from '@/lib/b2b/landed-margin-feed-store';
import { Loader2 } from 'lucide-react';

type Props = {
  collectionId?: string;
  orderId?: string;
};

export function BrandLandedMarginShopRollupPanel({ collectionId = 'SS27', orderId }: Props) {
  const session = useMemo(
    () => buildBrandLandedMarginSession({ collectionId, orderId }),
    [collectionId, orderId]
  );
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchBrandLandedMarginFeed>>['rows']>(
    []
  );
  const [summary, setSummary] = useState({ total: 0, onTarget: 0, avgMarginPct: 0 });
  const [storageMode, setStorageMode] = useState('demo');
  const [orderLinked, setOrderLinked] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetchBrandLandedMarginFeed({ collectionId, orderId });
    setRows(res.rows ?? []);
    setSummary({
      total: res.summary?.total ?? 0,
      onTarget: res.summary?.onTarget ?? 0,
      avgMarginPct: res.summary?.avgMarginPct ?? 0,
    });
    setStorageMode(res.storageMode ?? 'demo');
    setOrderLinked(res.orderLinked ?? false);
  }, [collectionId, orderId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const syncFeed = async () => {
    setBusy(true);
    try {
      const res = await refreshBrandLandedMarginFeed({ collectionId, orderId });
      if (res.ok && res.rows) {
        setRows(res.rows);
        setSummary({
          total: res.summary?.total ?? 0,
          onTarget: res.summary?.onTarget ?? 0,
          avgMarginPct: res.summary?.avgMarginPct ?? 0,
        });
        setStorageMode(res.storageMode ?? storageMode);
        setOrderLinked(res.orderLinked ?? orderLinked);
      } else {
        await reload();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-landed-margin-shop-rollup-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Lines: {summary.total}</Badge>
        <Badge variant="outline">On target: {summary.onTarget}</Badge>
        <Badge variant="outline">Avg: {summary.avgMarginPct}%</Badge>
        {orderLinked ? (
          <Badge variant="outline" data-testid="brand-landed-margin-order-linked">
            B2B order
          </Badge>
        ) : null}
        <Badge variant="outline" data-testid={`brand-landed-margin-feed-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG margin feed' : `${storageMode} margin feed`}
        </Badge>
        <Button size="sm" asChild>
          <Link href={session.shopMarginRollupHref}>Сводка магазина</Link>
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={() => void reload()}>
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={busy}
          onClick={() => void syncFeed()}
          data-testid="brand-landed-margin-feed-sync"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sync feed'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Превью сводки магазина</CardTitle>
          <CardDescription>
            Buyer landed margin vs brand simulator · same PG feed as shop rollup tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line</TableHead>
                <TableHead className="text-right">Wholesale</TableHead>
                <TableHead className="text-right">Landed</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows ?? []).map((row) => (
                <TableRow key={row.lineId} data-testid={`brand-landed-margin-feed-row-${row.lineId}`}>
                  <TableCell className="text-xs">{row.label}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.wholesaleRub.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.landedRub.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={row.onTarget ? 'secondary' : 'outline'}>{row.marginPct}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
