'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { packRulesToCsv } from '@/lib/fashion/brand-pack-rules-feed';
import {
  brandPackRulesCurveWeights,
  brandPackRulesSizeCurveSummary,
} from '@/lib/fashion/brand-pack-rules-curve';
import {
  fetchBrandPackRules,
  patchBrandPackRules,
  refreshBrandPackRules,
} from '@/lib/fashion/brand-pack-rules-store';
import { buildBrandPackRulesSession } from '@/lib/fashion/brand-pack-rules-workspace';
import { BrandPackRulesPrepackMatrixHonestyStrip } from '@/components/brand/merch/BrandPackRulesPrepackMatrixHonestyStrip';
import { Loader2 } from 'lucide-react';
import type { BrandPackRulesFeedRow } from '@/lib/fashion/brand-pack-rules-feed';

type Props = {
  collectionId?: string;
  orderId?: string;
};

export function BrandPackRulesTablePanel({ collectionId = 'SS27', orderId }: Props) {
  const session = useMemo(
    () => buildBrandPackRulesSession({ collectionId, orderId }),
    [collectionId, orderId]
  );
  const [rows, setRows] = useState<BrandPackRulesFeedRow[]>([]);
  const [summary, setSummary] = useState({ total: 0, withMoq: 0, withCasePack: 0 });
  const [storageMode, setStorageMode] = useState('demo');
  const [busySku, setBusySku] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetchBrandPackRules(collectionId);
    setRows(res.rows ?? []);
    setSummary({
      total: res.summary?.total ?? 0,
      withMoq: res.summary?.withMoq ?? 0,
      withCasePack: res.summary?.withCasePack ?? 0,
    });
    setStorageMode(res.storageMode ?? 'demo');
  }, [collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const downloadCsv = () => {
    const csv = packRulesToCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pack-rules-${collectionId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveField = async (
    row: BrandPackRulesFeedRow,
    field: 'moq' | 'casePack',
    value: string
  ) => {
    const parsed = value.trim() === '' ? null : Number(value);
    if (parsed != null && !Number.isFinite(parsed)) return;
    setBusySku(row.sku);
    try {
      const res = await patchBrandPackRules({
        collectionId,
        sku: row.sku,
        ...(field === 'moq' ? { moq: parsed } : { casePack: parsed }),
      });
      if (res.ok && res.rows) {
        setRows(res.rows);
        setSummary({
          total: res.summary?.total ?? summary.total,
          withMoq: res.summary?.withMoq ?? summary.withMoq,
          withCasePack: res.summary?.withCasePack ?? summary.withCasePack,
        });
        setStorageMode(res.storageMode ?? storageMode);
      }
    } finally {
      setBusySku(null);
    }
  };

  const syncRules = async () => {
    setSyncBusy(true);
    try {
      const res = await refreshBrandPackRules(collectionId);
      if (res.ok && res.rows) {
        setRows(res.rows);
        setSummary({
          total: res.summary?.total ?? 0,
          withMoq: res.summary?.withMoq ?? 0,
          withCasePack: res.summary?.withCasePack ?? 0,
        });
        setStorageMode(res.storageMode ?? storageMode);
      } else {
        await reload();
      }
    } finally {
      setSyncBusy(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-pack-rules-table-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">SKU: {summary.total}</Badge>
        <Badge variant="outline">MOQ: {summary.withMoq}</Badge>
        <Badge variant="outline">Case pack: {summary.withCasePack}</Badge>
        <Badge variant="outline" data-testid={`brand-pack-rules-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG pack rules' : `${storageMode} pack rules`}
        </Badge>
        <Button size="sm" onClick={downloadCsv}>
          CSV
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.shopMatrixPrepackHref}>Прекпак магазина</Link>
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={() => void reload()}>
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={syncBusy}
          onClick={() => void syncRules()}
          data-testid="brand-pack-rules-sync"
        >
          {syncBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sync PIM slice'}
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">MOQ · case pack</CardTitle>
          <CardDescription>
            PIM B2B fields · persisted PG/file · editable MOQ and короб for shop matrix.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[420px] overflow-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>MOQ</TableHead>
                <TableHead>Короб</TableHead>
                <TableHead>Нед.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 40).map((r) => (
                <TableRow key={r.sku} data-testid={`brand-pack-rules-row-${r.sku}`}>
                  <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                  <TableCell className="p-1">
                    <Input
                      className="h-7 w-16 font-mono text-xs"
                      defaultValue={r.moq ?? ''}
                      disabled={busySku === r.sku}
                      onBlur={(e) => void saveField(r, 'moq', e.target.value)}
                      data-testid={`brand-pack-rules-moq-${r.sku}`}
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      className="h-7 w-16 font-mono text-xs"
                      defaultValue={r.casePack ?? ''}
                      disabled={busySku === r.sku}
                      onBlur={(e) => void saveField(r, 'casePack', e.target.value)}
                      data-testid={`brand-pack-rules-case-${r.sku}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.leadWeeks ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandPackRulesCurvePanel({ collectionId, orderId }: Props) {
  const session = useMemo(
    () => buildBrandPackRulesSession({ collectionId, orderId }),
    [collectionId, orderId]
  );
  const weights = brandPackRulesCurveWeights();
  const summary = brandPackRulesSizeCurveSummary(2);

  return (
    <div className="space-y-4" data-testid="brand-pack-rules-curve-panel">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Size curve SoT</CardTitle>
          <CardDescription>Aptos pattern — веса → shop pre-pack apply.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {weights.map((w) => (
              <Badge key={w.size} variant="outline">
                {w.size}:{w.weight}
              </Badge>
            ))}
          </div>
          <p className="text-text-secondary text-xs">{summary}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href={session.shopMatrixPrepackHref}>Open shop matrix prepack</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={session.sizeChartHref}>Size chart grade</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandPackRulesShopPrepackPanel({ collectionId, orderId }: Props) {
  const session = useMemo(
    () => buildBrandPackRulesSession({ collectionId, orderId }),
    [collectionId, orderId]
  );

  return (
    <div className="space-y-4" data-testid="brand-pack-rules-shop-prepack-panel">
      <BrandPackRulesPrepackMatrixHonestyStrip collectionId={collectionId} orderId={orderId} />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Прекпак магазина</CardTitle>
          <CardDescription>
            Brand curve → shop matrix tab prepack · batch cart apply.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.shopMatrixPrepackHref}>Open shop pre-pack</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.rulesHref}>Pack rules</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
