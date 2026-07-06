'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, RefreshCw, Search, Sparkles } from 'lucide-react';
import {
  EMPTY_PLATFORM_CORE_PLANNER_SNAPSHOT,
  type PlannerPriority,
  type PlatformCorePlannerItem,
  type PlatformCorePlannerSnapshot,
} from '@/lib/platform-core-planner';
import { cn } from '@/lib/utils';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { platformCoreHubLayout } from '@/lib/platform-core-hub-layout';
import { PlatformCoreAgentChat } from '@/components/platform/PlatformCoreAgentChat';
import { PlatformAiTaskStrip } from '@/components/platform/PlatformAiTaskStrip';
import {
  PlannerDebtRow,
  PlannerPriorityGroup,
  PlannerStatChip,
  PlannerTaskRow,
} from '@/components/platform/PlatformCorePlannerPanelParts';
import {
  PLANNER_PANEL_PRIORITIES,
  sortPlannerItemsByPriorityThenStatus,
} from '@/lib/platform-core-planner-panel-layout';

type Props = {
  collectionId?: string;
};

type PlannerTab = 'development' | 'tech-debt';

export function PlatformCorePlannerPanel({ collectionId = 'SS27' }: Props) {
  const [tab, setTab] = useState<PlannerTab>('development');
  const [priority, setPriority] = useState<PlannerPriority | 'all'>('all');
  const [hideDone, setHideDone] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [chatTaskTitle, setChatTaskTitle] = useState<string | undefined>();
  const [agentSessionStatus, setAgentSessionStatus] = useState<string | null>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const chatSessionIdRef = useRef<string | null>(null);
  const savedListScrollTop = useRef(0);
  const savedWindowScrollY = useRef(0);
  const [snapshot, setSnapshot] = useState<PlatformCorePlannerSnapshot>(
    EMPTY_PLATFORM_CORE_PLANNER_SNAPSHOT
  );
  const [plannerMeta, setPlannerMeta] = useState<{
    closedWaveGeneration?: number;
    p0Active?: number;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatSessionIdRef.current = chatSessionId;
  }, [chatSessionId]);

  const plannerFetchHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    'x-syntha-planner-client':
      typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent)
        ? 'mobile'
        : 'web',
  });

  const patchTaskStatusLocal = useCallback(
    (taskId: string, status: PlatformCorePlannerItem['status']) => {
      setSnapshot((prev) => {
        const mapItem = (item: PlatformCorePlannerItem) =>
          item.id === taskId ? { ...item, status } : item;
        return {
          ...prev,
          development: prev.development.map(mapItem),
          techDebt: prev.techDebt.map((item) =>
            item.id === taskId ? { ...item, status } : item
          ),
          queue: prev.queue.map(mapItem),
          counts: {
            ...prev.counts,
            open: prev.queue.filter((i) =>
              i.id === taskId ? status === 'open' : i.status === 'open'
            ).length,
            inProgress: prev.queue.filter((i) =>
              i.id === taskId ? status === 'in_progress' : i.status === 'in_progress'
            ).length,
            done: prev.queue.filter((i) =>
              i.id === taskId ? status === 'done' : i.status === 'done'
            ).length,
          },
        };
      });
    },
    []
  );

  const refresh = useCallback(async (opts?: { skipScrollRestore?: boolean }) => {
    const restoreScroll = !opts?.skipScrollRestore && !chatSessionIdRef.current;
    if (restoreScroll) {
      savedWindowScrollY.current = window.scrollY;
      if (listScrollRef.current) {
        savedListScrollTop.current = listScrollRef.current.scrollTop;
      }
    }
    setLoading(true);
    try {
      const r = await fetch(
        `/api/dev/platform-core/planner?collection=${encodeURIComponent(collectionId)}`,
        { cache: 'no-store', headers: plannerFetchHeaders() }
      );
      if (!r.ok) throw new Error('offline');
      const j = (await r.json()) as PlatformCorePlannerSnapshot & {
        ok: boolean;
        plannerMeta?: { closedWaveGeneration?: number; p0Active?: number };
      };
      setSnapshot(j);
      setPlannerMeta(j.plannerMeta ?? { p0Active: j.counts?.p0 });
      setApiOnline(true);
    } catch {
      setApiOnline(false);
      setSnapshot(EMPTY_PLATFORM_CORE_PLANNER_SNAPSHOT);
      setPlannerMeta({});
    } finally {
      setLoading(false);
      if (restoreScroll) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedWindowScrollY.current, behavior: 'auto' });
          if (listScrollRef.current) {
            listScrollRef.current.scrollTop = savedListScrollTop.current;
          }
        });
      }
    }
  }, [collectionId]);

  const runAgents = useCallback(
    async (taskId?: string) => {
      setBusy(true);
      setActionMsg(null);
      try {
        const r = await fetch('/api/dev/platform-core/planner/run-agents', {
          method: 'POST',
          headers: plannerFetchHeaders(),
          body: JSON.stringify({ collection: collectionId, id: taskId, by: 'ui-agent' }),
        });
        const j = (await r.json()) as {
          ok: boolean;
          message?: string;
          reason?: string;
          sessionId?: string;
          openChat?: boolean;
          task?: { title: string };
          spawn?: { error?: string | null };
        };
        if (!r.ok || !j.ok) {
          setActionMsg(
            j.reason === 'no_open_tasks'
              ? 'Нет открытых задач'
              : r.status === 404
                ? 'Запустите dev:core (npm run dev:core или SYNTHA → Подготовка)'
                : 'Не удалось запустить'
          );
          return;
        }
        if (j.sessionId && j.openChat) {
          setChatSessionId(j.sessionId);
          setChatTaskTitle(j.task?.title);
          setAgentSessionStatus('starting');
        }
        setActionMsg(j.spawn?.error ? j.message ?? 'Ошибка агента' : (j.message ?? 'Агент в работе'));
        await refresh({ skipScrollRestore: true });
      } catch {
        setActionMsg('API недоступен — запустите dev:core на :3001');
      } finally {
        setBusy(false);
      }
    },
    [collectionId, patchTaskStatusLocal, refresh]
  );

  const markDone = useCallback(
    async (taskId: string) => {
      setBusy(true);
      try {
        const r = await fetch('/api/dev/platform-core/planner/complete', {
          method: 'POST',
          headers: plannerFetchHeaders(),
          body: JSON.stringify({ id: taskId, collection: collectionId, by: 'ui-manual' }),
        });
        if (!r.ok) {
          setActionMsg('Не удалось отметить — нужен dev:core');
          return;
        }
        patchTaskStatusLocal(taskId, 'done');
        await refresh();
      } finally {
        setBusy(false);
      }
    },
    [collectionId, patchTaskStatusLocal, refresh]
  );

  const analyzeProject = useCallback(async () => {
    setBusy(true);
    setActionMsg('Шаг 1/2: локальный аудит…');
    try {
      const r = await fetch('/api/dev/platform-core/planner/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: collectionId, useAgent: true }),
      });
      const j = (await r.json()) as {
        ok: boolean;
        message?: string;
        added?: { total: number };
        sessionId?: string;
        openChat?: boolean;
        scan?: { spawn?: { error?: string | null } };
      };
      if (!r.ok || !j.ok) {
        setActionMsg(r.status === 404 ? 'Запустите dev:core' : 'Сканирование не выполнено');
        return;
      }
      if (j.sessionId && j.openChat) {
        setChatSessionId(j.sessionId);
        setChatTaskTitle('Сканирование проекта (роли × столпы × разделы)');
        setAgentSessionStatus(j.scan?.spawn?.error ? 'error' : 'starting');
      }
      const localPart =
        j.added && j.added.total > 0
          ? `Локально +${j.added.total} пункт(ов). `
          : 'Локальный аудит без новых пунктов. ';
      setActionMsg(
        j.scan?.spawn?.error
          ? `${localPart}Агент не запущен: ${j.scan.spawn.error.slice(0, 160)}`
          : `${localPart}Шаг 2/2: Cursor-агент сканирует репо (2–5 мин) — статус в блоке ниже и в чате.`
      );
      await refresh({ skipScrollRestore: true });
    } catch {
      setActionMsg('API недоступен — dev:core на :3001');
    } finally {
      setBusy(false);
    }
  }, [collectionId, refresh]);

  const scrubClosedWave = useCallback(async () => {
    setBusy(true);
    setActionMsg(null);
    try {
      const r = await fetch(
        `/api/dev/platform-core/planner/scrub?collection=${encodeURIComponent(collectionId)}`,
        { method: 'POST', headers: plannerFetchHeaders() }
      );
      const j = (await r.json()) as { ok: boolean; p0Active?: number; removedDiscovered?: number };
      if (!r.ok || !j.ok) {
        setActionMsg('Сброс архива не выполнен — нужен dev:core :3001');
        return;
      }
      setActionMsg(
        `Архив закрытых задач очищен · P0 в очереди: ${j.p0Active ?? '—'} · убрано: ${j.removedDiscovered ?? 0}`
      );
      await refresh();
    } catch {
      setActionMsg('Сброс архива недоступен — dev:core :3001');
    } finally {
      setBusy(false);
    }
  }, [collectionId, refresh]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(
      () => void refresh({ skipScrollRestore: Boolean(chatSessionIdRef.current) }),
      8000
    );
    return () => window.clearInterval(id);
  }, [refresh]);

  const handleAgentStatusChange = useCallback(
    (status: string) => {
      setAgentSessionStatus(status);
      if (status === 'done') {
        setActionMsg(
          'Сканирование завершено. Новые пункты — во вкладке «Развитие» / «Техдолг» (обновите фильтр «Без готовых»).'
        );
        void refresh({ skipScrollRestore: true });
      } else if (status === 'error') {
        setActionMsg('Агент завершился с ошибкой — см. чат для деталей.');
      } else if (status === 'streaming' || status === 'running' || status === 'starting') {
        setActionMsg('Cursor-агент сканирует репозиторий… обычно 2–5 минут.');
      }
    },
    [refresh]
  );

  const scanStatusRunning =
    agentSessionStatus === 'running' ||
    agentSessionStatus === 'streaming' ||
    agentSessionStatus === 'starting';
  const scanStatusDone = agentSessionStatus === 'done';
  const scanStatusError = agentSessionStatus === 'error';

  const devItems = useMemo(() => {
    let items = snapshot.development;
    if (hideDone) items = items.filter((i) => i.status !== 'done');
    if (priority !== 'all') items = items.filter((i) => i.priority === priority);
    return sortPlannerItemsByPriorityThenStatus(items);
  }, [snapshot.development, priority, hideDone]);

  const devByPriority = useMemo(() => {
    const map: Record<PlannerPriority, PlatformCorePlannerItem[]> = { P0: [], P1: [], P2: [] };
    for (const item of devItems) map[item.priority].push(item);
    return map;
  }, [devItems]);

  const debtItems = useMemo(() => {
    let items = snapshot.techDebt;
    if (hideDone) items = items.filter((i) => i.status !== 'done');
    if (priority !== 'all') items = items.filter((i) => i.priority === priority);
    return sortPlannerItemsByPriorityThenStatus(items);
  }, [snapshot.techDebt, priority, hideDone]);

  const debtByPriority = useMemo(() => {
    const map: Record<PlannerPriority, typeof debtItems> = { P0: [], P1: [], P2: [] };
    for (const item of debtItems) map[item.priority].push(item);
    return map;
  }, [debtItems]);

  const nextOpen = snapshot.queue.find((t) => t.status === 'open');

  const devOpenCount = snapshot.development.filter((i) => i.status !== 'done').length;
  const debtOpenCount = snapshot.techDebt.filter((i) => i.status !== 'done').length;

  return (
    <section data-testid="platform-core-planner" className="min-w-0 space-y-4 overflow-x-clip">
      <div className="border-border-subtle rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-text-primary text-base font-bold">Планировщик развития</h2>
              <span
                data-testid="planner-agent-live"
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  apiOnline ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'
                )}
              >
                <span
                  className={cn('h-1.5 w-1.5 rounded-full', apiOnline ? 'bg-emerald-500' : 'bg-slate-400')}
                />
                {apiOnline ? 'в сети' : 'офлайн'}
              </span>
            </div>
            <p className="text-text-secondary max-w-xl text-[12px] leading-relaxed">
              Очередь улучшений по ролям и столпам — локальный аудит + Cursor SDK для глубокого скана.
            </p>
          </div>
          <div className={cn(platformCoreHubLayout.plannerToolbarRow, 'flex flex-wrap items-center gap-3')}>
            <PlannerStatChip label="P0 активно" value={plannerMeta.p0Active ?? snapshot.counts.p0} />
            <PlannerStatChip label="открыто" value={snapshot.counts.open} />
            <PlannerStatChip label="в работе" value={snapshot.counts.inProgress} />
            <PlannerStatChip label="готово" value={snapshot.counts.done} />
            <button
              type="button"
              title="Обновить"
              disabled={busy}
              className="text-text-muted hover:text-text-primary rounded p-1"
              onClick={() => void refresh()}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', busy && 'animate-spin')} />
            </button>
          </div>
        </div>

        {'agentDispatch' in snapshot && snapshot.agentDispatch && !chatSessionId ? (
          <p
            data-testid="planner-agent-dispatch"
            className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-[11px] text-blue-900"
          >
            <span className="font-semibold">Сейчас:</span> {snapshot.agentDispatch.taskTitle}
          </p>
        ) : null}

        {actionMsg ? (
          <p
            data-testid="planner-action-msg"
            className={cn(
              'mt-2 rounded-md px-3 py-2 text-[11px]',
              actionMsg.includes('не запущен') ||
                actionMsg.includes('Ошибка') ||
                actionMsg.includes('ошибк')
                ? 'border border-red-200 bg-red-50 text-red-900'
                : actionMsg.includes('завершено')
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border border-blue-200/80 bg-blue-50 text-blue-900'
            )}
          >
            {actionMsg}
          </p>
        ) : null}

        {chatSessionId ? (
          <div
            data-testid="planner-scan-status"
            className={cn(
              'mt-3 rounded-lg border px-3 py-2.5',
              scanStatusDone && 'border-emerald-200 bg-emerald-50',
              scanStatusError && 'border-red-200 bg-red-50',
              scanStatusRunning && 'border-blue-200 bg-blue-50',
              !scanStatusDone && !scanStatusError && !scanStatusRunning && 'border-slate-200 bg-slate-50'
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold">Сканирование проекта</p>
                <p className="text-[10px] opacity-90">
                  {scanStatusDone
                    ? 'Готово — агент отработал, список задач обновлён'
                    : scanStatusError
                      ? 'Ошибка — откройте чат'
                      : scanStatusRunning
                        ? 'В работе — ждите ответ в чате (2–5 мин)'
                        : 'Запуск…'}
                </p>
              </div>
              <span
                className={cn(
                  'rounded px-2 py-0.5 text-[9px] font-bold uppercase',
                  scanStatusDone && 'bg-emerald-200 text-emerald-900',
                  scanStatusError && 'bg-red-200 text-red-900',
                  scanStatusRunning && 'bg-blue-200 text-blue-900',
                  !scanStatusDone && !scanStatusError && !scanStatusRunning && 'bg-slate-200 text-slate-700'
                )}
              >
                {scanStatusDone
                  ? 'Готово'
                  : scanStatusError
                    ? 'Ошибка'
                    : scanStatusRunning
                      ? 'В работе'
                      : '…'}
              </span>
            </div>
            <p className="text-[9px] font-mono opacity-60 mt-1">{chatSessionId}</p>
          </div>
        ) : null}

        {!apiOnline && !loading ? (
          <p
            data-testid="planner-offline-hint"
            className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950"
          >
            Планировщик офлайн — hub должен быть на <strong>dev:core (:3001)</strong>. Запустите{' '}
            <code className="text-[10px]">npm run dev:core</code> из корня Projects. Устаревший офлайн-снимок
            больше не показывается — только live API.
          </p>
        ) : null}

        {apiOnline && !loading && (plannerMeta.p0Active ?? snapshot.counts.p0) === 0 ? (
          <p
            data-testid="planner-closed-wave-hint"
            className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-950"
          >
            Критичные e2e-задачи закрыты — в очереди только P1/P2. Если видите устаревшие P0,
            нажмите «Сбросить архив» и обновите страницу.
          </p>
        ) : null}

        {snapshot.sessionSummary ? (
          <div
            data-testid="planner-session-summary"
            className="mt-3 grid gap-3 sm:grid-cols-2"
          >
            <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-900">
                Сделано недавно
              </p>
              <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-[11px] text-emerald-950">
                {snapshot.sessionSummary.recentDone.map((entry) => (
                  <li key={entry.title}>
                    <span className="font-semibold">{entry.title}</span>
                    <span className="text-emerald-900/90"> — {entry.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-sky-200/80 bg-sky-50/60 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-sky-900">
                Дальше · приоритет
              </p>
              <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-[11px] text-sky-950">
                {snapshot.sessionSummary.nextUp.map((entry) => (
                  <li key={entry.title} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="text-[9px] font-bold uppercase text-sky-800">{entry.priority}</span>
                    {entry.href ? (
                      <Link href={entry.href} className="font-semibold hover:underline">
                        {entry.title}
                      </Link>
                    ) : (
                      <span className="font-semibold">{entry.title}</span>
                    )}
                    {entry.hint ? (
                      <span className="text-sky-900/80 w-full text-[10px]">{entry.hint}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div
          data-testid="platform-core-planner-actions"
          className={cn(hubCabinet.workspaceStickyActions, 'mt-4 max-md:static')}
        >
          <PlatformAiTaskStrip
            sectionId="planner-ui-dedup"
            pillarId="development"
            roleId="brand"
            task="Platform Core UI dedup scan: suggest ui_improvement tasks for duplicate tsx patterns"
            buttonLabel="UI dedup (AI scan)"
            testId="planner-ui-improvement-ai"
            className="w-full max-w-xl"
          />
          <button
            type="button"
            data-testid="planner-run-agents"
            disabled={busy || !nextOpen}
            className={cn(
              hubCabinet.workspacePrimaryBtn,
              'bg-accent-primary inline-flex items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold text-white disabled:opacity-40'
            )}
            onClick={() => void runAgents()}
          >
            <Play className="h-3.5 w-3.5" />
            {busy ? 'Запуск…' : nextOpen ? 'Следующая задача → агент' : 'Очередь пуста'}
          </button>
          <button
            type="button"
            data-testid="planner-scrub-closed-wave"
            disabled={busy || !apiOnline}
            className={cn(
              hubCabinet.workspacePrimaryBtn,
              'border-border-subtle inline-flex items-center justify-center gap-1.5 rounded-lg border bg-white px-3 text-[11px] font-semibold disabled:opacity-40'
            )}
            onClick={() => void scrubClosedWave()}
          >
            Сбросить архив
          </button>
          <button
            type="button"
            data-testid="planner-analyze"
            disabled={busy}
            className={cn(
              hubCabinet.workspacePrimaryBtn,
              'border-border-subtle inline-flex items-center justify-center gap-1.5 rounded-lg border bg-white px-3 text-[11px] font-semibold disabled:opacity-40'
            )}
            onClick={() => void analyzeProject()}
          >
            <Search className="h-3.5 w-3.5" />
            {busy ? 'Сканирую…' : 'Сканировать проект'}
          </button>
          <span className="text-text-muted hidden text-[10px] md:inline">
            Аудит → Cursor SDK на сервере (Mac dev:core) · iPhone: тот же хост + CURSOR_API_KEY
          </span>
        </div>
      </div>

      <div
        data-testid="platform-core-planner-toolbar"
        className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
      >
        <div
          className={cn(
            platformCoreHubLayout.plannerToolbarRow,
            'border-border-subtle inline-flex rounded-lg border bg-white p-0.5 text-[11px] font-medium'
          )}
        >
          <button
            type="button"
            data-testid="planner-tab-development"
            className={cn(
              'min-h-11 shrink-0 rounded-md px-3 py-1.5',
              tab === 'development' ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-muted'
            )}
            onClick={() => setTab('development')}
          >
            Развитие
            <span className="text-text-primary ml-1 tabular-nums font-semibold">{devOpenCount}</span>
            <span className="text-text-muted ml-0.5 tabular-nums">/ {snapshot.counts.development}</span>
          </button>
          <button
            type="button"
            data-testid="planner-tab-tech-debt"
            className={cn(
              'min-h-11 shrink-0 rounded-md px-3 py-1.5',
              tab === 'tech-debt' ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-muted'
            )}
            onClick={() => setTab('tech-debt')}
          >
            Техдолг
            <span className="text-text-primary ml-1 tabular-nums font-semibold">{debtOpenCount}</span>
            <span className="text-text-muted ml-0.5 tabular-nums">/ {snapshot.counts.techDebt}</span>
          </button>
        </div>

        <div className={cn(platformCoreHubLayout.plannerToolbarRow, 'shrink-0')}>
          <div className="border-border-subtle inline-flex shrink-0 rounded-lg border bg-white p-0.5 text-[10px] font-semibold">
            {(['all', ...PLANNER_PANEL_PRIORITIES] as const).map((p) => (
              <button
                key={p}
                type="button"
                className={cn(
                  'rounded px-2 py-1',
                  priority === p ? 'bg-slate-900 text-white' : 'text-text-muted'
                )}
                onClick={() => setPriority(p)}
              >
                {p === 'all' ? 'Все' : p}
              </button>
            ))}
          </div>
          <label className="text-text-muted flex cursor-pointer items-center gap-1.5 text-[11px]">
            <input
              type="checkbox"
              className="rounded"
              checked={hideDone}
              onChange={(e) => setHideDone(e.target.checked)}
            />
            Без готовых
          </label>
        </div>
      </div>

      <div
        className={cn(
          'gap-4',
          chatSessionId
            ? 'flex flex-col-reverse lg:grid lg:grid-cols-[1fr,min(380px,38%)] lg:items-start'
            : ''
        )}
      >
        <div ref={listScrollRef} className="min-w-0 space-y-2">
          {tab === 'development' ? (
            loading && devItems.length === 0 ? (
              <div className="border-border-subtle rounded-lg border bg-white px-4 py-10 text-center">
                <p className="text-text-muted text-sm">Загрузка очереди…</p>
              </div>
            ) : devItems.length === 0 ? (
              <div className="border-border-subtle rounded-lg border bg-white px-4 py-10 text-center">
                <Sparkles className="text-text-muted mx-auto mb-2 h-5 w-5 opacity-50" />
                <p className="text-text-muted text-sm">Нет задач для фильтра</p>
                {apiOnline ? (
                  <button
                    type="button"
                    className="text-accent-primary mt-2 text-[11px] font-semibold hover:underline"
                    onClick={() => void analyzeProject()}
                  >
                    Сканировать проект
                  </button>
                ) : null}
              </div>
            ) : priority === 'all' ? (
              PLANNER_PANEL_PRIORITIES.map((p) => (
                <PlannerPriorityGroup key={p} priority={p} items={devByPriority[p]} defaultOpen={p === 'P0'}>
                  {devByPriority[p].map((item) => (
                    <PlannerTaskRow
                      key={item.id}
                      item={item}
                      busy={busy}
                      apiOnline={apiOnline}
                      onAgent={(id) => void runAgents(id)}
                      onDone={(id) => void markDone(id)}
                    />
                  ))}
                </PlannerPriorityGroup>
              ))
            ) : (
              <ul className="border-border-subtle overflow-hidden rounded-lg border bg-white">
                {devItems.map((item) => (
                  <PlannerTaskRow
                    key={item.id}
                    item={item}
                    busy={busy}
                    apiOnline={apiOnline}
                    onAgent={(id) => void runAgents(id)}
                    onDone={(id) => void markDone(id)}
                  />
                ))}
              </ul>
            )
          ) : (
            debtItems.length === 0 ? (
              <div className="border-border-subtle rounded-lg border bg-white px-4 py-10 text-center">
                <p className="text-text-muted text-sm">Список пуст</p>
              </div>
            ) : priority === 'all' ? (
              PLANNER_PANEL_PRIORITIES.map((p) => (
                <PlannerPriorityGroup key={p} priority={p} items={debtByPriority[p]} defaultOpen={p === 'P0'}>
                  {debtByPriority[p].map((item) => (
                    <PlannerDebtRow
                      key={item.id}
                      item={item}
                      busy={busy}
                      apiOnline={apiOnline}
                      onAgent={(id) => void runAgents(id)}
                    />
                  ))}
                </PlannerPriorityGroup>
              ))
            ) : (
              <ul className="border-border-subtle overflow-hidden rounded-lg border bg-white">
                {debtItems.map((item) => (
                  <PlannerDebtRow
                    key={item.id}
                    item={item}
                    busy={busy}
                    apiOnline={apiOnline}
                    onAgent={(id) => void runAgents(id)}
                  />
                ))}
              </ul>
            )
          )}
        </div>

        {chatSessionId ? (
          <div className="min-h-[320px] lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]">
            <PlatformCoreAgentChat
              layout="dock"
              sessionId={chatSessionId}
              taskTitle={chatTaskTitle}
              onStatusChange={handleAgentStatusChange}
              onClose={() => {
                setChatSessionId(null);
                setAgentSessionStatus(null);
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
