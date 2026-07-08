'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { factoryProductionOrdersOrderContextHref } from '@/lib/routes';

type TimelineStep = {
  id: string;
  labelRu: string;
  done: boolean;
  current: boolean;
};

type Props = {
  orderId: string;
  productionOrderId?: string;
  factoryId?: string;
  compact?: boolean;
};

/** Компактный WIP timeline из PG/file (Wave SJ). */
export function MfrProductionTimelineStrip({
  orderId,
  productionOrderId,
  factoryId,
  compact = false,
}: Props) {
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [labelRu, setLabelRu] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<string>('file');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!orderId.trim() && !productionOrderId?.trim()) return;
    let cancelled = false;
    const qs = new URLSearchParams();
    if (orderId.trim()) qs.set('orderId', orderId.trim());
    if (productionOrderId?.trim()) qs.set('productionOrderId', productionOrderId.trim());
    void fetch(`/api/workshop2/manufacturer/production-timeline?${qs.toString()}`, {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    })
      .then(async (res) => {
        const json = (await res.json()) as {
          timeline?: {
            steps?: TimelineStep[];
            poStageLabelRu?: string;
            storageMode?: string;
            messageRu?: string;
          };
        };
        if (cancelled) return;
        setSteps(json.timeline?.steps ?? []);
        setLabelRu(json.timeline?.poStageLabelRu ?? json.timeline?.messageRu ?? null);
        setStorageMode(json.timeline?.storageMode ?? 'file');
      })
      .catch(() => {
        if (!cancelled) {
          setSteps([]);
          setLabelRu(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, productionOrderId]);

  if (!loaded || steps.length === 0) return null;

  return (
    <div
      className={
        compact
          ? 'flex flex-wrap items-center gap-1.5'
          : 'space-y-1.5 rounded-md border border-amber-200/70 bg-amber-50/30 px-2 py-1.5'
      }
      data-testid="mfr-op-production-timeline-strip"
    >
      {!compact ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-semibold text-amber-950">WIP · цех</p>
          <Badge
            variant="outline"
            className="text-[8px] uppercase"
            data-testid="mfr-op-production-timeline-storage"
          >
            {storageMode === 'postgres' ? 'PG WIP' : 'WIP local'}
          </Badge>
          {labelRu ? (
            <span
              className="text-[10px] text-amber-900"
              data-testid="mfr-op-production-timeline-stage"
            >
              {labelRu}
            </span>
          ) : null}
        </div>
      ) : (
        <span className="text-text-muted text-[10px]">WIP</span>
      )}
      <ol className="flex flex-wrap gap-1" data-testid="mfr-op-production-timeline-steps">
        {steps.map((step) => (
          <li key={step.id}>
            <Badge
              variant={step.current ? 'default' : step.done ? 'secondary' : 'outline'}
              className="text-[8px] font-medium"
              data-testid={`mfr-op-production-timeline-step-${step.id}`}
            >
              {step.labelRu}
            </Badge>
          </li>
        ))}
      </ol>
      {!compact && orderId.trim() ? (
        <Link
          href={factoryProductionOrdersOrderContextHref(orderId, { factoryId })}
          className="text-accent-primary text-[10px] hover:underline"
          data-testid="mfr-op-production-timeline-orders-link"
        >
          Реестр PO
        </Link>
      ) : null}
    </div>
  );
}
