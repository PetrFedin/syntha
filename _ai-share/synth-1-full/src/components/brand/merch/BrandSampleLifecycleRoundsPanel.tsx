'use client';

import Link from 'next/link';
import { useMemo } from 'react';
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
  brandSampleLifecycleRoundLabel,
  buildBrandSampleLifecycleRows,
  summarizeBrandSampleLifecycle,
} from '@/lib/fashion/brand-sample-lifecycle';
import { BrandSampleLifecycleCommsPeerStrip } from '@/components/brand/merch/BrandSampleLifecycleCommsPeerStrip';
import { BrandSampleLifecycleRowStatusPushButton } from '@/components/brand/merch/BrandSampleLifecycleRowStatusPushButton';
import type { Product } from '@/lib/types';

type Props = {
  products: Product[];
  collectionId: string;
};

export function BrandSampleLifecycleRoundsPanel({ products, collectionId }: Props) {
  const rows = useMemo(
    () => buildBrandSampleLifecycleRows(products, collectionId),
    [products, collectionId]
  );
  const summary = useMemo(() => summarizeBrandSampleLifecycle(rows), [rows]);

  return (
    <div className="space-y-4" data-testid="brand-sample-lifecycle-rounds-panel">
      <BrandSampleLifecycleCommsPeerStrip collectionId={collectionId} />
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">SKU: {summary.total}</Badge>
        <Badge variant="outline">Approved: {summary.approved}</Badge>
        <Badge variant="outline">In progress: {summary.inProgress}</Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sample rounds · Centric path</CardTitle>
          <CardDescription>
            Proto → SMS → Gold → Approved. Peer href в W2 sample или dossier цеха.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[480px] overflow-x-auto overflow-y-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Round</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next</TableHead>
                <TableHead className="text-right">Push</TableHead>
                <TableHead className="text-right">Peer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.sku} data-testid={`brand-sample-lifecycle-row-${row.sku}`}>
                  <TableCell>
                    <span className="font-mono text-xs">{row.sku}</span>
                    <p className="text-text-muted line-clamp-1 max-w-[160px] text-[10px]">
                      {row.name}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {brandSampleLifecycleRoundLabel(row.round)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs uppercase">{row.status}</TableCell>
                  <TableCell className="text-text-muted max-w-[180px] text-[10px]">
                    {row.nextActionRu}
                  </TableCell>
                  <TableCell className="text-right">
                    <BrandSampleLifecycleRowStatusPushButton
                      collectionId={collectionId}
                      articleId={row.articleId}
                      sku={row.sku}
                      disabled={row.status === 'approved'}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={row.peerHref}>{row.peerLabel}</Link>
                    </Button>
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
