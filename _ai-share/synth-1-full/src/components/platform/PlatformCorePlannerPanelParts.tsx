'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Check, ChevronDown, ChevronRight, Play } from 'lucide-react';
import {
  PLANNER_KIND_LABELS,
  PLANNER_STATUS_LABELS,
  TECH_DEBT_CATEGORY_LABELS,
  type PlannerPriority,
  type PlatformCorePlannerItem,
  type PlatformCoreTechDebtItem,
} from '@/lib/platform-core-planner';
import { cn } from '@/lib/utils';
import { platformCoreHubLayout } from '@/lib/platform-core-hub-layout';
import {
  PLANNER_PRIORITY_BORDER,
  PLANNER_STATUS_DOT,
} from '@/lib/platform-core-planner-panel-layout';

export function PlannerStatChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="text-text-muted inline-flex items-baseline gap-1 text-[11px]">
      <span className="text-text-primary font-semibold tabular-nums">{value}</span>
      {label}
    </span>
  );
}

export function PlannerTaskRow({
  item,
  busy,
  apiOnline,
  onAgent,
  onDone,
}: {
  item: PlatformCorePlannerItem;
  busy?: boolean;
  apiOnline?: boolean;
  onAgent: (id: string) => void;
  onDone: (id: string) => void;
}) {
  const meta = [
    PLANNER_STATUS_LABELS[item.status],
    PLANNER_KIND_LABELS[item.kind],
    item.roleLabel,
    item.pillarTitle,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li
      data-testid={`planner-item-${item.id}`}
      className={cn(
        'border-border-subtle/80 group flex gap-3 border-b border-l-[3px] px-3 py-2.5 last:border-b-0 max-md:flex-col max-md:gap-2',
        PLANNER_PRIORITY_BORDER[item.priority],
        item.status === 'done' && 'opacity-45',
        item.status === 'in_progress' && 'bg-blue-50/40'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <span
            className={cn(
              'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
              PLANNER_STATUS_DOT[item.status]
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-text-primary text-[13px] font-medium leading-snug">{item.title}</p>
            <p className="text-text-muted mt-0.5 text-[10px]">{meta}</p>
            {item.note ? (
              <p className="text-text-secondary mt-1 text-[10px] leading-snug">{item.note}</p>
            ) : null}
          </div>
          <span className="text-text-muted shrink-0 text-[9px] font-bold uppercase tracking-wide">
            {item.priority}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-0.5 opacity-80 group-hover:opacity-100 max-md:w-full">
        {item.href ? (
          <Link
            href={item.href}
            className={cn(
              platformCoreHubLayout.plannerTaskActionBtn,
              'text-text-muted hover:text-accent-primary'
            )}
            title="Открыть в продукте"
          >
            ↗
          </Link>
        ) : null}
        {item.status !== 'done' ? (
          <>
            <button
              type="button"
              data-testid={`planner-start-${item.id}`}
              disabled={busy}
              title={apiOnline ? 'Запустить агента по задаче' : 'API офлайн — запустите dev:core'}
              className={cn(
                platformCoreHubLayout.plannerTaskActionBtn,
                'text-accent-primary hover:bg-accent-primary/10 inline-flex items-center gap-1 disabled:opacity-40'
              )}
              onClick={() => onAgent(item.id)}
            >
              <Play className="h-3.5 w-3.5" aria-hidden />
              <span className="max-md:sr-only">Доработать</span>
            </button>
            <button
              type="button"
              data-testid={`planner-done-${item.id}`}
              disabled={busy || !apiOnline}
              title="Отметить готово"
              className={cn(
                platformCoreHubLayout.plannerTaskActionBtn,
                'text-emerald-700 hover:bg-emerald-50 disabled:opacity-40'
              )}
              onClick={() => onDone(item.id)}
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Готово</span>
            </button>
          </>
        ) : null}
      </div>
    </li>
  );
}

export function PlannerDebtRow({
  item,
  busy,
  apiOnline,
  onAgent,
}: {
  item: PlatformCoreTechDebtItem & { status?: PlatformCorePlannerItem['status'] };
  busy?: boolean;
  apiOnline?: boolean;
  onAgent: (id: string) => void;
}) {
  return (
    <li
      data-testid={`tech-debt-${item.id}`}
      className={cn(
        'border-border-subtle/80 flex gap-3 border-b border-l-[3px] px-3 py-2.5 last:border-b-0 max-md:flex-col max-md:gap-2',
        PLANNER_PRIORITY_BORDER[item.priority]
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text-primary text-[13px] font-medium leading-snug">{item.title}</p>
        <p className="text-text-muted mt-0.5 text-[10px]">
          {TECH_DEBT_CATEGORY_LABELS[item.category]} · {item.action}
        </p>
        {item.hint ? <p className="text-text-secondary mt-1 text-[10px]">{item.hint}</p> : null}
      </div>
      {item.status !== 'done' ? (
        <button
          type="button"
          data-testid={`planner-start-${item.id}`}
          disabled={busy}
          title={apiOnline ? 'Запустить агента' : 'API офлайн — запустите dev:core'}
          className={cn(
            platformCoreHubLayout.plannerTaskActionBtn,
            'text-accent-primary hover:bg-accent-primary/10 inline-flex shrink-0 items-center gap-1 disabled:opacity-40 max-md:w-full max-md:justify-center'
          )}
          onClick={() => onAgent(item.id)}
        >
          <Play className="h-3.5 w-3.5" aria-hidden />
          Доработать
        </button>
      ) : null}
    </li>
  );
}

export function PlannerPriorityGroup({
  priority,
  items,
  defaultOpen,
  children,
}: {
  priority: PlannerPriority;
  items: { priority: PlannerPriority }[];
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? priority === 'P0');
  if (items.length === 0) return null;

  return (
    <div className="border-border-subtle overflow-hidden rounded-lg border bg-white">
      <button
        type="button"
        className="hover:bg-bg-surface2 flex w-full items-center gap-2 px-3 py-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <ChevronDown className="text-text-muted h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="text-text-muted h-3.5 w-3.5 shrink-0" />
        )}
        <span className="text-text-primary text-[11px] font-bold uppercase tracking-wide">
          {priority}
        </span>
        <span className="text-text-muted text-[10px]">{items.length}</span>
      </button>
      {open ? <ul>{children}</ul> : null}
    </div>
  );
}
