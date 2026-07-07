'use client';

import Link from 'next/link';
import {
  Award,
  ArrowRight,
  Building2,
  CheckCircle,
  CheckSquare,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SectionBlock } from '@/components/brand/SectionBlock';
import type { HistoryEntry } from '@/components/brand/SectionBlock';
import { registryFeedLayout } from '@/lib/ui/registry-feed-layout';
import { cn } from '@/lib/utils';
import { ALERT_BLOCK_META, SECTION_META } from '../organization-section-meta';
import type { AttentionAlertsState } from '../use-attention-alerts';

function ResolveAlertLink({
  id,
  detailHref,
  className,
  onDismiss,
  stopPropagation,
}: {
  id: string;
  detailHref: string;
  className: string;
  onDismiss?: (itemId: string) => void;
  stopPropagation?: boolean;
}) {
  if (onDismiss) {
    return (
      <button
        type="button"
        className={className}
        aria-label="Убрать напоминание из списка «Требует внимания»"
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation();
          onDismiss(id);
        }}
      >
        Устранить
      </button>
    );
  }
  return (
    <Link
      href={detailHref}
      className={className}
      {...(stopPropagation ? { onClick: (e) => e.stopPropagation() } : {})}
    >
      Устранить
    </Link>
  );
}

export type OrganizationAttentionAlertsSectionProps = {
  globalHistory: HistoryEntry[];
  healthLoading: boolean;
  alerts: AttentionAlertsState;
  getBlockLabel?: (key: string) => string;
  dismissCertificate?: (id: string) => void;
  dismissProfile?: (id: string) => void;
  dismissTask?: (id: string) => void;
  dismissIntegrationIssue?: (id: string) => void;
};

export function OrganizationAttentionAlertsSection({
  globalHistory,
  healthLoading,
  alerts,
  getBlockLabel,
  dismissCertificate,
  dismissProfile,
  dismissTask,
  dismissIntegrationIssue,
}: OrganizationAttentionAlertsSectionProps) {
  return (
    <>
      {/* Требует внимания */}
      <SectionBlock
        title="Требует внимания"
        meta={SECTION_META.alerts}
        accentColor="rose"
        className="min-w-0 overflow-hidden"
        history={globalHistory}
      >
        <div className={cn(registryFeedLayout.panelCardSoft, 'p-4 md:p-5')}>
          <div className="flex h-[200px] flex-nowrap gap-3 overflow-x-auto py-1">
            {healthLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="border-border-subtle bg-bg-surface2 h-[200px] w-[240px] min-w-[240px] shrink-0 animate-pulse rounded-xl border"
                    aria-hidden
                  />
                ))}
              </>
            ) : !alerts?.certificates?.length &&
              !alerts?.profile?.length &&
              !alerts?.tasks?.length &&
              !alerts?.integrationIssues?.length ? (
              <div className="flex h-[200px] w-[240px] min-w-[240px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle className="size-6 text-emerald-600" />
                </div>
                <p className="text-xs font-black uppercase text-emerald-800">Всё в порядке</p>
                <p className="text-[9px] text-emerald-700">Нет срочных действий</p>
              </div>
            ) : (
              <>
                {/* Истекающие сертификаты */}
                {alerts?.certificates?.length > 0 &&
                  (() => {
                    const meta = ALERT_BLOCK_META.certificates;
                    return (
                      <div className="h-[200px] w-[240px] min-w-[240px] shrink-0">
                        <Popover>
                          <PopoverTrigger asChild>
                            <div
                              role="button"
                              tabIndex={0}
                              aria-label={`${getBlockLabel?.('certificates') ?? meta.title}. Открыть подробности, записей: ${alerts.certificates.length}`}
                              className="flex h-full cursor-pointer flex-col rounded-xl border border-amber-200 bg-amber-50/50 p-3 outline-none transition-colors hover:bg-amber-50/80 focus-visible:ring-2 focus-visible:ring-amber-300"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  (e.currentTarget as HTMLElement).click();
                                }
                              }}
                            >
                              <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                                    <Award className="size-4 text-amber-600" />
                                  </div>
                                  <h4 className="truncate text-[9px] font-black uppercase text-amber-800">
                                    {getBlockLabel?.('certificates') ?? meta.title}
                                  </h4>
                                </div>
                                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        type="button"
                                        className="text-text-muted rounded p-0.5 hover:bg-amber-100 hover:text-amber-600"
                                        aria-label={`Описание: ${meta.title}`}
                                      >
                                        <HelpCircle className="size-3.5" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      align="end"
                                      className="w-72 rounded-xl p-3 text-left"
                                    >
                                      <p className="text-text-secondary text-xs leading-relaxed">
                                        {meta.description}
                                      </p>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              <ul className="mb-2 min-h-0 flex-1 space-y-1.5 overflow-auto">
                                {alerts.certificates.map(
                                  (c: { id: string; name: string; daysLeft: number }) => (
                                    <li
                                      key={c.id}
                                      className="text-text-primary flex items-center justify-between gap-2 text-xs"
                                    >
                                      <span className="truncate">{c.name}</span>
                                      <span className="shrink-0 font-bold text-amber-600">
                                        {c.daysLeft} дн.
                                      </span>
                                      <ResolveAlertLink
                                        id={c.id}
                                        detailHref={meta.detailHref}
                                        className="shrink-0 text-[8px] font-semibold text-amber-700 hover:underline"
                                        stopPropagation
                                        onDismiss={dismissCertificate}
                                      />
                                    </li>
                                  )
                                )}
                              </ul>
                              <div className="mt-auto flex justify-start gap-2">
                                <Link
                                  href={meta.detailHref}
                                  className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-700 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Детально <ArrowRight className="size-3" />
                                </Link>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="max-h-[80vh] w-[320px] overflow-y-auto rounded-xl p-4"
                          >
                            <h4 className="mb-2 text-xs font-black uppercase text-amber-800">
                              {meta.title}
                            </h4>
                            <p className="text-text-secondary mb-3 text-xs leading-relaxed">
                              {meta.description}
                            </p>
                            <ul className="mb-3 space-y-1.5">
                              {alerts.certificates.map(
                                (c: { id: string; name: string; daysLeft: number }) => (
                                  <li
                                    key={c.id}
                                    className="text-text-primary flex items-center justify-between gap-2 text-xs"
                                  >
                                    <span className="truncate">{c.name}</span>
                                    <span className="shrink-0 font-bold text-amber-600">
                                      {c.daysLeft} дн.
                                    </span>
                                    <ResolveAlertLink
                                      id={c.id}
                                      detailHref={meta.detailHref}
                                      className="shrink-0 text-[8px] font-semibold text-amber-700 hover:underline"
                                      onDismiss={dismissCertificate}
                                    />
                                  </li>
                                )
                              )}
                            </ul>
                            <div className="flex justify-start">
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="text-[9px] font-bold"
                              >
                                <Link
                                  href={meta.detailHref}
                                  className="inline-flex items-center gap-0.5"
                                >
                                  Детально <ArrowRight className="size-3" />
                                </Link>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    );
                  })()}
                {/* Незаполненные данные */}
                {alerts?.profile?.length > 0 &&
                  (() => {
                    const meta = ALERT_BLOCK_META.profile;
                    return (
                      <div className="h-[200px] w-[240px] min-w-[240px] shrink-0">
                        <Popover>
                          <PopoverTrigger asChild>
                            <div
                              role="button"
                              tabIndex={0}
                              aria-label={`${getBlockLabel?.('profile') ?? meta.title}. Открыть подробности, записей: ${alerts.profile.length}`}
                              className="flex h-full cursor-pointer flex-col rounded-xl border border-rose-200 bg-rose-50/50 p-3 outline-none transition-colors hover:bg-rose-50/80 focus-visible:ring-2 focus-visible:ring-rose-300"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  (e.currentTarget as HTMLElement).click();
                                }
                              }}
                            >
                              <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-100">
                                    <Building2 className="size-4 text-rose-600" />
                                  </div>
                                  <h4 className="truncate text-[9px] font-black uppercase text-rose-800">
                                    {getBlockLabel?.('profile') ?? meta.title}
                                  </h4>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        type="button"
                                        className="text-text-muted rounded p-0.5 hover:bg-rose-100 hover:text-rose-600"
                                        aria-label={`Описание: ${meta.title}`}
                                      >
                                        <HelpCircle className="size-3.5" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      align="end"
                                      className="w-72 rounded-xl p-3 text-left"
                                    >
                                      <p className="text-text-secondary text-xs leading-relaxed">
                                        {meta.description}
                                      </p>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              <ul className="mb-2 min-h-0 flex-1 space-y-1.5 overflow-auto">
                                {alerts.profile.map(
                                  (p: { id: string; name: string; detail: string }) => (
                                    <li
                                      key={p.id}
                                      className="text-text-primary flex items-center justify-between gap-2 text-xs"
                                    >
                                      <span className="truncate" title={p.detail}>
                                        {p.name} — {p.detail}
                                      </span>
                                      <ResolveAlertLink
                                        id={p.id}
                                        detailHref={meta.detailHref}
                                        className="shrink-0 text-[8px] font-semibold text-rose-700 hover:underline"
                                        stopPropagation
                                        onDismiss={dismissProfile}
                                      />
                                    </li>
                                  )
                                )}
                              </ul>
                              <div className="mt-auto flex justify-start gap-2">
                                <Link
                                  href={meta.detailHref}
                                  className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-rose-700 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Детально <ArrowRight className="size-3" />
                                </Link>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="max-h-[80vh] w-[320px] overflow-y-auto rounded-xl p-4"
                          >
                            <h4 className="mb-2 text-xs font-black uppercase text-rose-800">
                              {meta.title}
                            </h4>
                            <p className="text-text-secondary mb-3 text-xs leading-relaxed">
                              {meta.description}
                            </p>
                            <ul className="mb-3 space-y-1.5">
                              {alerts.profile.map(
                                (p: { id: string; name: string; detail: string }) => (
                                  <li
                                    key={p.id}
                                    className="text-text-primary flex items-center justify-between gap-2 text-xs"
                                  >
                                    <span className="truncate" title={p.detail}>
                                      {p.name} — {p.detail}
                                    </span>
                                    <ResolveAlertLink
                                      id={p.id}
                                      detailHref={meta.detailHref}
                                      className="shrink-0 text-[8px] font-semibold text-rose-700 hover:underline"
                                      onDismiss={dismissProfile}
                                    />
                                  </li>
                                )
                              )}
                            </ul>
                            <div className="flex justify-start">
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="text-[9px] font-bold"
                              >
                                <Link
                                  href={meta.detailHref}
                                  className="inline-flex items-center gap-0.5"
                                >
                                  Детально <ArrowRight className="size-3" />
                                </Link>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    );
                  })()}
                {/* Системы в норме / сбои */}
                <div className="h-[200px] w-[240px] min-w-[240px] shrink-0">
                  {(() => {
                    const meta = ALERT_BLOCK_META.systems;
                    const ok = !alerts?.integrationIssues?.length;
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label={
                              ok
                                ? `${getBlockLabel?.('systems') ?? meta.title}. Системы в норме. Открыть подробности`
                                : `${getBlockLabel?.('systems') ?? meta.title}. Проблем: ${alerts.integrationIssues.length}. Открыть подробности`
                            }
                            className={cn(
                              'flex h-full cursor-pointer flex-col rounded-xl border p-3 outline-none transition-colors focus-visible:ring-2',
                              ok
                                ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50/80 focus-visible:ring-emerald-300'
                                : 'border-amber-200 bg-amber-50/50 hover:bg-amber-50/80 focus-visible:ring-amber-300'
                            )}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                (e.currentTarget as HTMLElement).click();
                              }
                            }}
                          >
                            <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <div
                                  className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                    ok ? 'bg-emerald-100' : 'bg-amber-100'
                                  )}
                                >
                                  <Zap
                                    className={cn(
                                      'size-4',
                                      ok ? 'text-emerald-600' : 'text-amber-600'
                                    )}
                                  />
                                </div>
                                <h4 className="text-text-primary truncate text-[9px] font-black uppercase">
                                  {getBlockLabel?.('systems') ?? meta.title}
                                </h4>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="text-text-muted hover:bg-bg-surface2 hover:text-text-secondary rounded p-0.5"
                                      aria-label={`Описание: ${meta.title}`}
                                    >
                                      <HelpCircle className="size-3.5" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    align="end"
                                    className="w-72 rounded-xl p-3 text-left"
                                  >
                                    <p className="text-text-secondary text-xs leading-relaxed">
                                      {meta.description}
                                    </p>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                            <div className="mb-2 min-h-0 flex-1">
                              {ok ? (
                                <p className="text-xs font-medium text-emerald-700">В норме</p>
                              ) : (
                                <ul className="text-text-primary space-y-1 text-xs">
                                  {alerts.integrationIssues.map(
                                    (issue: { id: string; message: string }) => (
                                      <li
                                        key={issue.id}
                                        className="flex items-start justify-between gap-2"
                                      >
                                        <span className="min-w-0 flex-1">{issue.message}</span>
                                        <ResolveAlertLink
                                          id={issue.id}
                                          detailHref={meta.detailHref}
                                          className="shrink-0 text-[8px] font-semibold text-amber-700 hover:underline"
                                          stopPropagation
                                          onDismiss={dismissIntegrationIssue}
                                        />
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                            </div>
                            <div className="mt-auto flex justify-start gap-2">
                              <Link
                                href={meta.detailHref}
                                className="text-accent-primary inline-flex items-center gap-0.5 text-[9px] font-semibold hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Детально <ArrowRight className="size-3" />
                              </Link>
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="max-h-[80vh] w-[320px] overflow-y-auto rounded-xl p-4"
                        >
                          <h4 className="text-text-primary mb-2 text-xs font-black uppercase">
                            {meta.title}
                          </h4>
                          <p className="text-text-secondary mb-3 text-xs leading-relaxed">
                            {meta.description}
                          </p>
                          {ok ? (
                            <p className="mb-3 text-xs font-medium text-emerald-700">В норме</p>
                          ) : (
                            <ul className="text-text-primary mb-3 space-y-1 text-xs">
                              {alerts.integrationIssues.map(
                                (issue: { id: string; message: string }) => (
                                  <li
                                    key={issue.id}
                                    className="flex items-start justify-between gap-2"
                                  >
                                    <span className="min-w-0 flex-1">{issue.message}</span>
                                    <ResolveAlertLink
                                      id={issue.id}
                                      detailHref={meta.detailHref}
                                      className="shrink-0 text-[8px] font-semibold text-amber-700 hover:underline"
                                      stopPropagation
                                      onDismiss={dismissIntegrationIssue}
                                    />
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                          <div className="flex justify-start">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="text-[9px] font-bold"
                            >
                              <Link
                                href={meta.detailHref}
                                className="inline-flex items-center gap-0.5"
                              >
                                Детально <ArrowRight className="size-3" />
                              </Link>
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })()}
                </div>
                {/* Задачи без исполнителя */}
                {alerts?.tasks?.length > 0 &&
                  (() => {
                    const meta = ALERT_BLOCK_META.tasks;
                    return (
                      <div className="h-[200px] w-[240px] min-w-[240px] shrink-0">
                        <Popover>
                          <PopoverTrigger asChild>
                            <div
                              role="button"
                              tabIndex={0}
                              aria-label={`${getBlockLabel?.('tasks') ?? meta.title}. Открыть подробности, задач: ${alerts.tasks.length}`}
                              className="border-accent-primary/25 bg-accent-primary/10 hover:bg-accent-primary/10 focus-visible:ring-accent-primary/40 flex h-full cursor-pointer flex-col rounded-xl border p-3 outline-none transition-colors focus-visible:ring-2"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  (e.currentTarget as HTMLElement).click();
                                }
                              }}
                            >
                              <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="bg-accent-primary/15 flex size-9 shrink-0 items-center justify-center rounded-lg">
                                    <CheckSquare className="text-accent-primary size-4" />
                                  </div>
                                  <h4 className="text-accent-primary truncate text-[9px] font-black uppercase">
                                    {getBlockLabel?.('tasks') ?? meta.title}
                                  </h4>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        type="button"
                                        className="text-text-muted hover:bg-accent-primary/15 hover:text-accent-primary rounded p-0.5"
                                        aria-label={`Описание: ${meta.title}`}
                                      >
                                        <HelpCircle className="size-3.5" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      align="end"
                                      className="w-72 rounded-xl p-3 text-left"
                                    >
                                      <p className="text-text-secondary text-xs leading-relaxed">
                                        {meta.description}
                                      </p>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              <ul className="mb-2 min-h-0 flex-1 space-y-1.5 overflow-auto">
                                {alerts.tasks.map(
                                  (t: { id: string; title: string; priority: string }) => (
                                    <li
                                      key={t.id}
                                      className="text-text-primary flex items-center justify-between gap-2 text-xs"
                                    >
                                      <span className="truncate" title={t.priority}>
                                        {t.title}
                                      </span>
                                      <ResolveAlertLink
                                        id={t.id}
                                        detailHref={meta.detailHref}
                                        className="text-accent-primary shrink-0 text-[8px] font-semibold hover:underline"
                                        stopPropagation
                                        onDismiss={dismissTask}
                                      />
                                    </li>
                                  )
                                )}
                              </ul>
                              <div className="mt-auto flex justify-start gap-2">
                                <Link
                                  href={meta.detailHref}
                                  className="text-accent-primary inline-flex items-center gap-0.5 text-[9px] font-semibold hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Детально <ArrowRight className="size-3" />
                                </Link>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="max-h-[80vh] w-[320px] overflow-y-auto rounded-xl p-4"
                          >
                            <h4 className="text-accent-primary mb-2 text-xs font-black uppercase">
                              {meta.title}
                            </h4>
                            <p className="text-text-secondary mb-3 text-xs leading-relaxed">
                              {meta.description}
                            </p>
                            <ul className="mb-3 space-y-1.5">
                              {alerts.tasks.map(
                                (t: { id: string; title: string; priority: string }) => (
                                  <li
                                    key={t.id}
                                    className="text-text-primary flex items-center justify-between gap-2 text-xs"
                                  >
                                    <span className="truncate" title={t.priority}>
                                      {t.title}
                                    </span>
                                    <ResolveAlertLink
                                      id={t.id}
                                      detailHref={meta.detailHref}
                                      className="text-accent-primary shrink-0 text-[8px] font-semibold hover:underline"
                                      onDismiss={dismissTask}
                                    />
                                  </li>
                                )
                              )}
                            </ul>
                            <div className="flex justify-start">
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="text-[9px] font-bold"
                              >
                                <Link
                                  href={meta.detailHref}
                                  className="inline-flex items-center gap-0.5"
                                >
                                  Детально <ArrowRight className="size-3" />
                                </Link>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    );
                  })()}
              </>
            )}
          </div>
        </div>
      </SectionBlock>
    </>
  );
}
