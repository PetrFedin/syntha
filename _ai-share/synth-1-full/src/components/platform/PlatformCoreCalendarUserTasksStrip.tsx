'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { brandMessagesB2bOrderContextHref, shopMessagesB2bOrderContextHref } from '@/lib/platform-core-routes';
import { factoryMessagesB2bOrderContextHref, factorySupplierMessagesB2bOrderContextHref } from '@/lib/platform-core-extended-routes';
import { platformCoreCalendarPcTaskHref } from '@/lib/platform-core-ports/platform/platform-core-comms-pctask-deeplinks';

type CalendarUserTaskRow = {
  id: string;
  title: string;
  startAt: string;
  orderId?: string | null;
  targetChatId?: string | null;
};

type Props = {
  collectionId: string;
  orderId?: string;
  ownerRole: 'brand' | 'shop' | 'manufacturer' | 'supplier';
  testIdPrefix: string;
  reloadNonce?: number;
  focusTaskId?: string;
  onTaskCreated?: () => void;
};

function orderChatHref(role: Props['ownerRole'], orderId: string): string {
  if (role === 'shop') return shopMessagesB2bOrderContextHref(orderId);
  if (role === 'brand') return brandMessagesB2bOrderContextHref(orderId);
  if (role === 'supplier') return factorySupplierMessagesB2bOrderContextHref(orderId);
  return factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });
}

function calendarTaskHref(
  role: Props['ownerRole'],
  collectionId: string,
  orderId: string | null | undefined,
  taskId: string
): string {
  return platformCoreCalendarPcTaskHref({ role, collectionId, orderId, taskId });
}

/** PG user-task list + deep links to order calendar / chat. */
export function PlatformCoreCalendarUserTasksStrip({
  collectionId,
  orderId,
  ownerRole,
  testIdPrefix,
  reloadNonce = 0,
  focusTaskId,
  onTaskCreated,
}: Props) {
  const [tasks, setTasks] = useState<CalendarUserTaskRow[]>([]);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [listReloadNonce, setListReloadNonce] = useState(0);

  const loadTasks = useCallback(() => {
    const qs = new URLSearchParams({ collectionId, limit: '5' });
    if (orderId) qs.set('orderId', orderId);
    setLoading(true);
    return fetch(`/api/workshop2/platform-core/calendar-events/user-task?${qs.toString()}`, {
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((json: { ok?: boolean; tasks?: CalendarUserTaskRow[]; storageMode?: string }) => {
        if (json.ok !== true) {
          setTasks([]);
          return;
        }
        setTasks(Array.isArray(json.tasks) ? json.tasks : []);
        setStorageMode(json.storageMode ?? null);
      })
      .catch(() => {
        setTasks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [collectionId, orderId]);

  useEffect(() => {
    let cancelled = false;
    void loadTasks().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [loadTasks, reloadNonce, listReloadNonce]);

  useEffect(() => {
    if (!focusTaskId?.trim()) return;
    const el = document.querySelector(
      `[data-testid="${testIdPrefix}-task-${CSS.escape(focusTaskId.trim())}"]`
    );
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusTaskId, tasks, testIdPrefix]);

  const handleQuickCreate = async () => {
    if (creating) return;
    setCreating(true);
    setCreateMessage(null);
    try {
      const res = await fetch('/api/workshop2/platform-core/calendar-events/user-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId,
          ownerRole,
          orderId: orderId?.trim() || undefined,
          title: orderId?.trim() ? `Дозвон · ${orderId.trim()}` : 'Задача платформы',
          description: 'Быстрая задача из полосы календаря',
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        messageRu?: string;
        event?: { id?: string };
      };
      if (!res.ok || !json.ok) {
        setCreateMessage(json.messageRu ?? 'Не удалось создать задачу.');
        return;
      }
      setCreateMessage(json.messageRu ?? 'Задача создана.');
      setListReloadNonce((n) => n + 1);
      onTaskCreated?.();
    } catch {
      setCreateMessage('Ошибка сети при создании задачи.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <p className="text-text-muted text-[10px]" data-testid={`${testIdPrefix}-loading`}>
        Задачи PG…
      </p>
    );
  }

  return (
    <div
      className="border-border-subtle bg-bg-surface2/50 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid={`${testIdPrefix}-strip`}
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        Задачи заказа
      </Badge>
      {storageMode ? (
        <Badge variant="secondary" className="text-[9px]">
          {storageMode === 'pg' ? 'PG' : storageMode}
        </Badge>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 text-[10px]"
        data-testid={`${testIdPrefix}-refresh`}
        onClick={() => void loadTasks()}
      >
        Обновить
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-[10px]"
        disabled={creating}
        data-testid={`${testIdPrefix}-quick-create`}
        onClick={() => void handleQuickCreate()}
      >
        {creating ? 'Создание…' : '+ Быстрая задача'}
      </Button>
      {createMessage ? (
        <span
          className="text-text-muted text-[10px]"
          data-testid={`${testIdPrefix}-create-message`}
        >
          {createMessage}
        </span>
      ) : null}
      {tasks.length === 0 ? (
        <span className="text-text-muted">Нет сохранённых задач — создайте слот в календаре.</span>
      ) : (
        tasks.map((task) => {
          const focused = focusTaskId?.trim() === task.id;
          return (
            <span key={task.id} className="inline-flex flex-wrap items-center gap-1">
              <Button
                size="sm"
                variant={focused ? 'default' : 'outline'}
                className={
                  focused ? 'ring-accent-primary/40 h-7 text-[10px] ring-2' : 'h-7 text-[10px]'
                }
                asChild
              >
                <Link
                  href={calendarTaskHref(ownerRole, collectionId, task.orderId, task.id)}
                  data-testid={`${testIdPrefix}-task-${task.id}`}
                  data-pc-task-focused={focused ? '1' : undefined}
                >
                  {task.title}
                </Link>
              </Button>
              {task.orderId ? (
                <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
                  <Link
                    href={orderChatHref(ownerRole, task.orderId)}
                    data-testid={`${testIdPrefix}-chat-${task.id}`}
                  >
                    Чат
                  </Link>
                </Button>
              ) : null}
            </span>
          );
        })
      )}
    </div>
  );
}
