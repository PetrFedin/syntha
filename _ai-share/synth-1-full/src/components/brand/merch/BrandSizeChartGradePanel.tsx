'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { BrandSizeChartGradeFeedRow } from '@/lib/fashion/brand-attribute-schema-feed';
import {
  fetchBrandSizeChartGradeFeed,
  patchBrandSizeChartGradeFeed,
  refreshBrandAttributeSchemaFeed,
} from '@/lib/fashion/brand-attribute-schema-store';
import {
  brandSizeChartGradeLabel,
  brandSizeChartGradeToCsv,
  type BrandSizeChartGradeState,
} from '@/lib/fashion/brand-size-chart-grade';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

type Props = {
  collectionId: string;
  articleId?: string;
};

export function BrandSizeChartGradePanel({
  collectionId,
  articleId = PLATFORM_CORE_DEMO.demoArticleId,
}: Props) {
  const [rows, setRows] = useState<BrandSizeChartGradeFeedRow[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    ready: 0,
    partial: 0,
    empty: 0,
    pgSourced: 0,
  });
  const [storageMode, setStorageMode] = useState('demo');
  const [loading, setLoading] = useState(true);
  const [busySku, setBusySku] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetchBrandSizeChartGradeFeed(collectionId);
    setRows(res.rows ?? []);
    setSummary(res.summary ?? { total: 0, ready: 0, partial: 0, empty: 0, pgSourced: 0 });
    setStorageMode(res.storageMode ?? 'demo');
  }, [collectionId]);

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

  const downloadCsv = () => {
    const blob = new Blob([brandSizeChartGradeToCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `size-chart-grade-${collectionId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveGrade = async (sku: string, gradeState: BrandSizeChartGradeState) => {
    setBusySku(sku);
    try {
      const res = await patchBrandSizeChartGradeFeed({ collectionId, sku, gradeState });
      if (res.ok && res.rows) {
        setRows(res.rows);
        setSummary(res.summary ?? summary);
        setStorageMode(res.storageMode ?? storageMode);
      } else {
        await reload();
      }
    } finally {
      setBusySku(null);
    }
  };

  const syncFeed = async () => {
    setSyncBusy(true);
    try {
      await refreshBrandAttributeSchemaFeed(collectionId);
      await reload();
    } finally {
      setSyncBusy(false);
    }
  };

  const w2SizeHref = workshop2ArticleHref(collectionId, articleId ?? 'demo-ss27-01', {
    w2pane: 'tz',
    w2sec: 'size',
  });
  const prepackHref = `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=prepack`;

  return (
    <div className="space-y-4" data-testid="brand-size-chart-grade-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={downloadCsv} disabled={!rows.length}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV grade
        </Button>
        <Badge variant="secondary">ready: {summary.ready}</Badge>
        <Badge variant="outline">partial: {summary.partial}</Badge>
        <Badge variant="outline">empty: {summary.empty}</Badge>
        <Badge variant="outline" data-testid={`brand-size-chart-grade-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG grade feed' : `Local ${storageMode}`}
        </Badge>
        <Button size="sm" variant="outline" disabled={syncBusy} onClick={() => void syncFeed()}>
          {syncBusy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          Sync catalog
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.packRules}>Pack rules</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={w2SizeHref}>W2 · size chart</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={prepackHref}>Прекпак магазина</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-text-secondary text-sm">Загрузка grade feed…</p>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Size chart · grade rules</CardTitle>
            <CardDescription>
              Handbook scale + editable PG grade state → shop pre-pack.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[480px] overflow-x-auto overflow-y-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Scale</TableHead>
                  <TableHead className="text-right">Sizes</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.sku} data-testid={`brand-size-chart-grade-row-${row.sku}`}>
                    <TableCell>
                      <Link href={`/products/${row.slug}`} className="font-mono text-xs underline">
                        {row.sku}
                      </Link>
                      <p className="text-text-muted line-clamp-1 max-w-[180px] text-[10px]">
                        {row.name}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-[10px]">{row.sizeScaleId}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.sizeCount}</TableCell>
                    <TableCell className="text-xs">
                      <Select
                        value={row.gradeState}
                        disabled={busySku === row.sku}
                        onValueChange={(value) =>
                          void saveGrade(row.sku, value as BrandSizeChartGradeState)
                        }
                      >
                        <SelectTrigger
                          className="h-8 w-[110px] text-[10px] uppercase"
                          data-testid={`brand-size-chart-grade-select-${row.sku}`}
                        >
                          <SelectValue>{brandSizeChartGradeLabel(row.gradeState)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ready">ready</SelectItem>
                          <SelectItem value="partial">partial</SelectItem>
                          <SelectItem value="empty">empty</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-text-muted mt-1 max-w-[220px] text-[10px]">{row.hintRu}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
