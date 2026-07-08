'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
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
  buildBrandTechPackReleaseGateRows,
  summarizeBrandTechPackReleaseGate,
} from '@/lib/fashion/brand-techpack-release-gate-rows';
import { getWorkshop2Phase1Dossier } from '@/lib/production/workshop2-phase1-dossier-storage';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { brandTechPackExportHubHref } from '@/lib/production/workshop2-techpack-export-session';

type Props = {
  products: Product[];
  collectionId?: string;
};

export function BrandReleaseTechPackGatePanel({ products, collectionId }: Props) {
  const resolvedCollection = collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const rows = useMemo(
    () =>
      buildBrandTechPackReleaseGateRows({
        products,
        collectionId: resolvedCollection,
        resolveDossier: (articleId) => getWorkshop2Phase1Dossier(resolvedCollection, articleId),
      }),
    [products, resolvedCollection]
  );
  const summary = useMemo(() => summarizeBrandTechPackReleaseGate(rows), [rows]);

  return (
    <div className="space-y-4" data-testid="brand-release-techpack-gate-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          Factory pack ready: {summary.ready}/{summary.total}
        </Badge>
        <Link
          href={brandTechPackExportHubHref(resolvedCollection)}
          className="text-xs text-primary underline-offset-2 hover:underline"
        >
          W2 · factory pack hub
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tech pack · 6 листов</CardTitle>
          <CardDescription className="text-xs leading-snug">
            Release gate: все листы green + qty color×size bridge → showroom / handoff. SoT —
            Workshop 2 dossier (local/PG).
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[480px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Листы</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.sku} data-testid={`brand-release-techpack-row-${row.sku}`}>
                  <TableCell>
                    <Link
                      href={row.factoryPackHref}
                      className="font-mono text-xs underline"
                      data-testid={`brand-release-techpack-fix-${row.sku}`}
                    >
                      {row.sku}
                    </Link>
                    <p className="line-clamp-1 max-w-[200px] text-[10px] text-muted-foreground">
                      {row.name}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.sheetsReady}/{row.sheetsTotal}
                  </TableCell>
                  <TableCell className="text-xs">{row.qtyBridged ? 'bridge OK' : '—'}</TableCell>
                  <TableCell className="text-xs">
                    {row.ready ? (
                      <span className="text-emerald-600">ready</span>
                    ) : (
                      <span className="text-muted-foreground" title={row.blockersRu.join('; ')}>
                        {row.blockersRu[0] ?? 'blocked'}
                      </span>
                    )}
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
