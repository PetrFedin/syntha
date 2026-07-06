'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePlatformCoreChainOverview } from '@/components/platform/usePlatformCoreChainOverview';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import {
  getPlatformCoreHubRowsForUi,
  PLATFORM_CORE_PILLARS,
  isPlatformCoreEmptyChainCollection,
  type CoreHubPillarId,
} from '@/lib/platform-core-hub-matrix';
import {
  ROLE_LABELS,
  formatReadinessScore,
  getPlatformCoreReadinessMatrix,
  summarizePlatformCoreReadiness,
  type ReadinessCell,
} from '@/lib/platform-core-readiness-audit';
import { PlatformCoreReadinessMatrixSkeleton } from '@/components/platform/PlatformCoreReadinessMatrixSkeleton';
import { hubSectionLabelClassName, platformCoreHubLayout } from '@/lib/platform-core-hub-layout';
import { cn } from '@/lib/utils';
import { buildPlatformCoreReadinessImprovements } from '@/lib/platform-core-readiness-improvements';
import type { ReadinessImprovementItem } from '@/lib/platform-core-readiness-improvements';
import {
  readinessMatrixCellKey,
  READINESS_ROLE_COL,
  READINESS_ROLE_COL_STICKY,
  READINESS_PILLAR_COL,
  READINESS_MATRIX_HEAD_H,
  READINESS_MATRIX_BODY_H,
  READINESS_PILLAR_HEAD,
  READINESS_SCORE_BOX,
  READINESS_ROW_LABEL,
  READINESS_CELL_CORE,
} from '@/lib/platform-core-readiness-matrix-layout';
import {
  MatrixColumnLabel,
  ReadinessScoreTrigger,
  ScoreTooltipBody,
  ReadinessCellSectionsPanel,
  ReadinessImprovementsPanel,
} from '@/components/platform/PlatformCoreReadinessMatrixParts';

type Props = {
  collectionId?: string;
  /** Hub audit: заголовок «Оценка готовности» уже в PlatformCoreHubAuditLauncher. */
  hideSectionHeader?: boolean;
  /** Показать строку live/static режима при скрытом заголовке (блок аудита). */
  showModeLead?: boolean;
};

/** Интерактивная матрица 5×N: оценка, разворот разделов, переход по клику (N = baseline 2 или extended 4). */
export function PlatformCorePillarRoleScoreMatrix({
  collectionId = 'SS27',
  hideSectionHeader = false,
  showModeLead = false,
}: Props) {
  const isMobile = useIsMobile();
  const hubRowsForUi = useMemo(() => getPlatformCoreHubRowsForUi(), []);
  const { overview, overviewStatus } = usePlatformCoreChainOverview(collectionId);
  const emptyChain = isPlatformCoreEmptyChainCollection(collectionId);
  const [pgReachable, setPgReachable] = useState<boolean | null>(null);
  const [demoSeeded, setDemoSeeded] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [sheetCell, setSheetCell] = useState<ReadinessCell | null>(null);
  const [improvementsScope, setImprovementsScope] = useState<CoreHubPillarId | 'all' | null>(
    null
  );
  const [improvementsSheetOpen, setImprovementsSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/workshop2/platform-core/health', {
          headers: buildWorkshop2ApiRequestHeaders(),
          cache: 'no-store',
        });
        const json = (await res.json()) as { pgReachable?: boolean; demoSeeded?: boolean };
        if (!cancelled) {
          setPgReachable(json.pgReachable === true);
          setDemoSeeded(json.demoSeeded === true);
        }
      } catch {
        if (!cancelled) {
          setPgReachable(false);
          setDemoSeeded(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveChain =
    !emptyChain && pgReachable === true && demoSeeded === true && overviewStatus === 'ready';

  const cells = useMemo(
    () => getPlatformCoreReadinessMatrix(collectionId, { liveChain }),
    [collectionId, liveChain]
  );

  const summaryStatic = useMemo(() => summarizePlatformCoreReadiness(cells, 'static'), [cells]);
  const summaryLive = useMemo(() => summarizePlatformCoreReadiness(cells, 'live'), [cells]);
  const allImprovements = useMemo(
    () => buildPlatformCoreReadinessImprovements(cells),
    [cells]
  );
  const improvementsByPillar = useMemo(() => {
    const map = {} as Record<CoreHubPillarId, ReadinessImprovementItem[]>;
    for (const pillar of PLATFORM_CORE_PILLARS) {
      map[pillar.id] = buildPlatformCoreReadinessImprovements(cells, { pillarId: pillar.id });
    }
    return map;
  }, [cells]);
  const overallActiveStatic = summaryStatic.activeCellsAvg;
  const overallActiveLive = summaryLive.activeCellsAvg;

  const readinessMode = liveChain ? 'pg-live' : pgReachable === false ? 'pg-unreachable' : 'static';

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openSections = (cell: ReadinessCell, key: string) => {
    if (isMobile) {
      setSheetCell(cell);
      return;
    }
    toggleExpand(key);
  };

  const displayedImprovements =
    improvementsScope === 'all'
      ? allImprovements
      : improvementsScope
        ? improvementsByPillar[improvementsScope] ?? []
        : [];

  const sheetPillarTitle = sheetCell
    ? (PLATFORM_CORE_PILLARS.find((p) => p.id === sheetCell.pillarId)?.title ?? sheetCell.pillarId)
    : '';

  const roleHeadClass = cn(
    READINESS_ROLE_COL_STICKY,
    READINESS_MATRIX_HEAD_H,
    'text-text-muted pl-1.5 pr-1 text-left text-[10px] font-semibold uppercase tracking-wide'
  );
  const roleHeadFixedClass = cn(
    READINESS_ROLE_COL,
    READINESS_MATRIX_HEAD_H,
    'text-text-muted border-border-subtle border-r bg-white pl-1.5 pr-1 text-left text-[10px] font-semibold uppercase tracking-wide'
  );
  const roleRowClass = cn(
    READINESS_ROLE_COL_STICKY,
    READINESS_MATRIX_BODY_H,
    'text-text-primary border-border-subtle/60 border-t pl-1.5 pr-1 text-left align-top'
  );
  const roleRowFixedClass = cn(
    READINESS_ROLE_COL,
    READINESS_MATRIX_BODY_H,
    'text-text-primary border-border-subtle/60 border-r border-t bg-white pl-1.5 pr-1 text-left align-top'
  );

  const renderPillarCell = (
    row: (typeof hubRowsForUi)[number],
    pillar: (typeof PLATFORM_CORE_PILLARS)[number]
  ) => {
    const cell = cells.find((c) => c.roleId === row.id && c.pillarId === pillar.id);
    if (!cell) {
      return (
        <td
          key={pillar.id}
          className={cn(
            READINESS_PILLAR_COL,
            READINESS_MATRIX_BODY_H,
            'border-border-subtle/60 border-t'
          )}
        />
      );
    }
    const key = readinessMatrixCellKey(row.id, pillar.id);
    const isOpen = expanded.has(key);
    const hubCell = row.pillars[pillar.id];
    const participates = hubCell.kind === 'active';

    return (
      <td
        key={pillar.id}
        data-testid={`readiness-cell-${row.id}-${pillar.id}`}
        className={cn(
          READINESS_PILLAR_COL,
          isOpen ? 'min-h-[2.5rem] align-top py-1' : READINESS_MATRIX_BODY_H,
          'border-border-subtle/60 border-t'
        )}
      >
        <div className={READINESS_CELL_CORE}>
          {participates ? (
            <ReadinessScoreTrigger
              cell={cell}
              live={liveChain}
              isOpen={isOpen}
              onToggleSections={
                cell.subItems.length > 0 ? () => openSections(cell, key) : undefined
              }
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  data-testid={`readiness-score-${row.id}-${pillar.id}`}
                  className={cn(
                    READINESS_SCORE_BOX,
                    'text-text-muted border-border-subtle bg-bg-surface2/50'
                  )}
                >
                  —
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm p-3">
                <ScoreTooltipBody cell={cell} live={liveChain} />
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {!isMobile && isOpen && participates ? (
          <ReadinessCellSectionsPanel
            cell={cell}
            live={liveChain}
            testIdPrefix={`readiness-sub-${row.id}-${pillar.id}`}
            variant="inline"
          />
        ) : null}
      </td>
    );
  };

  const improvementsPanelRow =
    !isMobile && improvementsScope ? (
      <tr data-testid="readiness-improvements-row">
        <td colSpan={PLATFORM_CORE_PILLARS.length + 1} className="border-border-subtle border-t px-3 pb-4 pt-2">
          <ReadinessImprovementsPanel
            items={displayedImprovements}
            filterPillarId={improvementsScope === 'all' ? undefined : improvementsScope}
            variant="inline"
          />
        </td>
      </tr>
    ) : null;

  return (
    <TooltipProvider delayDuration={200}>
      <Sheet
        open={improvementsSheetOpen}
        onOpenChange={(open) => {
          setImprovementsSheetOpen(open);
          if (!open) setImprovementsScope(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[min(88vh,720px)] overflow-y-auto rounded-t-2xl px-4 pb-6 pt-2"
          accessibilityTitle="Доработки готовности Platform Core"
        >
          <SheetHeader className="space-y-1 pb-2 text-left">
            <SheetTitle className="text-base">
              {improvementsScope === 'all'
                ? 'Все доработки'
                : `Доработки · ${PLATFORM_CORE_PILLARS.find((p) => p.id === improvementsScope)?.title ?? ''}`}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Связи внутри роли, между ролями и между столпами — по убыванию важности
            </SheetDescription>
          </SheetHeader>
          <ReadinessImprovementsPanel
            items={
              improvementsScope === 'all'
                ? allImprovements
                : improvementsScope
                  ? improvementsByPillar[improvementsScope] ?? []
                  : []
            }
            filterPillarId={improvementsScope === 'all' ? undefined : improvementsScope ?? undefined}
            variant="sheet"
          />
        </SheetContent>
      </Sheet>
      <Sheet open={sheetCell != null} onOpenChange={(open) => !open && setSheetCell(null)}>
        <SheetContent
          side="bottom"
          className="max-h-[min(88vh,720px)] overflow-y-auto rounded-t-2xl px-4 pb-6 pt-2"
          accessibilityTitle="Разделы оценки готовности"
        >
          {sheetCell ? (
            <>
              <SheetHeader className="space-y-1 pb-2 text-left">
                <SheetTitle className="text-base">
                  {ROLE_LABELS[sheetCell.roleId]} · {sheetPillarTitle}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Разделы столпа и оценки готовности
                </SheetDescription>
              </SheetHeader>
              <ReadinessCellSectionsPanel
                cell={sheetCell}
                live={liveChain}
                testIdPrefix={`readiness-sub-${sheetCell.roleId}-${sheetCell.pillarId}`}
                variant="sheet"
              />
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      <div data-testid="platform-core-readiness-matrix" className={platformCoreHubLayout.sectionStack}>
        {hideSectionHeader ? null : (
          <p className={hubSectionLabelClassName()}>Оценка готовности</p>
        )}
        {hideSectionHeader && !showModeLead ? null : (
          <p
            data-testid="platform-core-readiness-mode"
            data-mode={readinessMode}
            className={cn(platformCoreHubLayout.readinessModeLead, 'text-text-secondary')}
          >
            {liveChain
              ? `Live · средняя готовность ${formatReadinessScore(overallActiveLive)}/10 по ролям и разделам.`
              : pgReachable === false
                ? `PostgreSQL недоступен · статическая база аудита · среднее ${formatReadinessScore(overallActiveStatic)}/10.`
                : `Ожидание данных цепочки · ориентировочные оценки · среднее ${formatReadinessScore(overallActiveStatic)}/10.`}
          </p>
        )}
        {overviewStatus === 'loading' && pgReachable === null ? (
          <PlatformCoreReadinessMatrixSkeleton />
        ) : (
        <div className="border-border-subtle max-h-[min(72vh,780px)] overflow-auto rounded-xl border bg-white shadow-sm">
          {isMobile ? (
            <div className="grid w-full grid-cols-[5.35rem_minmax(0,1fr)] overflow-hidden p-3">
              <table className="w-full border-separate border-spacing-0 bg-white text-[11px]">
                <thead>
                  <tr>
                    <th scope="col" className={roleHeadFixedClass}>
                      Роль
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hubRowsForUi.map((row) => (
                    <tr key={row.id}>
                      <th scope="row" className={roleRowFixedClass}>
                        <div className={READINESS_ROW_LABEL}>
                          <MatrixColumnLabel text={row.label} align="start" />
                        </div>
                      </th>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="min-w-0 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <table className="min-w-max border-separate border-spacing-0 text-[11px]">
                  <thead>
                    <tr>
                      {PLATFORM_CORE_PILLARS.map((pillar) => (
                        <th
                          key={pillar.id}
                          scope="col"
                          className={cn(READINESS_PILLAR_HEAD, 'text-text-muted font-semibold')}
                        >
                          <MatrixColumnLabel text={pillar.title} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hubRowsForUi.map((row) => (
                      <tr key={row.id}>
                        {PLATFORM_CORE_PILLARS.map((pillar) => renderPillarCell(row, pillar))}
                      </tr>
                    ))}
                    {improvementsPanelRow}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overscroll-x-contain p-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:p-5 [&::-webkit-scrollbar]:hidden">
              <table className="w-full min-w-max border-separate border-spacing-0 text-[11px]">
                <thead className="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_rgb(226_232_240)]">
                  <tr>
                    <th scope="col" className={roleHeadClass}>
                      Роль
                    </th>
                    {PLATFORM_CORE_PILLARS.map((pillar) => (
                      <th
                        key={pillar.id}
                        scope="col"
                        className={cn(READINESS_PILLAR_HEAD, 'text-text-muted font-semibold')}
                      >
                        <MatrixColumnLabel text={pillar.title} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hubRowsForUi.map((row) => (
                    <tr key={row.id}>
                      <th scope="row" className={roleRowClass}>
                        <div className={READINESS_ROW_LABEL}>
                          <MatrixColumnLabel text={row.label} align="start" />
                        </div>
                      </th>
                      {PLATFORM_CORE_PILLARS.map((pillar) => renderPillarCell(row, pillar))}
                    </tr>
                  ))}
                  {improvementsPanelRow}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </div>
    </TooltipProvider>
  );
}
