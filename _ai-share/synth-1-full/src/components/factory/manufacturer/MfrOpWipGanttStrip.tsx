'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { factoryProductionOrdersOrderContextHref } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { MfrOpWipGanttSoTStrip } from '@/components/factory/manufacturer/MfrOpWipGanttSoTStrip';
import { MfrOpWipFloorTabletSoTStrip } from '@/components/factory/manufacturer/MfrOpWipFloorTabletSoTStrip';

type GanttRow = {
  productionOrderId: string;
  b2bOrderId: string;
  poStageLabelRu: string;
  progressPercent: number;
};

type Props = {
  factoryId: string;
  orderId?: string;
  compact?: boolean;
  maxRows?: number;
  handoffQueueHref?: string;
  showSoTStrip?: boolean;
  showFloorSoTStrip?: boolean;
};

/** Компактный Gantt/WIP по production_orders из PG (Wave WJ). */
export function MfrOpWipGanttStrip({
  factoryId,
  orderId,
  compact = false,
  maxRows = 5,
  handoffQueueHref,
  showSoTStrip = false,
  showFloorSoTStrip = false,
}: Props) {
  const [rows, setRows] = useState<GanttRow[]>([]);
  const [storageMode, setStorageMode] = useState<string>('file');
  const [storageModeLabelRu, setStorageModeLabelRu] = useState<string | null>(null);
  const [messageRu, setMessageRu] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!factoryId.trim()) return;
    let cancelled = false;
    const qs = new URLSearchParams({ factoryId: factoryId.trim() });
    if (orderId?.trim()) qs.set('orderId', orderId.trim());
    qs.set('limit', String(maxRows));
    void fetch(`/api/workshop2/manufacturer/production-orders-timeline?${qs.toString()}`, {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    })
      .then(async (res) => {
        const json = (await res.json()) as {
          storageModeLabelRu?: string;
          timeline?: {
            rows?: GanttRow[];
            storageMode?: string;
            storageModeLabelRu?: string;
            messageRu?: string;
          };
        };
        if (cancelled) return;
        setRows(json.timeline?.rows ?? []);
        setStorageMode(json.timeline?.storageMode ?? 'file');
        setStorageModeLabelRu(json.storageModeLabelRu ?? json.timeline?.storageModeLabelRu ?? null);
        setMessageRu(json.timeline?.messageRu ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          setMessageRu(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [factoryId, orderId, maxRows]);

  if (!loaded) return null;

  if (rows.length === 0) {
    return (
      <div className="space-y-1">
        {showSoTStrip && handoffQueueHref ? (
          <MfrOpWipGanttSoTStrip variant="gantt-owner" handoffQueueHref={handoffQueueHref} />
        ) : null}
        {showFloorSoTStrip && handoffQueueHref ? (
          <MfrOpWipFloorTabletSoTStrip variant="gantt-owner" handoffQueueHref={handoffQueueHref} />
        ) : null}
        <p className="text-text-muted text-[10px]" data-testid="mfr-op-wip-gantt-empty">
          {messageRu ?? 'Нет серий для Ганта'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        compact
          ? 'space-y-1 border-t border-amber-100/60 pt-1.5'
          : 'space-y-1.5 rounded-md border border-amber-200/70 bg-amber-50/30 px-2 py-1.5'
      )}
      data-testid="mfr-op-wip-gantt-strip"
    >
      {showSoTStrip && handoffQueueHref ? (
        <MfrOpWipGanttSoTStrip variant="gantt-owner" handoffQueueHref={handoffQueueHref} />
      ) : null}
      {showFloorSoTStrip && handoffQueueHref ? (
        <MfrOpWipFloorTabletSoTStrip variant="gantt-owner" handoffQueueHref={handoffQueueHref} />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-semibold text-amber-950">Гант · WIP</p>
        <Badge
          variant="outline"
          className="text-[8px] uppercase"
          data-testid="mfr-op-wip-gantt-storage"
        >
          {storageModeLabelRu ?? (storageMode === 'postgres' ? 'WIP · PostgreSQL' : 'WIP · файл')}
        </Badge>
        {messageRu ? (
          <span className="text-text-muted text-[9px]" data-testid="mfr-op-wip-gantt-summary">
            {messageRu}
          </span>
        ) : null}
      </div>
      <ul className="space-y-1" data-testid="mfr-op-wip-gantt-rows">
        {rows.map((row) => (
          <li
            key={row.productionOrderId}
            className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
            data-testid={`mfr-op-wip-gantt-row-${row.productionOrderId}`}
          >
            <Link
              href={factoryProductionOrdersOrderContextHref(row.b2bOrderId, { factoryId })}
              className="text-accent-primary min-w-[4.5rem] font-mono text-[9px] hover:underline"
              data-testid={`mfr-op-wip-gantt-po-link-${row.productionOrderId}`}
            >
              {row.productionOrderId}
            </Link>
            <div
              className="bg-bg-surface2 border-border-subtle relative h-3 min-w-[5rem] flex-1 overflow-hidden rounded-sm border"
              data-testid={`mfr-op-wip-gantt-bar-${row.productionOrderId}`}
              title={row.poStageLabelRu}
            >
              <div
                className="bg-accent-primary/80 h-full transition-[width]"
                style={{ width: `${row.progressPercent}%` }}
                data-testid={`mfr-op-wip-gantt-fill-${row.productionOrderId}`}
              />
            </div>
            <span
              className="text-text-secondary min-w-[4.5rem] text-[9px]"
              data-testid={`mfr-op-wip-gantt-stage-${row.productionOrderId}`}
            >
              {row.poStageLabelRu}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
