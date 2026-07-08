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
import {
  brandAttributeMissingFixHref,
  brandAttributeMissingFixLabel,
} from '@/lib/fashion/brand-attribute-schema-w2-link';
import {
  brandAttributeSchemaMissingLabels,
  brandAttributeSchemaToCsv,
} from '@/lib/fashion/brand-attribute-schema';
import type { BrandAttributeSchemaFeedRow } from '@/lib/fashion/brand-attribute-schema-feed';
import {
  fetchBrandAttributeSchemaFeed,
  refreshBrandAttributeSchemaFeed,
} from '@/lib/fashion/brand-attribute-schema-store';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

type Props = {
  collectionId: string;
};

export function BrandAttributeSchemaPanel({ collectionId }: Props) {
  const [rows, setRows] = useState<BrandAttributeSchemaFeedRow[]>([]);
  const [summary, setSummary] = useState({ total: 0, weak: 0, leafCount: 0, pgSourced: 0 });
  const [storageMode, setStorageMode] = useState('demo');
  const [loading, setLoading] = useState(true);
  const [syncBusy, setSyncBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetchBrandAttributeSchemaFeed(collectionId);
    setRows(res.schemas ?? []);
    setSummary(res.schemaSummary ?? { total: 0, weak: 0, leafCount: 0, pgSourced: 0 });
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
    const blob = new Blob([brandAttributeSchemaToCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attribute-schemas-${collectionId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const syncSchemas = async () => {
    setSyncBusy(true);
    try {
      await refreshBrandAttributeSchemaFeed(collectionId);
      await reload();
    } finally {
      setSyncBusy(false);
    }
  };

  const healthHref = `${ROUTES.brand.attributeHealth}?${PILLAR_CAPABILITY_FEATURE_PARAM}=health&collection=${encodeURIComponent(collectionId)}`;
  const sizeChartHref = `${ROUTES.brand.attributeHealth}?${PILLAR_CAPABILITY_FEATURE_PARAM}=size-chart&collection=${encodeURIComponent(collectionId)}`;

  return (
    <div className="space-y-4" data-testid="brand-attribute-schema-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={downloadCsv} disabled={!rows.length}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV schemas
        </Button>
        <Badge variant="secondary">Листов: {summary.leafCount}</Badge>
        <Badge variant="outline">
          С пробелами: {summary.weak} / {summary.total}
        </Badge>
        <Badge variant="outline" data-testid={`brand-attribute-schema-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG schema feed' : `Local ${storageMode}`}
        </Badge>
        <Button size="sm" variant="outline" disabled={syncBusy} onClick={() => void syncSchemas()}>
          {syncBusy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          Sync catalog
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={healthHref}>Health</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={sizeChartHref}>Size chart</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-text-secondary text-sm">Загрузка schema feed…</p>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Category attribute schema</CardTitle>
            <CardDescription>Handbook attrs по leaf SKU · PG sync + W2 fix links.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[480px] overflow-x-auto overflow-y-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Leaf</TableHead>
                  <TableHead className="text-right">Filled</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead className="text-right">Fix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.sku} data-testid={`brand-attribute-schema-row-${row.sku}`}>
                    <TableCell>
                      <Link href={`/products/${row.slug}`} className="font-mono text-xs underline">
                        {row.sku}
                      </Link>
                      <p className="text-text-muted line-clamp-1 max-w-[180px] text-[10px]">
                        {row.name}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-mono text-[10px]">{row.leafId}</span>
                      <p className="text-text-muted line-clamp-1 max-w-[200px] text-[10px]">
                        {row.pathLabel}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.filledCount}/{row.schemaAttrCount}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.missingIds.length === 0 ? (
                        <span className="text-emerald-600">ok</span>
                      ) : (
                        <span className="text-text-muted">
                          {brandAttributeSchemaMissingLabels(row.missingIds)}
                          {row.missingIds.length > 4 ? '…' : ''}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.missingIds[0] ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link
                            href={brandAttributeMissingFixHref({
                              attributeId: row.missingIds[0],
                              articleId: row.slug,
                            })}
                            data-testid={`brand-attribute-schema-fix-${row.sku}`}
                          >
                            {brandAttributeMissingFixLabel(row.missingIds[0])}
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-text-muted text-[10px]">—</span>
                      )}
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
