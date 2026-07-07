'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Lock,
  LockOpen,
  MessageSquare,
  Pencil,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SectionBlock } from '@/components/brand/SectionBlock';
import type { HistoryEntry } from '@/components/brand/SectionBlock';
import { registryFeedLayout } from '@/lib/ui/registry-feed-layout';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { SECTION_META } from '../organization-section-meta';
import { ACTIVITY_PARTICIPANTS, type RecentActivity } from '../organization-recent-activity';
import type { HealthMetric } from '@/lib/brand/organization-types';
import type { useToast } from '@/hooks/use-toast';

type OrganizationToastFn = ReturnType<typeof useToast>['toast'];

export type OrganizationHealthActivityGridProps = {
  globalHistory: HistoryEntry[];
  healthError: Error | null;
  healthLoading: boolean;
  lastCheck: string;
  overallHealth: number;
  healthMetrics: HealthMetric[];
  refetchHealth: () => void;
  openHealthDetailFor: number | null;
  setOpenHealthDetailFor: (n: number | null) => void;
  activityParticipant: string;
  setActivityParticipant: (p: string) => void;
  filteredActivities: RecentActivity[];
  isBlocked: (a: RecentActivity) => boolean;
  activityKey: (a: RecentActivity) => string;
  getCorrectionHref: (act: RecentActivity) => string;
  setBlockedActivities: React.Dispatch<React.SetStateAction<RecentActivity[]>>;
  openCommentFor: number | null;
  setOpenCommentFor: (n: number | null) => void;
  commentText: string;
  setCommentText: (s: string) => void;
  openBlockFor: number | null;
  setOpenBlockFor: (n: number | null) => void;
  toast: OrganizationToastFn;
};

export function OrganizationHealthActivityGrid({
  globalHistory,
  healthError,
  healthLoading,
  lastCheck,
  overallHealth,
  healthMetrics,
  refetchHealth,
  openHealthDetailFor,
  setOpenHealthDetailFor,
  activityParticipant,
  setActivityParticipant,
  filteredActivities,
  isBlocked,
  activityKey,
  getCorrectionHref,
  setBlockedActivities,
  openCommentFor,
  setOpenCommentFor,
  commentText,
  setCommentText,
  openBlockFor,
  setOpenBlockFor,
  toast,
}: OrganizationHealthActivityGridProps) {
  return (
    <>
      {/* Индекс здоровья + Недавняя активность */}
      <div className="mb-2 grid min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <SectionBlock
          title="Индекс здоровья"
          meta={SECTION_META.health}
          accentColor="indigo"
          className="flex min-w-0 flex-col overflow-hidden"
          history={globalHistory}
        >
          <div
            className={cn(
              registryFeedLayout.panelCardSoft,
              'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 md:p-5'
            )}
          >
            {healthError ? (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-6 text-center">
                <p className="text-text-secondary text-xs font-bold">Не удалось загрузить данные</p>
                <p className="text-text-secondary text-[9px]">{healthError.message}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[9px] font-bold uppercase"
                  onClick={() => refetchHealth()}
                  aria-label="Повторить загрузку данных"
                >
                  Повторить
                </Button>
              </div>
            ) : healthLoading ? (
              <div className="flex animate-pulse flex-col gap-4">
                <div className="bg-bg-surface2 absolute right-4 top-4 size-12 rounded-full" />
                <div className="mt-8 flex flex-col gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-bg-surface2 h-14 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-text-muted text-xs font-bold uppercase">
                    Проверка {lastCheck}
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-muted hover:text-accent-primary size-8 rounded-lg"
                      onClick={() => refetchHealth()}
                      aria-label="Обновить индекс здоровья"
                      title="Обновить"
                      disabled={healthLoading}
                    >
                      <RefreshCw className={cn('size-4', healthLoading ? 'animate-spin' : '')} />
                    </Button>
                    <div className="relative flex size-12 items-center justify-center">
                      <svg className="absolute inset-0 size-12 -rotate-90" viewBox="0 0 48 48">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          strokeWidth="4"
                          className="stroke-border-subtle"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          strokeWidth="4"
                          className="stroke-accent-primary"
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={2 * Math.PI * 20 * (1 - (overallHealth ?? 0) / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-accent-primary relative text-lg font-black">
                        {overallHealth}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-y-3">
                  {healthMetrics?.map((m: HealthMetric, i: number) => {
                    const healthIcons: Record<
                      string,
                      React.ComponentType<{ className?: string }>
                    > = {
                      'Полнота профиля': Building2,
                      Безопасность: ShieldCheck,
                      'Активность команды': Users,
                      Интеграции: Zap,
                      'ЭДО и маркировка': ShieldCheck,
                      Подписка: CreditCard,
                      Документы: FileText,
                      Настройки: Settings,
                    };
                    const Icon = healthIcons[m?.label ?? ''] ?? LayoutDashboard;
                    const details = m?.details;
                    const checklist = details?.checklist ?? [];
                    const missing = details?.missing ?? [];
                    const tips = details?.tips;
                    return (
                      <Popover
                        key={i}
                        open={openHealthDetailFor === i}
                        onOpenChange={(open) => setOpenHealthDetailFor(open ? i : null)}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenHealthDetailFor(openHealthDetailFor === i ? null : i)
                            }
                            className="hover:bg-bg-surface2/80 flex w-full min-w-0 items-start gap-2 rounded-lg p-2 text-left transition-colors"
                          >
                            <div
                              className={cn(
                                'flex size-9 shrink-0 items-center justify-center rounded-lg text-white',
                                m?.color ?? 'bg-accent-primary'
                              )}
                            >
                              <Icon className="size-4" />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-text-primary hover:text-accent-primary truncate text-xs font-bold">
                                  {m?.label ?? ''}
                                </span>
                                <span
                                  className={cn(
                                    'shrink-0 text-xs font-black tabular-nums',
                                    m?.status === 'ok'
                                      ? 'text-emerald-600'
                                      : m?.status === 'warning'
                                        ? 'text-amber-600'
                                        : 'text-rose-600'
                                  )}
                                >
                                  {m?.score != null ? `${m.score}%` : '—'}
                                </span>
                              </div>
                              <Progress
                                value={m?.score ?? 0}
                                className="bg-bg-surface2 h-1.5"
                                indicatorClassName={m?.color ?? 'bg-accent-primary'}
                              />
                              {m?.status !== 'ok' && m?.details?.tips && (
                                <p
                                  className="text-text-secondary line-clamp-1 text-[8px]"
                                  title={m.details.tips}
                                >
                                  {m.details.tips}
                                </p>
                              )}
                            </div>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="bottom"
                          align="start"
                          sideOffset={8}
                          className="z-[200] w-80 rounded-xl p-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'flex size-9 shrink-0 items-center justify-center rounded-lg text-white',
                                  m?.color ?? 'bg-accent-primary'
                                )}
                              >
                                <Icon className="size-4" />
                              </div>
                              <div>
                                <h4 className="text-text-primary text-sm font-bold">
                                  {m?.label ?? ''}
                                </h4>
                                <p className="text-text-secondary text-[9px]">
                                  {m?.score != null ? `${m.score}%` : '—'} • Проверка{' '}
                                  {details?.lastCheck ?? ''}
                                </p>
                              </div>
                            </div>
                            {m?.desc && <p className="text-text-secondary text-xs">{m.desc}</p>}
                            {(checklist.length > 0 || missing.length > 0) && (
                              <div className="space-y-2">
                                {checklist.length > 0 && (
                                  <div>
                                    <p className="text-text-muted mb-1 text-[9px] font-bold uppercase">
                                      Заполнено
                                    </p>
                                    <ul className="space-y-0.5">
                                      {checklist.map((item: string, j: number) => (
                                        <li
                                          key={j}
                                          className="text-text-secondary flex items-center gap-1.5 text-xs"
                                        >
                                          <span className="text-emerald-500">✓</span> {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {missing.length > 0 && (
                                  <div>
                                    <p className="text-text-muted mb-1 text-[9px] font-bold uppercase">
                                      Ещё не заполнено
                                    </p>
                                    <ul className="space-y-0.5">
                                      {missing.map((item: string, j: number) => (
                                        <li
                                          key={j}
                                          className="text-text-secondary flex items-center gap-1.5 text-xs"
                                        >
                                          <span className="text-amber-500">○</span> {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                            {tips && (
                              <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-[9px] text-amber-600">
                                {tips}
                              </p>
                            )}
                            <Link
                              href={m?.href ?? '#'}
                              className="text-accent-primary hover:text-accent-primary inline-flex items-center gap-1 text-xs font-semibold"
                              onClick={() => setOpenHealthDetailFor(null)}
                            >
                              Открыть раздел
                              <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </SectionBlock>

        <SectionBlock
          title="Недавняя активность"
          meta={SECTION_META.activity}
          accentColor="slate"
          className="flex min-w-0 flex-col overflow-hidden"
          history={globalHistory}
        >
          <div
            className={cn(
              registryFeedLayout.panelCardSoft,
              'flex min-h-[320px] min-w-0 flex-1 flex-col p-4 md:p-5'
            )}
          >
            {/* Высота подобрана так, чтобы после отступа (mt-4) первая строка активности была на уровне «Полнота профиля» */}
            <div className="flex min-h-[3.25rem] shrink-0 flex-col justify-end">
              {/* Период задаётся только в Organization Hub выше (S3 — один контрол) */}
              <div
                role="radiogroup"
                aria-label="Фильтр списка активности по участнику"
                className="border-border-default bg-bg-surface2 mb-0 flex w-fit items-center gap-1 rounded-md border p-0.5"
              >
                {ACTIVITY_PARTICIPANTS.map((p) => {
                  const Icon = p.Icon ?? Users;
                  const participantStyle: Record<string, { bg: string; text: string }> = {
                    all: { bg: 'bg-bg-surface2', text: 'text-text-secondary' },
                    anna: { bg: 'bg-accent-primary/15', text: 'text-accent-primary' },
                    igor: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
                    maria: { bg: 'bg-amber-100', text: 'text-amber-600' },
                    petr: { bg: 'bg-rose-100', text: 'text-rose-600' },
                    system: { bg: 'bg-blue-100', text: 'text-blue-600' },
                  };
                  const style = participantStyle[p.id] ?? participantStyle.all;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={activityParticipant === p.id}
                      onClick={() => setActivityParticipant(p.id)}
                      aria-label={`Участник: ${p.label}`}
                      className={cn(
                        'flex size-7 items-center justify-center rounded-md transition-all',
                        activityParticipant === p.id
                          ? cn('ring-border-default bg-white shadow-sm ring-1', style.text)
                          : cn(style.bg, style.text, 'hover:opacity-90')
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden />
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Свободное место между иконками-фильтрами и первым действием; первая строка на уровне «Полнота профиля» */}
            <div className="mt-4 h-[378px] shrink-0 space-y-1.5 overflow-y-auto overflow-x-hidden pr-1">
              {filteredActivities?.length ? (
                filteredActivities.map((act, i) => {
                  const participant = ACTIVITY_PARTICIPANTS.find((p) => p.id === act.participantId);
                  const ActIcon = participant?.Icon ?? act.icon;
                  const participantStyle: Record<string, { bg: string; text: string }> = {
                    all: { bg: 'bg-bg-surface2', text: 'text-text-secondary' },
                    anna: { bg: 'bg-accent-primary/15', text: 'text-accent-primary' },
                    igor: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
                    maria: { bg: 'bg-amber-100', text: 'text-amber-600' },
                    petr: { bg: 'bg-rose-100', text: 'text-rose-600' },
                    system: { bg: 'bg-blue-100', text: 'text-blue-600' },
                  };
                  const style = participantStyle[act.participantId] ?? participantStyle.all;
                  const blocked = isBlocked(act);
                  return (
                    <div
                      key={`${act.user}-${act.dateStr}-${i}`}
                      className={cn(
                        'text-text-secondary flex shrink-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-[9px] transition-colors',
                        blocked
                          ? 'border-rose-100 bg-rose-50/30'
                          : 'border-border-subtle hover:bg-bg-surface2/80'
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg',
                          style.bg,
                          style.text
                        )}
                      >
                        <ActIcon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-text-primary block truncate font-semibold">
                          {act.user}
                        </span>
                        <span className="block truncate">{act.action}</span>
                      </div>
                      <span className="text-text-muted shrink-0 text-[8px] font-bold uppercase">
                        {act.time}
                      </span>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-0.5">
                        {blocked ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setBlockedActivities((prev) =>
                                  prev.filter((b) => activityKey(b) !== activityKey(act))
                                )
                              }
                              className="border-border-default text-text-secondary hover:bg-bg-surface2 inline-flex items-center gap-1 rounded border px-2 py-1 text-[9px] font-semibold"
                              aria-label="Разблокировать"
                            >
                              <LockOpen className="size-3" />
                              Разблокировать
                            </button>
                            <Link
                              href={`${getCorrectionHref(act)}?returnResolved=${encodeURIComponent(activityKey(act))}`}
                              className="border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10 inline-flex items-center gap-1 rounded border px-2 py-1 text-[9px] font-semibold"
                            >
                              <Pencil className="size-3" />
                              Изменить
                            </Link>
                          </>
                        ) : (
                          <>
                            <Popover
                              open={openCommentFor === i}
                              onOpenChange={(open) => !open && setOpenCommentFor(null)}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setOpenCommentFor(openCommentFor === i ? null : i);
                                  }}
                                  className="text-text-muted hover:bg-accent-primary/10 hover:text-accent-primary rounded p-1.5"
                                  aria-label="Написать комментарий"
                                >
                                  <MessageSquare className="size-3.5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="end"
                                className="z-[200] w-64 rounded-xl p-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="text-text-primary mb-2 text-xs font-bold">
                                  Комментарий
                                </p>
                                <textarea
                                  value={openCommentFor === i ? commentText : ''}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  placeholder="Введите комментарий..."
                                  className="border-border-default min-h-[60px] w-full resize-none rounded-lg border px-2 py-1.5 text-xs"
                                  rows={3}
                                />
                                <Button
                                  size="sm"
                                  className="mt-2 h-7 text-[9px]"
                                  onClick={() => setOpenCommentFor(null)}
                                >
                                  Отправить
                                </Button>
                              </PopoverContent>
                            </Popover>
                            <Popover
                              open={openBlockFor === i}
                              onOpenChange={(open) => !open && setOpenBlockFor(null)}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setOpenBlockFor(openBlockFor === i ? null : i);
                                  }}
                                  className="text-text-muted rounded p-1.5 hover:bg-rose-50 hover:text-rose-600"
                                  aria-label="Заблокировать действие"
                                >
                                  <Lock className="size-3.5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="end"
                                className="z-[200] w-56 rounded-xl p-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="text-text-primary mb-2 text-xs font-bold">
                                  Заблокировать действие?
                                </p>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 text-[9px]"
                                  onClick={() => {
                                    setBlockedActivities((prev) => [...prev, act]);
                                    setOpenBlockFor(null);
                                    toast?.({
                                      title: 'Действие заблокировано',
                                      description:
                                        'Вы можете разблокировать его или перейти в раздел и внести изменения.',
                                    });
                                  }}
                                >
                                  Заблокировать
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-text-muted py-4 text-[9px]">
                  Нет активности за выбранный период
                </p>
              )}
            </div>
            <div className="border-border-default mt-auto flex shrink-0 justify-center border-t pt-3">
              <Button
                asChild
                variant="cta"
                size="ctaSm"
                className="button-glimmer button-professional w-1/2"
              >
                <Link
                  href={ROUTES.brand.team}
                  className="inline-flex items-center justify-center gap-1.5"
                >
                  Все действия
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </SectionBlock>
      </div>
    </>
  );
}
