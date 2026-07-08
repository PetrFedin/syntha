'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
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
  brandReleaseSyndicationChannelLabel,
  brandReleaseSyndicationToCsv,
  buildBrandReleaseSyndicationRows,
  summarizeBrandReleaseSyndication,
  techPackGateMapFromReleaseRows,
} from '@/lib/fashion/brand-release-syndication';
import { buildBrandLinesheetSyndicationSession } from '@/lib/fashion/brand-linesheet-syndication';
import { buildBrandTechPackReleaseGateRows } from '@/lib/fashion/brand-techpack-release-gate-rows';
import { getWorkshop2Phase1Dossier } from '@/lib/production/workshop2-phase1-dossier-storage';
import { pushBrandReleaseSyndication } from '@/lib/fashion/brand-release-syndication-push-store';
import type { Product } from '@/lib/types';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { FileSpreadsheet, Upload } from 'lucide-react';

type Props = {
  products: Product[];
};

export function BrandReleaseSyndicationPanel({ products }: Props) {
  const collectionId = PLATFORM_CORE_DEMO.collectionId;
  const rows = useMemo(() => {
    const techPackRows = buildBrandTechPackReleaseGateRows({
      products,
      collectionId,
      resolveDossier: (articleId) => getWorkshop2Phase1Dossier(collectionId, articleId),
    });
    return buildBrandReleaseSyndicationRows(products, {
      techPackBySku: techPackGateMapFromReleaseRows(techPackRows),
    });
  }, [products, collectionId]);
  const summary = useMemo(() => summarizeBrandReleaseSyndication(rows), [rows]);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushNotice, setPushNotice] = useState<string | null>(null);
  const [pushSucceeded, setPushSucceeded] = useState(false);
  const [storageMode, setStorageMode] = useState<string | null>(null);

  const downloadCsv = () => {
    const blob = new Blob([brandReleaseSyndicationToCsv(rows)], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `release-syndication-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const session = buildBrandLinesheetSyndicationSession({
    collectionId: PLATFORM_CORE_DEMO.collectionId,
  });

  const pushReady = async () => {
    setPushBusy(true);
    setPushNotice(null);
    setPushSucceeded(false);
    try {
      const res = await pushBrandReleaseSyndication({
        collectionId: PLATFORM_CORE_DEMO.collectionId,
      });
      if (!res.ok) {
        setPushNotice(res.messageRu);
        return;
      }
      if (res.storageMode) setStorageMode(res.storageMode);
      setPushSucceeded(true);
      setPushNotice(res.messageRu ?? `Push: ${res.readyCount} SKU — откройте publish strip.`);
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-release-syndication-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={downloadCsv}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export feed CSV
        </Button>
        <Badge variant="secondary">Ready: {summary.ready}</Badge>
        <Badge variant="outline">Pending: {summary.pending}</Badge>
        {storageMode ? (
          <Badge variant="outline" className="text-[10px] uppercase">
            {storageMode}
          </Badge>
        ) : null}
        <Button
          type="button"
          size="sm"
          disabled={pushBusy || summary.ready === 0}
          onClick={() => void pushReady()}
          data-testid="brand-release-syndication-push"
        >
          <Upload className="mr-2 h-4 w-4" />
          Push ready ({summary.ready})
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={session.checklistHref}>Release checklist</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={session.linesheetsHref}>B2B linesheets</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link
            href={session.techpackGateHref}
            data-testid="brand-release-syndication-techpack-gate-link"
          >
            Гейт фабричного пакета
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link
            href={session.showroomPublishHref}
            data-testid="brand-release-syndication-showroom-publish-link"
          >
            Публикация шоурума
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.shopShowroomHref}>Шоурум магазина</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.matrixHref}>Матрица магазина</Link>
        </Button>
        {pushSucceeded ? (
          <Button size="sm" asChild data-testid="brand-release-syndication-push-publish-cta">
            <Link href={session.showroomPublishHref}>Publish strip →</Link>
          </Button>
        ) : null}
      </div>

      {pushNotice ? (
        <p
          className="text-text-secondary text-xs"
          data-testid="brand-release-syndication-push-notice"
        >
          {pushNotice}
        </p>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Outbound syndication feed</CardTitle>
          <CardDescription>
            Colect-style feed после release gate: launch 100% + attrs ≥85% + factory pack 6/6 → все
            каналы.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[480px] overflow-x-auto overflow-y-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Launch</TableHead>
                <TableHead className="text-right">Attrs</TableHead>
                <TableHead className="text-right">Pack</TableHead>
                <TableHead>Channels</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.sku} data-testid={`brand-release-syndication-row-${row.sku}`}>
                  <TableCell>
                    <Link href={`/products/${row.slug}`} className="font-mono text-xs underline">
                      {row.sku}
                    </Link>
                    <p className="text-text-muted line-clamp-1 max-w-[180px] text-[10px]">
                      {row.name}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.launchPercent}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.attributePercent}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {row.techPackSheetsReady === null
                      ? '—'
                      : `${row.techPackSheetsReady}/${row.techPackSheetsTotal ?? 6}`}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.ready ? (
                      <span className="text-emerald-600">ready</span>
                    ) : (
                      <span className="text-text-muted">gate pending</span>
                    )}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {row.channels.map((ch) => (
                        <Badge key={ch} variant="outline" className="text-[9px]">
                          {brandReleaseSyndicationChannelLabel(ch)}
                        </Badge>
                      ))}
                    </div>
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
