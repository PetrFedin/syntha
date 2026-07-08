'use client';

import { useEffect, useState } from 'react';
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
import { IntegrationProductionWipStrip } from '@/components/integrations/IntegrationProductionWipStrip';
import { ManufacturerProductionAttachTzStrip } from '@/components/factory/ManufacturerProductionAttachTzStrip';
import { fetchBrandProductionCutTickets } from '@/lib/brand-production/brand-production-cut-tickets-store';
import { labelBrandProductionCutTicketStatusRu } from '@/lib/brand-production/cut-tickets';
import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { Scissors, Workflow } from 'lucide-react';

type Props = {
  factoryId?: string;
  orderId?: string;
  collectionId?: string;
  articleId?: string;
};

export function ManufacturerProductionWipPanel({
  factoryId,
  orderId,
  collectionId,
  articleId,
}: Props) {
  const session = buildManufacturerProductionOpsSession({
    factoryId,
    orderId,
    collectionId,
    articleId,
  });

  return (
    <div className="space-y-4" data-testid="manufacturer-production-wip-panel">
      <ManufacturerProductionAttachTzStrip
        collectionId={collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId}
        articleId={articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01'}
        orderId={orderId}
      />
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Workflow className="h-4 w-4" />
            <CardTitle className="text-base">Незавершёнка · цех</CardTitle>
          </div>
          <CardDescription>Apparel Magic/WFX: MES release · ERP · floor routing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {orderId ? (
            <IntegrationProductionWipStrip
              wholesaleOrderId={orderId}
              variant="factory"
              allowAdvance
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href={session.shopFloorHref} data-testid="manufacturer-wip-shop-floor-link">
                Shop floor
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={session.materialsHref}>Материалы</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ManufacturerProductionCutTicketPanel({
  factoryId,
  orderId,
  collectionId,
  articleId,
}: Props) {
  const session = buildManufacturerProductionOpsSession({
    factoryId,
    orderId,
    collectionId,
    articleId,
  });
  const cid = collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const oid = orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const [rows, setRows] = useState<
    Awaited<ReturnType<typeof fetchBrandProductionCutTickets>>['rows']
  >([]);
  const [storageMode, setStorageMode] = useState<'pg' | 'file' | 'empty'>('empty');

  useEffect(() => {
    void fetchBrandProductionCutTickets({ collectionId: cid, orderId: oid }).then((res) => {
      if (res.ok) {
        setRows(res.rows);
        setStorageMode(res.storageMode);
      }
    });
  }, [cid, oid]);

  return (
    <div className="space-y-4" data-testid="manufacturer-production-cut-ticket-panel">
      <ManufacturerProductionAttachTzStrip
        collectionId={cid}
        articleId={articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01'}
        orderId={oid}
      />
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Scissors className="h-4 w-4" />
            <CardTitle className="text-base">Техкарта раскроя · WIP</CardTitle>
            <Badge variant="outline" data-testid={`manufacturer-cut-ticket-source-${storageMode}`}>
              {rows.length ? `Brand PG · ${storageMode}` : 'Links only'}
            </Badge>
          </div>
          <CardDescription>
            Столп 4 · brand cut ticket ↔ factory dossier ↔ tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>PO</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} data-testid={`manufacturer-cut-ticket-row-${row.id}`}>
                    <TableCell className="font-mono text-xs">
                      {'ticketNo' in row ? (row as { ticketNo?: string }).ticketNo : row.id}
                    </TableCell>
                    <TableCell>{row.poCode}</TableCell>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell className="tabular-nums">{row.totalQty}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {labelBrandProductionCutTicketStatusRu(row.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-text-secondary text-xs">
              Нет PG cut tickets — откройте brand tab для sync или seed SS27.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link
                href={session.brandCutTicketHref}
                data-testid="manufacturer-cut-ticket-brand-link"
              >
                Техкарта раскроя бренда
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={session.dossierHref}>Досье производства</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
