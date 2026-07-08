'use client';

import Link from 'next/link';
import { Factory, GitBranch, Package, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Workshop2ReleaseProductionStripModel } from '@/lib/production/workshop2-release-production-display';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { workshop2ContextToProductionFloorFromSampleOrder } from '@/lib/production/workshop2-floor-bridge';
import { workshop2PgMirrorNum } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

type Props = {
  model: Workshop2ReleaseProductionStripModel;
  collectionId: string;
  articleUrlSegment: string;
  /** Статус активного заказа образца — для вкладки очереди на полу. */
  activeSampleOrderStatus?: string;
  dossier?: Workshop2DossierPhase1 | null;
  /** Mini trend (0–100) для sparkline, например [ops%, lead norm, rework inverse]. */
  sparklineValues?: number[];
};

function ClickableChip({
  href,
  testId,
  children,
  variant = 'outline',
}: {
  href: string;
  testId: string;
  children: React.ReactNode;
  variant?: 'outline' | 'secondary';
}) {
  return (
    <Link href={href} data-testid={testId}>
      <Badge
        variant={variant}
        className="cursor-pointer text-[10px] font-normal transition-colors hover:bg-indigo-50 hover:text-indigo-800"
      >
        {children}
      </Badge>
    </Link>
  );
}

/** Верхняя полоска вкладки «Производство»: SKU, версии ТЗ, critical path, активный заказ. */
export function Workshop2ReleaseProductionStrip({
  model,
  collectionId,
  articleUrlSegment,
  activeSampleOrderStatus,
  dossier = null,
  sparklineValues,
}: Props) {
  const floorHref = workshop2ContextToProductionFloorFromSampleOrder(
    { collectionId, articleLineId: articleUrlSegment },
    activeSampleOrderStatus
  );
  const taMirror = dossier?.planTaMirror;
  const taOverdue = taMirror ? workshop2PgMirrorNum(taMirror, 'overdueCount') : 0;
  const taDelayed = taMirror ? workshop2PgMirrorNum(taMirror, 'delayedCount') : 0;
  const planHref = model.chipLinks.plan.href;

  return (
    <div
      className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-3"
      data-testid="workshop2-release-production-strip"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-text-primary flex items-center gap-1.5 text-[11px] font-semibold">
            <Factory className="h-3.5 w-3.5 text-indigo-600" />
            Производство · образец
          </p>
          <div className="flex flex-wrap gap-1.5">
            <ClickableChip href={model.chipLinks.fit.href} testId={model.chipLinks.fit.testId}>
              SKU {model.skuLabel}
            </ClickableChip>
            <ClickableChip href={model.chipLinks.plan.href} testId={model.chipLinks.plan.testId}>
              ТЗ {model.dossierVersionLabel}
            </ClickableChip>
            <ClickableChip href={model.chipLinks.qc.href} testId={model.chipLinks.qc.testId}>
              Лекала {model.patternPackVersionLabel}
            </ClickableChip>
            <Badge variant="secondary" className="text-[10px] font-normal">
              <GitBranch className="mr-0.5 inline h-3 w-3" />
              {model.routingStepCount} шаг. маршрута
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-normal">
              {model.operationsCount} опер.
            </Badge>
            {model.developmentPathLabelRu ? (
              <Badge
                variant={model.criticalPathReady ? 'default' : 'outline'}
                className={cn(
                  'text-[10px] font-normal',
                  model.developmentPathTone === 'emerald' && 'bg-emerald-600 hover:bg-emerald-600',
                  model.developmentPathTone === 'amber' &&
                    'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                )}
                data-testid="workshop2-release-strip-critical-path"
              >
                {model.developmentPathLabelRu}
              </Badge>
            ) : null}
            {taMirror && (taOverdue > 0 || taDelayed > 0) ? (
              <Link href={planHref} data-testid="workshop2-release-strip-ta-risk">
                <Badge
                  variant="outline"
                  className={cn(
                    'cursor-pointer text-[10px] font-normal',
                    taOverdue > 0
                      ? 'border-rose-300 bg-rose-50 text-rose-900'
                      : 'border-amber-300 bg-amber-50 text-amber-900'
                  )}
                >
                  T&amp;A {taOverdue > 0 ? `просроч. ${taOverdue}` : `задерж. ${taDelayed}`}
                </Badge>
              </Link>
            ) : null}
            {sparklineValues && sparklineValues.length > 0 ? (
              <div
                className="flex h-4 items-end gap-0.5"
                data-testid="workshop2-release-strip-sparkline"
                title="Production metrics trend"
              >
                {sparklineValues.slice(0, 5).map((v, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-sm bg-indigo-400/80"
                    style={{ height: `${Math.max(4, Math.min(100, v))}%` }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex min-w-[200px] flex-col items-end gap-1.5">
          {model.activeSampleOrderId ? (
            <div className="text-right">
              <p className="text-text-muted text-[10px]">Заказ образца</p>
              <p
                className="font-mono text-[10px] text-slate-800"
                data-testid="workshop2-release-active-sample-order-id"
              >
                {model.activeSampleOrderId.slice(0, 12)}
                {model.activeSampleOrderId.length > 12 ? '…' : ''}
              </p>
              <p className="text-[10px] text-slate-600">
                {model.sampleOrderStatusLabel ?? '—'}
                {model.movementStatusLabel ? ` · ${model.movementStatusLabel}` : ''}
              </p>
            </div>
          ) : (
            <p className="text-text-muted text-[10px]">Нет активного заказа образца</p>
          )}
          <div className="flex flex-wrap justify-end gap-1.5">
            <Button type="button" variant="outline" size="sm" className="h-7 text-[10px]" asChild>
              <Link href={model.chipLinks.fit.href} data-testid="workshop2-release-link-fit-sample">
                <Package className="mr-1 h-3 w-3" />
                Образец (примерка)
              </Link>
            </Button>
            <Button type="button" variant="default" size="sm" className="h-7 text-[10px]" asChild>
              <Link href={floorHref} data-testid="workshop2-release-link-floor-queue">
                <Warehouse className="mr-1 h-3 w-3" />В цех
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
