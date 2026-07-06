'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import type { BrandTaskRecord, BrandTaskStatus } from '@/lib/platform-core-ports/legacy/production-data';
import { generateTaskId } from '@/lib/platform-core-ports/legacy/production-data';
import {
  loadBrandTasksWithMode,
  persistBrandTasks,
} from '@/lib/platform-core-ports/legacy/production-data/brand-tasks-client';
import {
  brandDevTasksKanbanAllTasksHref,
  brandDevTasksKanbanCalendarHref,
  BRAND_DEV_TASKS_KANBAN_ADD_BTN_RU,
  BRAND_DEV_TASKS_KANBAN_ALL_TASKS_LINK_RU,
  BRAND_DEV_TASKS_KANBAN_CALENDAR_LINK_RU,
  BRAND_DEV_TASKS_KANBAN_LOADING_RU,
  BRAND_DEV_TASKS_KANBAN_PG_BADGE_RU,
  BRAND_DEV_TASKS_KANBAN_PG_UNAVAILABLE_RU,
  BRAND_DEV_TASKS_KANBAN_SAVING_RU,
  BRAND_DEV_TASKS_KANBAN_TITLE_RU,
} from '@/lib/platform-core-ports/platform/brand-dev-tasks-kanban-calendar';
import { cn } from '@/lib/utils';

const COLUMN_META: { id: BrandTaskStatus; titleRu: string }[] = [
  { id: 'todo', titleRu: 'К выполнению' },
  { id: 'in_progress', titleRu: 'В работе' },
  { id: 'done', titleRu: 'Готово' },
];

type Props = {
  collectionId?: string;
  /** compact = dev cabinet strip; full = calendar comms workspace */
  variant?: 'compact' | 'full';
};

/** Wave XF: mini Kanban · GET/POST `/api/brand/tasks` + calendar peer (fail-closed PG in core). */
export function BrandDevTasksKanbanMiniPanel({ collectionId, variant = 'full' }: Props) {
  const [tasks, setTasks] = useState<BrandTaskRecord[]>([]);
  const [pgUnavailable, setPgUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const { tasks: loaded, pgUnavailable: pgDown } = await loadBrandTasksWithMode();
    setTasks(loaded);
    setPgUnavailable(pgDown);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filteredTasks = useMemo(() => {
    if (!collectionId?.trim()) return tasks;
    const cid = collectionId.trim();
    return tasks.filter((t) => !t.collectionId || t.collectionId === cid);
  }, [tasks, collectionId]);

  const columns = useMemo(
    () =>
      COLUMN_META.map((col) => ({
        ...col,
        tasks: filteredTasks.filter((t) => t.status === col.id).slice(0, variant === 'compact' ? 2 : 4),
      })),
    [filteredTasks, variant]
  );

  const persist = useCallback(async (next: BrandTaskRecord[]) => {
    setTasks(next);
    setSaving(true);
    try {
      await persistBrandTasks(next);
    } finally {
      setSaving(false);
    }
  }, []);

  const moveTask = useCallback(
    (taskId: string, status: BrandTaskStatus) => {
      void persist(
        tasks.map((t) =>
          t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t
        )
      );
    },
    [persist, tasks]
  );

  const addQuickTask = useCallback(() => {
    const now = new Date().toISOString();
    const row: BrandTaskRecord = {
      id: generateTaskId(),
      title: collectionId ? `Задача · ${collectionId}` : 'Новая задача разработки',
      status: 'todo',
      assignee: 'Команда',
      due: '—',
      project: 'Разработка',
      collectionId: collectionId?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    void persist([row, ...tasks]);
  }, [collectionId, persist, tasks]);

  return (
    <div
      className={cn(
        'border-border-subtle rounded-lg border bg-bg-surface2/40',
        variant === 'compact' ? 'px-2 py-1.5' : 'px-3 py-2'
      )}
      data-testid="brand-dev-tasks-kanban-panel"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p
          className="text-text-muted text-[10px] font-bold uppercase tracking-wide"
          data-testid="brand-dev-tasks-kanban-title"
        >
          {BRAND_DEV_TASKS_KANBAN_TITLE_RU}
        </p>
        <div className="flex flex-wrap items-center gap-1">
          {pgUnavailable ? (
            <Badge variant="destructive" className="text-[9px]" data-testid="brand-dev-tasks-kanban-pg-unavailable">
              {BRAND_DEV_TASKS_KANBAN_PG_UNAVAILABLE_RU}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px]" data-testid="brand-dev-tasks-kanban-pg">
              {BRAND_DEV_TASKS_KANBAN_PG_BADGE_RU}
            </Badge>
          )}
          {saving ? (
            <span className="text-text-muted text-[9px]" data-testid="brand-dev-tasks-kanban-saving">
              {BRAND_DEV_TASKS_KANBAN_SAVING_RU}
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[9px]"
            data-testid="brand-dev-tasks-kanban-add-btn"
            onClick={addQuickTask}
            disabled={pgUnavailable}
          >
            {BRAND_DEV_TASKS_KANBAN_ADD_BTN_RU}
          </Button>
          {collectionId?.trim() ? (
            <Link
              href={brandDevTasksKanbanCalendarHref(collectionId)}
              className={hubGadget.goldenLink}
              data-testid="brand-dev-tasks-kanban-calendar-link"
            >
              {BRAND_DEV_TASKS_KANBAN_CALENDAR_LINK_RU}
            </Link>
          ) : null}
          <Link
            href={brandDevTasksKanbanAllTasksHref()}
            className={hubGadget.goldenLink}
            data-testid="brand-dev-tasks-kanban-full-link"
          >
            {BRAND_DEV_TASKS_KANBAN_ALL_TASKS_LINK_RU}
          </Link>
        </div>
      </div>
      {loading ? (
        <p className="text-text-muted text-[10px]" data-testid="brand-dev-tasks-kanban-loading">
          {BRAND_DEV_TASKS_KANBAN_LOADING_RU}
        </p>
      ) : (
        <div
          className={cn(
            'grid gap-2',
            variant === 'compact' ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'
          )}
          data-testid="brand-dev-tasks-kanban-board"
        >
          {columns.map((col) => (
            <div
              key={col.id}
              className="border-border-subtle min-w-0 rounded-md border bg-white/70 p-1.5"
              data-testid={`brand-dev-tasks-kanban-column-${col.id}`}
            >
              <p className="text-text-muted mb-1 text-[9px] font-semibold uppercase">{col.titleRu}</p>
              {col.tasks.length === 0 ? (
                <p className="text-text-muted py-2 text-[9px]">—</p>
              ) : (
                col.tasks.map((t) => (
                  <div
                    key={t.id}
                    className="border-border-subtle mb-1 rounded border px-1.5 py-1 text-[10px]"
                    data-testid={`brand-dev-tasks-kanban-card-${t.id}`}
                  >
                    <p className="truncate font-medium">{t.title}</p>
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {COLUMN_META.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          className={cn(
                            'rounded px-1 py-0.5 text-[8px] uppercase',
                            t.status === st.id
                              ? 'bg-accent-primary text-white'
                              : 'bg-bg-surface2 text-text-muted hover:bg-bg-surface'
                          )}
                          data-testid={`brand-dev-tasks-kanban-move-${t.id}-${st.id}`}
                          onClick={() => moveTask(t.id, st.id)}
                          disabled={pgUnavailable}
                        >
                          {st.id === 'todo' ? 'к выполнению' : st.id === 'in_progress' ? 'в работе' : 'готово'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
