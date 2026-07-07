'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, HelpCircle, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SectionBlock } from '@/components/brand/SectionBlock';
import type { HistoryEntry } from '@/components/brand/SectionBlock';
import { registryFeedLayout } from '@/lib/ui/registry-feed-layout';
import { cn } from '@/lib/utils';
import {
  mergeNavigationCardsWithModuleStats,
  type ModuleStatPatch,
} from '../organization-navigation-cards';
import { SECTION_META } from '../organization-section-meta';
import { OrgHubModulesStripSkeleton } from './organization-hub-skeletons';

export type OrganizationModulesSectionProps = {
  modulesPeriodKey: '7d' | '30d';
  globalHistory: HistoryEntry[];
  participantsCount: number;
  moduleStatsByHref?: Record<string, ModuleStatPatch> | null;
  dashboardLoading?: boolean;
};

export function OrganizationModulesSection({
  modulesPeriodKey,
  globalHistory,
  participantsCount,
  moduleStatsByHref,
  dashboardLoading,
}: OrganizationModulesSectionProps) {
  const router = useRouter();

  const navigationCards = useMemo(
    () => mergeNavigationCardsWithModuleStats(moduleStatsByHref ?? undefined),
    [moduleStatsByHref]
  );
  return (
    <div id="sections-modules" className="scroll-mt-4">
      <SectionBlock
        title="Разделы организации"
        meta={SECTION_META.modules}
        accentColor="emerald"
        history={globalHistory}
      >
        <div className={cn(registryFeedLayout.panelCardSoft, 'p-4 md:p-5')}>
          {dashboardLoading ? (
            <OrgHubModulesStripSkeleton />
          ) : (
            <>
              <p className="text-text-muted mb-2 text-[9px] font-semibold uppercase tracking-wide">
                {modulesPeriodKey === '7d' ? 'За 7 дн.' : 'За 30 дн.'}
              </p>
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
                {navigationCards.map((card) => {
                  const changePct =
                    modulesPeriodKey === '7d' ? card.changePct7d : card.changePct30d;
                  const addHref = card.addHref;
                  const addLabel = card.addLabel;
                  const CardIcon = card.icon;
                  return (
                    <div
                      key={card.href}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(card.href)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(card.href);
                        }
                      }}
                      aria-label={`Перейти в раздел: ${card.title}`}
                      className={cn(
                        'relative flex min-h-[280px] w-[200px] shrink-0 cursor-pointer flex-col rounded-xl border p-3 text-left transition-colors',
                        card.stats.status === 'warning'
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
                            card.bg.replace('-50', '-500')
                          )}
                        >
                          <CardIcon className="size-4" />
                        </div>
                      </div>
                      <div className="mt-2 flex items-start justify-between gap-2">
                        <h3 className="text-text-primary min-w-0 flex-1 text-sm font-bold uppercase leading-tight tracking-tight">
                          {card.title}
                        </h3>
                        <div
                          className="flex shrink-0 items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {card.stats.status === 'warning' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  role="img"
                                  aria-label={`Требует внимания в разделе «${card.title}»: ${card.stats.label} ${card.title === 'Команда' ? participantsCount : card.stats.value}`}
                                  className="flex h-5 min-w-5 cursor-help items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white"
                                >
                                  {/^\d+$/.test(String(card.stats.value)) ? card.stats.value : '!'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                aria-hidden
                                className="max-w-[220px] text-xs"
                              >
                                Требует внимания: {card.stats.label} {card.stats.value}. Откройте
                                раздел для устранения.
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Popover modal={false}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="text-text-muted hover:bg-bg-surface2 hover:text-text-secondary rounded p-0.5"
                                aria-label={`Описание раздела «${card.title}»`}
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
                                {card.description}
                              </p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <div className="text-text-secondary flex justify-between text-[9px]">
                          <span className="truncate">{card.stats.label}</span>
                          <span
                            className={cn(
                              'ml-1 shrink-0 font-semibold tabular-nums',
                              card.stats.status === 'success'
                                ? 'text-emerald-600'
                                : card.stats.status === 'warning'
                                  ? 'text-amber-600'
                                  : 'text-text-primary'
                            )}
                          >
                            {card.title === 'Команда' ? participantsCount : card.stats.value}
                          </span>
                        </div>
                      </div>
                      <div className="border-border-subtle mt-auto flex items-center justify-between gap-2 border-t pt-3">
                        <button
                          type="button"
                          className="text-accent-primary hover:text-accent-primary flex items-center gap-0.5 text-left text-[9px] font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(card.href);
                          }}
                        >
                          Открыть раздел
                          <ArrowRight className="size-3 shrink-0" />
                        </button>
                        {addHref && addLabel ? (
                          <button
                            type="button"
                            className="text-text-secondary hover:text-accent-primary flex items-center gap-0.5 text-left text-[9px] font-medium"
                            aria-label={`${addLabel}, раздел «${card.title}»`}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(addHref);
                            }}
                          >
                            <Plus className="size-3 shrink-0" />
                            {addLabel}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </SectionBlock>
    </div>
  );
}
