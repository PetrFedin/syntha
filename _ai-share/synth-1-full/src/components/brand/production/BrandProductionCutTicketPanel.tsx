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
import {
  advanceBrandProductionCutTicket,
  fetchBrandProductionCutTickets,
} from '@/lib/brand-production/brand-production-cut-tickets-store';
import {
  buildBrandProductionCutTickets,
  labelBrandProductionCutTicketStatusRu,
} from '@/lib/brand-production/cut-tickets';
import { buildBrandProductionHandoffSession } from '@/lib/brand-production/brand-production-handoff';
import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import type { BrandProductionState } from '@/lib/brand-production';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { Loader2, Scissors } from 'lucide-react';

type Props = {
  state: BrandProductionState;
  selectedCollectionId: string;
  orderId?: string;
};

export function BrandProductionCutTicketPanel({ state, selectedCollectionId, orderId }: Props) {
  const collectionId = selectedCollectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const resolvedOrderId =
    orderId?.trim() || state.b2bOrderRefs.find((r) => r.status !== 'cancelled')?.orderRef;
  const localRows = useMemo(
    () => buildBrandProductionCutTickets(state, collectionId),
    [state, collectionId]
  );
  const [pgRows, setPgRows] = useState<ReturnType<typeof buildBrandProductionCutTickets>>([]);
  const [storageMode, setStorageMode] = useState<'pg' | 'file' | 'empty'>('empty');
  const [busyId, setBusyId] = useState<string | null>(null);

  const reloadPg = useCallback(() => {
    void fetchBrandProductionCutTickets({
      collectionId,
      orderId: resolvedOrderId,
    }).then((res) => {
      if (res.ok && res.rows.length) {
        setPgRows(res.rows);
        setStorageMode(res.storageMode);
      } else {
        setPgRows([]);
        setStorageMode('empty');
      }
    });
  }, [collectionId, resolvedOrderId]);

  useEffect(() => {
    reloadPg();
  }, [reloadPg]);

  const rows = pgRows.length ? pgRows : localRows;
  const session = buildBrandProductionHandoffSession({
    orderId: resolvedOrderId,
    collectionId,
  });
  const mfrOps = buildManufacturerProductionOpsSession({
    orderId: resolvedOrderId,
    collectionId,
  });

  const issueTicket = async (ticketId: string) => {
    setBusyId(ticketId);
    try {
      const res = await advanceBrandProductionCutTicket({ ticketId, nextStatus: 'issued' });
      if (res.ok) reloadPg();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-production-cut-ticket-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Scissors className="h-4 w-4" />
            <CardTitle className="text-base">Техкарты раскроя</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase">
              {rows.length} пакет(ов)
            </Badge>
            <Badge variant="outline" data-testid={`brand-cut-ticket-source-${storageMode}`}>
              {pgRows.length ? `PG · ${storageMode}` : 'Локальная модель'}
            </Badge>
          </div>
          <CardDescription>
            Рабочие пакеты из подтверждённых строк PO — мост передачи B2B → цех (столп 4).
            {pgRows.length ? ' PG workshop2_cut_tickets.' : ' Локальный fallback до синхронизации.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="text-text-secondary px-6 py-4 text-sm">
              Нет confirmed PO для выбранной коллекции. Подтвердите PO на вкладке «Операции».
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO</TableHead>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Фабрика</TableHead>
                  <TableHead>Кол-во</TableHead>
                  <TableHead>Размерный ряд</TableHead>
                  <TableHead>Дата раскроя</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} data-testid={`brand-cut-ticket-row-${row.id}`}>
                    <TableCell className="font-medium">{row.poCode}</TableCell>
                    <TableCell>
                      <div className="font-medium">{row.articleName}</div>
                      <div className="text-text-muted text-[10px]">{row.sku}</div>
                    </TableCell>
                    <TableCell>{row.factoryName}</TableCell>
                    <TableCell className="tabular-nums">{row.totalQty}</TableCell>
                    <TableCell className="text-xs">{row.sizeSummary || '—'}</TableCell>
                    <TableCell>{row.targetCutDate ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {labelBrandProductionCutTicketStatusRu(row.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pgRows.length && row.status === 'ready' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busyId != null}
                          onClick={() => void issueTicket(row.id)}
                          data-testid={`brand-cut-ticket-issue-${row.id}`}
                        >
                          {busyId === row.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Issue'
                          )}
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={session.handoffTabHref}>Вкладка передачи</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={session.factoryQueueHref}>Очередь цеха</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={mfrOps.cutTicketHref} data-testid="brand-cut-ticket-mfr-tab-link">
            Техкарта цеха
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={session.shopOrderCommsHref}>Трекинг заказа магазина</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.qcGateTabHref}>Гейт КК</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.productionFloorHref}>Пол цеха W2</Link>
        </Button>
      </div>
    </div>
  );
}
