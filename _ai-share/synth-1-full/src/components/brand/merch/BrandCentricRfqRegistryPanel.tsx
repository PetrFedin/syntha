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
import { summarizeBrandCentricRfqRegistry } from '@/lib/fashion/brand-centric-rfq-registry';
import { fetchBrandCentricRfqRegistry } from '@/lib/fashion/brand-centric-rfq-registry-store';
import { brandMessagesWorkshop2ArticleContextHref, ROUTES } from '@/lib/routes';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';

type Props = {
  collectionId: string;
  articleId: string;
};

export function BrandCentricRfqRegistryPanel({ collectionId, articleId }: Props) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchBrandCentricRfqRegistry>>>([]);

  const reload = useCallback(async () => {
    setRows(await fetchBrandCentricRfqRegistry());
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const summary = useMemo(() => summarizeBrandCentricRfqRegistry(rows), [rows]);
  const commsHref = `${ROUTES.brand.messages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=entities`;
  const rfqThreadHref = `${brandMessagesWorkshop2ArticleContextHref(collectionId, articleId)}&q=${encodeURIComponent('Centric RFQ award')}`;

  return (
    <div className="space-y-4" data-testid="brand-centric-rfq-registry-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">RFQ: {summary.total}</Badge>
        <Badge variant="outline">Open: {summary.open}</Badge>
        <Badge variant="outline">Awarded: {summary.awarded}</Badge>
        <Button size="sm" variant="outline" type="button" onClick={() => void reload()}>
          Refresh
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={commsHref}>Треды сущностей</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={rfqThreadHref}>RFQ chat</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">RFQ registry</CardTitle>
          <CardDescription>Centric import → spine procurement (file/PG snapshot).</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ</TableHead>
                <TableHead>Article</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Lines</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-text-muted text-xs">
                    Нет RFQ — импортируйте на вкладке RFQ.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.rfqId} data-testid={`brand-centric-rfq-row-${row.rfqId}`}>
                    <TableCell className="font-mono text-[10px]">{row.rfqId}</TableCell>
                    <TableCell className="font-mono text-xs">{row.articleId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.lineCount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
