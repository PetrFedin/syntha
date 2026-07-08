'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, HelpCircle, Plus } from 'lucide-react';
import { SectionBlock } from '@/components/brand/SectionBlock';
import type { HistoryEntry } from '@/components/brand/SectionBlock';
import { registryFeedLayout } from '@/lib/ui/registry-feed-layout';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { mergePartnerGrowthSlice } from '../organization-partner-growth';
import { mergePartnerCountsWithPatches } from '../organization-partner-counts';
import {
  PARTNER_BUSINESS_PROCESSES,
  mergePartnerBusinessProcessesWithPatches,
} from '../organization-partner-processes';
import {
  PARTNER_ECOSYSTEM_BLOCKS,
  mergePartnerEcosystemBlocksWithPatches,
} from '../organization-partner-ecosystem-blocks';
import { PARTNER_ROLE_LABELS } from '../organization-partner-role-meta';
import { SECTION_META } from '../organization-section-meta';
import { pickPartnerEcosystemPatches } from '../organization-partner-ecosystem-patches';
import { OrgHubCardStripSkeleton } from './organization-hub-skeletons';

export type OrganizationPartnerEcosystemSectionProps = {
  modulesPeriodKey: '7d' | '30d';
  globalHistory: HistoryEntry[];
  partnerEcosystem?: unknown;
  /** Пока грузится дашборд/профиль — не показываем статические карточки поверх пустых патчей */
  dashboardLoading?: boolean;
};

export function OrganizationPartnerEcosystemSection({
  modulesPeriodKey,
  globalHistory,
  partnerEcosystem,
  dashboardLoading,
}: OrganizationPartnerEcosystemSectionProps) {
  const growthPeriodKey: '7d' | '30d' = modulesPeriodKey;
  const { countsPatchById, growthByPeriod, businessProcessesPatchById, ecosystemBlocksPatchById } =
    useMemo(() => pickPartnerEcosystemPatches(partnerEcosystem), [partnerEcosystem]);
  const partnerCounts = useMemo(
    () => mergePartnerCountsWithPatches(countsPatchById),
    [countsPatchById]
  );
  const partnerProcesses = useMemo(
    () =>
      mergePartnerBusinessProcessesWithPatches(
        PARTNER_BUSINESS_PROCESSES,
        businessProcessesPatchById
      ),
    [businessProcessesPatchById]
  );
  const ecosystemBlocks = useMemo(
    () =>
      mergePartnerEcosystemBlocksWithPatches(PARTNER_ECOSYSTEM_BLOCKS, ecosystemBlocksPatchById),
    [ecosystemBlocksPatchById]
  );
  const growthDetail = useMemo(
    () => mergePartnerGrowthSlice(growthPeriodKey, growthByPeriod).items,
    [growthPeriodKey, growthByPeriod]
  );

  return (
    <SectionBlock
      title="Партнёрская экосистема"
      meta={SECTION_META.partners}
      accentColor="blue"
      history={globalHistory}
    >
      <TooltipProvider delayDuration={200}>
        <div className={cn(registryFeedLayout.panelCardSoft, 'p-4 md:p-5')}>
          {dashboardLoading ? (
            <OrgHubCardStripSkeleton
              busyLabel="Загрузка партнёрской экосистемы"
              rows={[
                { cards: 4, titleWidthClass: 'w-52' },
                { cards: 4, titleWidthClass: 'w-56' },
                { cards: 4, titleWidthClass: 'w-52' },
              ]}
            />
          ) : (
            <>
              <p className="text-text-muted mb-2 text-[9px] font-semibold uppercase tracking-wide">
                Партнёры по типам • за {growthPeriodKey === '7d' ? '7 дн.' : '30 дн.'}
              </p>
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
                {partnerCounts.map((item) => {
                  const Icon = item.icon;
                  const hasProgress =
                    item.progressValue != null && item.progressMax != null && item.progressMax > 0;
                  const progressPct = hasProgress
                    ? Math.round((item.progressValue! / item.progressMax!) * 100)
                    : 0;
                  const periodGrowth = growthDetail.find(
                    (d: { label: string; value: string; href: string }) => d.label === item.label
                  );
                  const trendStr = periodGrowth?.value ?? item.trend ?? '';
                  const trendNum = trendStr ? parseInt(trendStr.replace(/\D/g, ''), 10) : 0;
                  const currentNum = item.value.includes('/')
                    ? parseInt(item.value.split('/')[0], 10)
                    : parseInt(item.value, 10);
                  const previousNum = Number.isNaN(currentNum)
                    ? 0
                    : Math.max(0, currentNum - (trendStr.startsWith('-') ? -trendNum : trendNum));
                  const changePct =
                    trendNum && previousNum > 0 ? Math.round((trendNum / previousNum) * 100) : null;
                  const trendUp = trendStr ? !trendStr.startsWith('-') : false;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'relative flex min-h-[280px] w-[200px] shrink-0 flex-col rounded-xl border p-3 transition-colors',
                        (item.alertCount ?? 0) > 0
                          ? 'border-rose-200 bg-rose-50/50'
                          : 'border-border-default hover:border-border-default bg-white'
                      )}
                    >
                      {changePct != null && (
                        <p
                          className={cn(
                            'absolute right-2 top-2 text-[9px] font-bold tabular-nums',
                            trendUp ? 'text-emerald-600' : 'text-rose-600'
                          )}
                        >
                          {trendUp ? '+' : ''}
                          {changePct}%
                        </p>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg text-white',
                            item.color
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                      </div>
                      <div className="mt-2 flex items-start gap-1">
                        <Link
                          href={item.href}
                          className="group/link block min-w-0 flex-1"
                          title={item.description}
                          aria-label={`${item.label}: ${item.value}`}
                        >
                          <p className="text-text-primary group-hover/link:text-accent-primary text-lg font-bold tabular-nums">
                            {item.value}
                          </p>
                          <p className="text-text-secondary text-[9px] font-semibold uppercase">
                            {item.label}
                          </p>
                        </Link>
                        <div className="flex shrink-0 items-center gap-1">
                          {(item.alertCount ?? 0) > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  role="img"
                                  aria-label={
                                    item.statusShort ||
                                    item.statusShort2 ||
                                    `Требуют внимания по «${item.label}»: ${item.alertCount}`
                                  }
                                  className="flex h-5 min-w-5 cursor-help items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white"
                                >
                                  {item.alertCount! > 99 ? '99+' : item.alertCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                aria-hidden
                                className="max-w-[220px] text-xs"
                              >
                                {item.statusShort ||
                                  item.statusShort2 ||
                                  `Требуют внимания: ${item.alertCount}`}
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {(item.description || (item.tips && item.tips.length > 0)) && (
                            <Popover modal={false}>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="text-text-muted hover:bg-bg-surface2 hover:text-text-secondary shrink-0 rounded p-0.5"
                                  aria-label={`Подсказка: ${item.label}`}
                                >
                                  <HelpCircle className="size-3.5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="end"
                                side="bottom"
                                className="z-[200] w-64 rounded-xl p-3 text-left"
                                onOpenAutoFocus={(e) => e.preventDefault()}
                              >
                                {item.description && (
                                  <p className="text-text-secondary mb-2 text-xs leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                                {item.tips && item.tips.length > 0 && (
                                  <ul className="text-text-secondary list-inside list-disc space-y-0.5 text-[9px]">
                                    {item.tips.map((t, i) => (
                                      <li key={i}>{t}</li>
                                    ))}
                                  </ul>
                                )}
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </div>
                      {item.roleInChain && (
                        <p className="text-text-muted mt-0.5 text-[8px]">
                          {PARTNER_ROLE_LABELS[item.roleInChain]}
                        </p>
                      )}
                      {item.subline && (
                        <p className="text-text-secondary mt-1 line-clamp-1 text-[9px]">
                          {item.subline}
                        </p>
                      )}
                      {item.businessProcesses && item.businessProcesses.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                          {item.businessProcesses.map((bp) => (
                            <Link
                              key={bp.href}
                              href={bp.href}
                              onClick={(e) => e.stopPropagation()}
                              className="text-accent-primary text-[8px] hover:underline"
                            >
                              {bp.label}
                            </Link>
                          ))}
                        </div>
                      )}
                      {item.statusShort2 &&
                        (item.statusHref2 ? (
                          <Link
                            href={item.statusHref2}
                            className="text-accent-primary mt-1 line-clamp-1 text-[9px] font-medium hover:underline"
                          >
                            {item.statusShort2} →
                          </Link>
                        ) : (
                          <p className="text-text-secondary mt-1 line-clamp-1 text-[9px]">
                            {item.statusShort2}
                          </p>
                        ))}
                      {item.statusShort &&
                        (item.statusHref ? (
                          <Link
                            href={item.statusHref}
                            className={cn(
                              'text-accent-primary line-clamp-1 text-[9px] font-medium hover:underline',
                              item.statusShort2 ? 'mt-0.5' : 'mt-1'
                            )}
                          >
                            {item.statusShort} →
                          </Link>
                        ) : (
                          <p
                            className={cn(
                              'text-text-secondary line-clamp-1 text-[9px]',
                              item.statusShort2 ? 'mt-0.5' : 'mt-1'
                            )}
                          >
                            {item.statusShort}
                          </p>
                        ))}
                      {item.detailMetrics && item.detailMetrics.length > 0 && (
                        <div className="mt-2 space-y-0.5">
                          {item.detailMetrics.slice(0, 3).map((m) =>
                            m.href ? (
                              <Link
                                key={m.label}
                                href={m.href}
                                onClick={(e) => e.stopPropagation()}
                                className="text-text-secondary hover:text-accent-primary flex justify-between text-[9px]"
                              >
                                <span className="truncate">{m.label}</span>
                                <span className="ml-1 shrink-0 font-semibold tabular-nums">
                                  {m.value} →
                                </span>
                              </Link>
                            ) : (
                              <div
                                key={m.label}
                                className="text-text-secondary flex justify-between text-[9px]"
                              >
                                <span className="truncate">{m.label}</span>
                                <span className="ml-1 shrink-0 font-semibold tabular-nums">
                                  {m.value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                      {hasProgress && (
                        <div className="mt-2">
                          <Progress
                            value={progressPct}
                            className="bg-bg-surface2 h-1.5"
                            indicatorClassName="bg-amber-500"
                          />
                          <p className="text-text-muted mt-0.5 text-[8px]">
                            активно {item.progressValue}/{item.progressMax}
                          </p>
                        </div>
                      )}
                      <div className="border-border-subtle mt-auto flex items-center justify-between gap-2 border-t pt-3">
                        <Link
                          href={item.href}
                          className="text-accent-primary hover:text-accent-primary flex items-center gap-0.5 text-[9px] font-semibold"
                        >
                          Открыть раздел
                          <ArrowRight className="size-3" />
                        </Link>
                        <Link
                          href={item.addHref}
                          onClick={(e) => e.stopPropagation()}
                          className="text-text-secondary hover:text-accent-primary flex items-center gap-0.5 text-[9px] font-medium"
                        >
                          <Plus className="size-3" />
                          {item.addLabel}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-text-muted mb-2 mt-6 text-[9px] font-semibold uppercase tracking-wide">
                Связь с процессами • за {growthPeriodKey === '7d' ? '7 дн.' : '30 дн.'}
              </p>
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
                {partnerProcesses.map((p) => {
                  const Icon = p.icon;
                  const count = growthPeriodKey === '7d' ? p.count7d : p.count30d;
                  const changePct = growthPeriodKey === '7d' ? p.changePct7d : p.changePct30d;
                  return (
                    <div
                      key={p.id}
                      className="border-border-default hover:border-border-default relative flex min-h-[280px] w-[200px] shrink-0 flex-col rounded-xl border bg-white p-3 transition-colors"
                    >
                      {changePct != null && (
                        <p
                          className={cn(
                            'absolute right-2 top-2 text-[9px] font-bold tabular-nums',
                            changePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          )}
                        >
                          {changePct >= 0 ? '+' : ''}
                          {changePct}%
                        </p>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg text-white',
                            p.color
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                      </div>
                      <div className="mt-2 flex items-start gap-1">
                        <Link
                          href={p.href}
                          className="group/link block min-w-0 flex-1"
                          title={p.description}
                          aria-label={`${p.label}: ${count}`}
                        >
                          <p className="text-text-primary group-hover/link:text-accent-primary text-lg font-bold tabular-nums">
                            {count}
                          </p>
                          <p className="text-text-secondary text-[9px] font-semibold uppercase">
                            {p.label}
                          </p>
                        </Link>
                        {(p.description || (p.tips && p.tips.length > 0)) && (
                          <Popover modal={false}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="text-text-muted hover:bg-bg-surface2 hover:text-text-secondary shrink-0 rounded p-0.5"
                                aria-label={`Подсказка: ${p.label}`}
                              >
                                <HelpCircle className="size-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              side="bottom"
                              className="z-[200] w-64 rounded-xl p-3 text-left"
                            >
                              {p.description && (
                                <p className="text-text-secondary mb-2 text-xs leading-relaxed">
                                  {p.description}
                                </p>
                              )}
                              {p.tips && p.tips.length > 0 && (
                                <ul className="text-text-secondary list-inside list-disc space-y-0.5 text-[9px]">
                                  {p.tips.map((t, i) => (
                                    <li key={i}>{t}</li>
                                  ))}
                                </ul>
                              )}
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <p className="text-text-secondary mt-1 line-clamp-1 text-[9px]">{p.sub}</p>
                      {p.detailMetrics && p.detailMetrics.length > 0 && (
                        <div className="mt-2 space-y-0.5">
                          {p.detailMetrics.slice(0, 3).map((m) =>
                            m.href ? (
                              <Link
                                key={m.label}
                                href={m.href}
                                onClick={(e) => e.stopPropagation()}
                                className="text-text-secondary hover:text-accent-primary flex justify-between text-[9px]"
                              >
                                <span className="truncate">{m.label}</span>
                                <span className="ml-1 shrink-0 font-semibold tabular-nums">
                                  {m.value} →
                                </span>
                              </Link>
                            ) : (
                              <div
                                key={m.label}
                                className="text-text-secondary flex justify-between text-[9px]"
                              >
                                <span className="truncate">{m.label}</span>
                                <span className="ml-1 shrink-0 font-semibold tabular-nums">
                                  {m.value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                      <div className="border-border-subtle mt-auto flex items-center justify-between gap-2 border-t pt-3">
                        <Link
                          href={p.href}
                          className="text-accent-primary hover:text-accent-primary flex items-center gap-0.5 text-[9px] font-semibold"
                        >
                          Открыть раздел
                          <ArrowRight className="size-3" />
                        </Link>
                        {p.addHref && p.addLabel && (
                          <Link
                            href={p.addHref}
                            onClick={(e) => e.stopPropagation()}
                            className="text-text-secondary hover:text-accent-primary flex items-center gap-0.5 text-[9px] font-medium"
                          >
                            <Plus className="size-3" />
                            {p.addLabel}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-text-muted mb-2 mt-6 text-[9px] font-semibold uppercase tracking-wide">
                Процессы и области • за {growthPeriodKey === '7d' ? '7 дн.' : '30 дн.'}
              </p>
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
                {ecosystemBlocks.map((b) => {
                  const BlockIcon = b.icon;
                  const blockMetrics =
                    growthPeriodKey === '7d'
                      ? (b.metrics7d ?? b.metrics)
                      : (b.metrics30d ?? b.metrics);
                  const blockAlertCount =
                    growthPeriodKey === '7d'
                      ? (b.alertCount7d ?? b.alertCount ?? 0)
                      : (b.alertCount30d ?? b.alertCount ?? 0);
                  const changePct = growthPeriodKey === '7d' ? b.changePct7d : b.changePct30d;
                  return (
                    <div
                      key={b.id}
                      role="article"
                      aria-label={b.titleLines ? b.titleLines.join(' ') : b.title}
                      className={cn(
                        'relative flex min-h-[280px] w-[200px] shrink-0 flex-col rounded-xl border p-3 text-left transition-colors',
                        blockAlertCount > 0
                          ? 'border-rose-200 bg-rose-50/30 hover:bg-rose-50/50'
                          : 'border-border-default hover:border-border-default hover:bg-bg-surface2/80 bg-white'
                      )}
                    >
                      {changePct != null && (
                        <p
                          className={cn(
                            'absolute right-2 top-2 text-[9px] font-bold tabular-nums',
                            changePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          )}
                        >
                          {changePct >= 0 ? '+' : ''}
                          {changePct}%
                        </p>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg text-white',
                            b.color
                          )}
                        >
                          <BlockIcon className="size-4" />
                        </div>
                      </div>
                      <div className="mb-1.5 mt-2 flex items-start justify-between gap-2">
                        <Link
                          href={b.href}
                          className="text-text-primary hover:text-accent-primary min-w-0 flex-1 text-sm font-bold uppercase leading-tight tracking-tight"
                        >
                          {b.titleLines ? (
                            <>
                              <span>{b.titleLines[0]}</span>
                              <span className="block">{b.titleLines[1]}</span>
                            </>
                          ) : (
                            b.title
                          )}
                        </Link>
                        <div className="flex shrink-0 items-center gap-1">
                          {blockAlertCount > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  role="img"
                                  aria-label={
                                    b.alertTooltip ??
                                    `Требуют внимания в блоке «${b.titleLines ? b.titleLines.join(' ') : b.title}»: ${blockAlertCount}`
                                  }
                                  className="flex h-5 min-w-5 cursor-help items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white"
                                >
                                  {blockAlertCount > 99 ? '99+' : blockAlertCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                aria-hidden
                                className="max-w-[220px] text-xs"
                              >
                                {b.alertTooltip ?? `Требуют внимания: ${blockAlertCount}`}
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Popover modal={false}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="text-text-muted hover:bg-bg-surface2 hover:text-text-secondary shrink-0 rounded p-0.5"
                                aria-label={`Описание: ${b.titleLines ? b.titleLines.join(' ') : b.title}`}
                              >
                                <HelpCircle className="size-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              side="bottom"
                              className="z-[200] w-64 rounded-xl p-3 text-left"
                            >
                              <p className="text-text-secondary text-xs leading-relaxed">
                                {b.description}
                              </p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <ul className="mt-1 space-y-0.5">
                        {blockMetrics.slice(0, 3).map((m) => (
                          <li key={m.label}>
                            {m.href ? (
                              <Link
                                href={m.href}
                                className="text-text-secondary hover:text-accent-primary flex justify-between text-[9px]"
                              >
                                <span className="truncate">{m.label}</span>
                                <span className="ml-1 shrink-0 font-semibold tabular-nums">
                                  {m.value} →
                                </span>
                              </Link>
                            ) : (
                              <div className="text-text-secondary flex justify-between text-[9px]">
                                <span className="truncate">{m.label}</span>
                                <span className="ml-1 shrink-0 font-semibold tabular-nums">
                                  {m.value}
                                </span>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      <div className="border-border-subtle mt-auto flex items-center justify-between gap-2 border-t pt-3">
                        <Link
                          href={b.href}
                          className="text-accent-primary hover:text-accent-primary flex items-center gap-0.5 text-[9px] font-semibold"
                        >
                          Открыть раздел
                          <ArrowRight className="size-3" />
                        </Link>
                        {b.addHref && b.addLabel && (
                          <Link
                            href={b.addHref}
                            onClick={(e) => e.stopPropagation()}
                            className="text-text-secondary hover:text-accent-primary flex items-center gap-0.5 text-[9px] font-medium"
                          >
                            <Plus className="size-3" />
                            {b.addLabel}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </TooltipProvider>
    </SectionBlock>
  );
}
