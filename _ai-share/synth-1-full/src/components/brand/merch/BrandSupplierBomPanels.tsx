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
import { SupplierBomPreview } from '@/components/platform/SupplierBomPreview';
import type { BrandSupplierBomFeedRow } from '@/lib/fashion/brand-supplier-bom-feed';
import {
  fetchBrandSupplierBomFeed,
  refreshBrandSupplierBomFeed,
} from '@/lib/fashion/brand-supplier-bom-store';
import { buildBrandSupplierBomSession } from '@/lib/fashion/brand-supplier-bom-workspace';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { BrandDevBomAltMaterialApprovalStrip } from '@/components/brand/merch/BrandDevBomAltMaterialApprovalStrip';
import { Loader2 } from 'lucide-react';

type Props = {
  collectionId?: string;
  articleId?: string;
};

export function BrandSupplierBomLinesPanel({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
  articleId = PLATFORM_CORE_DEMO.demoArticleId,
}: Props) {
  const { snapshot } = usePillarSnapshot({
    collectionId,
    pillarId: 'order_production',
    roleId: 'supplier',
    articleId,
    pillarVariant: 'brand',
    enabled: true,
  });

  const snapshotLines = useMemo(
    () => snapshot?.supplierProcurement?.bomLines ?? [],
    [snapshot]
  );

  const [rows, setRows] = useState<BrandSupplierBomFeedRow[]>([]);
  const [summary, setSummary] = useState({ total: 0, filled: 0, pgSourced: 0 });
  const [storageMode, setStorageMode] = useState('demo');
  const [loading, setLoading] = useState(true);
  const [syncBusy, setSyncBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetchBrandSupplierBomFeed({
      collectionId,
      articleId,
      snapshotLines,
    });
    setRows(res.rows ?? []);
    setSummary(res.summary ?? { total: 0, filled: 0, pgSourced: 0 });
    setStorageMode(res.storageMode ?? 'demo');
  }, [articleId, collectionId, snapshotLines]);

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

  const syncBom = async () => {
    setSyncBusy(true);
    try {
      const res = await refreshBrandSupplierBomFeed({
        collectionId,
        articleId,
        snapshotLines,
      });
      if (res.ok && res.rows) {
        setRows(res.rows);
        setSummary(res.summary ?? summary);
        setStorageMode(res.storageMode ?? storageMode);
      } else {
        await reload();
      }
    } finally {
      setSyncBusy(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-supplier-bom-lines-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Lines: {summary.total}</Badge>
        <Badge variant="outline">Filled: {summary.filled}</Badge>
        <Badge variant="outline" data-testid={`brand-supplier-bom-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG BOM' : `Local ${storageMode}`}
        </Badge>
        <Button size="sm" variant="outline" disabled={syncBusy} onClick={() => void syncBom()}>
          {syncBusy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          Sync BOM
        </Button>
      </div>
      <BrandDevBomAltMaterialApprovalStrip collectionId={collectionId} articleId={articleId} />
      <SupplierBomPreview demo={{ ...PLATFORM_CORE_DEMO, collectionId, demoArticleId: articleId }} compact hideLead />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">BOM lines · persisted</CardTitle>
          <CardDescription>Snapshot merge + PG seed — не пустой demo stub.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <p className="text-text-secondary p-4 text-sm">Загрузка BOM…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-text-muted text-xs">
                      Нет BOM lines — нажмите Sync BOM.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.lineId} data-testid={`brand-supplier-bom-row-${row.lineId}`}>
                      <TableCell>{row.materialName}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{row.qty}</TableCell>
                      <TableCell className="text-xs">{row.unit}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandSupplierBomProcurementPanel({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
  articleId = PLATFORM_CORE_DEMO.demoArticleId,
}: Props) {
  const session = buildBrandSupplierBomSession({ collectionId, articleId });
  const threadsHref = `${ROUTES.brand.messages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=entities`;

  return (
    <div className="space-y-4" data-testid="brand-supplier-bom-procurement-panel">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Procurement · RFQ</CardTitle>
          <CardDescription>Centric RFQ → supplier quote → award (столпы 1 + 4 + 5).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.centricRfqHref}>Centric RFQ</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={threadsHref}>Треды сущностей</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
