'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Settings2,
  GanttChart,
  LayoutGrid,
  Columns3,
  GitBranch,
} from 'lucide-react';
import {
  getLiveProcessDefinition,
  getAllLiveProcessIds,
} from '@/lib/live-process/process-definitions';
import { getLiveProcessTeam } from '@/lib/live-process/mock-team';
import { getInstancesForProcess } from '@/lib/live-process/mock-contexts';
import { useLiveProcessRuntimeWithCalendar } from '@/lib/live-process/use-live-process-with-calendar';
import { LiveProcessSchemeGrid } from '@/components/live-process/LiveProcessSchemeGrid';
import { LiveProcessSchemeEditor } from '@/components/live-process/LiveProcessSchemeEditor';
import { LiveProcessStageCard } from '@/components/live-process/LiveProcessStageCard';
import { ProcessContextSelector } from '@/components/live-process/ProcessContextSelector';
import { LiveProcessMetrics } from '@/components/live-process/LiveProcessMetrics';
import { ProcessTriggersConfig } from '@/components/live-process/ProcessTriggersConfig';
import { ProcessGanttView } from '@/components/live-process/ProcessGanttView';
import { ProcessKanbanView } from '@/components/live-process/ProcessKanbanView';
import { ProcessGraphView } from '@/components/live-process/ProcessGraphView';
import { ProcessFilters, type ProcessFilterState } from '@/components/live-process/ProcessFilters';
import { PushNotificationBanner } from '@/components/live-process/PushNotificationBanner';
import { LiveProcessMobileQuickActions } from '@/components/live-process/LiveProcessMobileQuickActions';
import { processLiveUrl } from '@/lib/routes';
import { ROUTES } from '@/lib/routes';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  BRAND_PROCESS_RUNTIME_CORE_HINT_RU,
  BRAND_PROCESS_RUNTIME_PG_BADGE_RU,
  BRAND_PROCESS_RUNTIME_PG_UNAVAILABLE_RU,
  brandProcessRuntimeApi,
} from '@/lib/platform/brand-process-runtime-pg';
import type { LiveProcessDefinition } from '@/lib/live-process/types';

type ViewMode = 'grid' | 'kanban' | 'gantt' | 'graph';

const defaultFilters: ProcessFilterState = {
  statuses: [],
  assigneeIds: [],
  dateFrom: null,
  dateTo: null,
  contextIds: [],
};

export type LiveProcessPageBodyProps = {
  processId: string;
  /** Рендер внутри вкладки «Цех»: компактная шапка и контекст из коллекции производства */
  embedded?: boolean;
  /** Совпадает с `collectionId` на `/brand/production` (контекст процесса production) */
  workshopCollectionId?: string;
  /** Смена контекста в селекторе LIVE → обновить коллекцию в URL цеха */
  onWorkshopCollectionChange?: (collectionId: string) => void;
};

export function LiveProcessPageBody({
  processId,
  embedded = false,
  workshopCollectionId = '',
  onWorkshopCollectionChange,
}: LiveProcessPageBodyProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlContext = searchParams.get('context') ?? searchParams.get('contextId') ?? '';
  const workshopCtx = workshopCollectionId.trim();
  const contextId =
    embedded && onWorkshopCollectionChange ? workshopCtx || 'default' : urlContext || 'default';

  const handleContextChange = (newContextId: string) => {
    if (embedded && onWorkshopCollectionChange) {
      onWorkshopCollectionChange(newContextId);
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    next.set('context', newContextId);
    router.replace(`?${next.toString()}`);
  };

  const fullPageHref = processLiveUrl(
    processId,
    contextId && contextId !== 'default' ? contextId : undefined
  );

  const staticDefinition = useMemo(() => getLiveProcessDefinition(processId), [processId]);
  const [definition, setDefinition] = useState<LiveProcessDefinition | null>(staticDefinition);
  const [defResolved, setDefResolved] = useState(() => Boolean(staticDefinition));
  /** Сбрасывает редактор схемы при новой версии с сервера (GET/PUT). */
  const [schemeEditorRevision, setSchemeEditorRevision] = useState(0);

  useEffect(() => {
    setDefinition(staticDefinition);
  }, [staticDefinition]);

  useEffect(() => {
    setSchemeEditorRevision(0);
  }, [processId]);

  useEffect(() => {
    let cancelled = false;
    setDefResolved(Boolean(staticDefinition));
    fetch(`/api/processes/${encodeURIComponent(processId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        const def = data as LiveProcessDefinition | null;
        if (cancelled || !def?.id || !Array.isArray(def.stages)) return;
        setDefinition(def);
        setSchemeEditorRevision((n) => n + 1);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDefResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, [processId, staticDefinition]);

  const [processIdList, setProcessIdList] = useState<string[]>(() => getAllLiveProcessIds());
  const coreMode = isPlatformCoreMode();
  const [runtimeStorageMode, setRuntimeStorageMode] = useState<'pg' | 'unavailable' | 'file' | null>(
    null
  );
  const [workflowPersistenceLabel, setWorkflowPersistenceLabel] = useState(
    coreMode
      ? BRAND_PROCESS_RUNTIME_CORE_HINT_RU
      : 'PostgreSQL или `.data/workflow-store.json` (см. API `/api/processes`)'
  );
  useEffect(() => {
    if (coreMode) {
      const ctx = contextId || 'default';
      void fetch(brandProcessRuntimeApi(processId, ctx), { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((payload: { storageMode?: string } | null) => {
          const mode = payload?.storageMode;
          if (mode === 'pg') {
            setRuntimeStorageMode('pg');
            setWorkflowPersistenceLabel(
              'PostgreSQL `platform_core_live_workflow_store` (без localStorage)'
            );
          } else if (mode === 'file') {
            setRuntimeStorageMode('file');
            setWorkflowPersistenceLabel('файл `.data/workflow-store.json` на сервере');
          } else if (mode) {
            setRuntimeStorageMode('unavailable');
            setWorkflowPersistenceLabel(BRAND_PROCESS_RUNTIME_PG_UNAVAILABLE_RU);
          }
        })
        .catch(() => {
          setRuntimeStorageMode('unavailable');
        });
      return;
    }
    fetch('/api/processes')
      .then((r) => {
        const raw = r.headers.get('X-Workflow-Store');
        if (raw) {
          try {
            const meta = JSON.parse(raw) as { persistence?: string; writesEnabled?: boolean };
            if (meta.persistence === 'disabled') {
              setWorkflowPersistenceLabel('только встроенные схемы (WORKFLOW_STORE_DISABLED=1)');
            } else if (meta.persistence === 'postgres') {
              setWorkflowPersistenceLabel('PostgreSQL `platform_core_live_workflow_store`');
            } else if (meta.persistence === 'file') {
              setWorkflowPersistenceLabel('файл `.data/workflow-store.json` на сервере');
            }
          } catch {
            /* ignore */
          }
        }
        return r.ok ? r.json() : [];
      })
      .then((list: unknown) => {
        if (!Array.isArray(list) || !list.length) return;
        const ids = (list as { id: string }[]).map((p) => p.id).filter(Boolean);
        setProcessIdList((prev) => [...new Set([...prev, ...ids])]);
      })
      .catch(() => {});
  }, [coreMode, processId, contextId]);

  const team = useMemo(() => getLiveProcessTeam(), []);
  const { runtimes, updateStageRuntime, persistMode } = useLiveProcessRuntimeWithCalendar(
    processId,
    contextId || 'default',
    definition
  );

  const completedCount = useMemo(() => {
    if (!definition) return 0;
    return definition.stages.filter((s) => runtimes[s.id]?.status === 'done').length;
  }, [definition, runtimes]);
  const progressPct = definition
    ? Math.round((completedCount / definition.stages.length) * 100)
    : 0;

  const [showDetailedView, setShowDetailedView] = useState(false);
  const [showSchemeEditor, setShowSchemeEditor] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<ProcessFilterState>(defaultFilters);

  const instances = useMemo(() => getInstancesForProcess(processId), [processId]);
  const contextLabels = useMemo(
    () => instances.map((i) => ({ id: i.contextId, label: i.context.label })),
    [instances]
  );

  const filteredStages = useMemo(() => {
    if (!definition) return [];
    if (
      !filters.statuses.length &&
      !filters.assigneeIds.length &&
      !filters.dateFrom &&
      !filters.dateTo
    ) {
      return definition.stages;
    }
    return definition.stages.filter((stage) => {
      const rt = runtimes[stage.id];
      if (!rt) return true;
      if (filters.statuses.length && !filters.statuses.includes(rt.status)) return false;
      if (
        filters.assigneeIds.length &&
        !rt.assigneeIds.some((id) => filters.assigneeIds.includes(id))
      ) {
        return false;
      }
      if (
        filters.dateFrom &&
        rt.plannedEndAt &&
        new Date(rt.plannedEndAt) < new Date(filters.dateFrom)
      )
        return false;
      if (
        filters.dateTo &&
        rt.plannedStartAt &&
        new Date(rt.plannedStartAt) > new Date(filters.dateTo)
      )
        return false;
      return true;
    });
  }, [definition, runtimes, filters]);
  const isBlocked = useMemo(() => {
    const doneIds = new Set(
      definition?.stages.filter((s) => runtimes[s.id]?.status === 'done').map((s) => s.id) ?? []
    );
    return (stageId: string) => {
      const stage = definition?.stages.find((s) => s.id === stageId);
      if (!stage?.dependsOn.length) return false;
      return stage.dependsOn.some((depId) => !doneIds.has(depId));
    };
  }, [definition, runtimes]);

  if (!processId) {
    return null;
  }

  if (!definition && !defResolved) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">
        Загрузка схемы процесса…
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>LIVE process</CardTitle>
            <CardDescription>Процесс не найден или выберите другой:</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {processIdList.map((id) => (
              <Link key={id} href={processLiveUrl(id)}>
                <Button variant="outline" size="sm">
                  {id}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? 'mx-auto max-w-6xl px-0 py-2 pb-8 md:pb-6'
          : 'container mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-8'
      }
    >
      {/* Header: mobile-friendly */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex shrink-0 items-center gap-2">
          {!embedded ? (
            <Link href={ROUTES.brand.controlCenter ?? ROUTES.brand.home}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" className="h-9 shrink-0" asChild>
              <Link href={fullPageHref} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Отдельно</span>
              </Link>
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold uppercase tracking-tight md:text-2xl">
              LIVE: {definition.name}
            </h1>
            <p className="text-text-secondary mt-0.5 line-clamp-2 text-xs md:text-sm">
              {embedded
                ? `${definition.description} Контекст коллекции совпадает с выбором на вкладке «Коллекция», если задан.`
                : definition.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {coreMode && persistMode === 'postgres' ? (
            runtimeStorageMode === 'pg' || runtimeStorageMode === null ? (
              <Badge
                variant="outline"
                className="text-[9px]"
                data-testid="live-process-runtime-storage-pg"
              >
                {BRAND_PROCESS_RUNTIME_PG_BADGE_RU}
              </Badge>
            ) : runtimeStorageMode === 'unavailable' ? (
              <Badge
                variant="outline"
                className="border-amber-500/50 text-[9px] text-amber-800"
                data-testid="live-process-runtime-storage-unavailable"
              >
                {BRAND_PROCESS_RUNTIME_PG_UNAVAILABLE_RU}
              </Badge>
            ) : null
          ) : null}
          {definition.contextKey && (
            <div className="w-full md:w-auto">
              <ProcessContextSelector
                processId={processId}
                contextKey={definition.contextKey}
                contextId={contextId}
                onContextChange={handleContextChange}
              />
            </div>
          )}
          <Link href={ROUTES.brand.team}>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Команда
            </Button>
          </Link>
          <Link href={ROUTES.brand.calendar}>
            <Button variant="outline" size="sm">
              Календарь
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSchemeEditor(!showSchemeEditor)}
          >
            <Settings2 className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Конструктор</span>
          </Button>
        </div>
      </div>

      {/* View switcher + Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="bg-bg-surface2 flex rounded-lg border p-0.5">
          {[
            { id: 'grid' as ViewMode, icon: LayoutGrid, label: 'Схема' },
            { id: 'kanban' as ViewMode, icon: Columns3, label: 'Kanban' },
            { id: 'gantt' as ViewMode, icon: GanttChart, label: 'Gantt' },
            { id: 'graph' as ViewMode, icon: GitBranch, label: 'Граф' },
          ].map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={viewMode === id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(id)}
              className="rounded-md"
            >
              <Icon className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
        <ProcessFilters
          team={team}
          contextLabels={contextLabels}
          filters={filters}
          onChange={setFilters}
        />
        <PushNotificationBanner />
      </div>

      {showSchemeEditor && (
        <div className="border-border-default bg-bg-surface2/80 mb-6 rounded-lg border p-4">
          <h2 className="text-text-primary mb-3 text-sm font-bold uppercase tracking-tight">
            Редактор этапов — создание/редактирование без деплоя
          </h2>
          <LiveProcessSchemeEditor
            key={`${processId}-${schemeEditorRevision}`}
            processId={processId}
            initialDefinition={definition}
            onSave={async (def) => {
              const res = await fetch(`/api/processes/${processId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(def),
              });
              if (res.ok) {
                const updated = (await res.json()) as LiveProcessDefinition;
                if (updated?.id && Array.isArray(updated.stages)) {
                  setDefinition(updated);
                  setSchemeEditorRevision((n) => n + 1);
                }
                setShowSchemeEditor(false);
              }
            }}
          />
        </div>
      )}

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm uppercase tracking-tight">Прогресс по этапам</CardTitle>
          <CardDescription>
            Ответственные, даты, доступы и обсуждения по каждому этапу. Прогресс этапов — через{' '}
            {workflowPersistenceLabel}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-3">
            <Progress value={progressPct} className="h-2 flex-1" />
            <span className="text-sm font-medium">
              {completedCount} из {definition.stages.length}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {processIdList.map((id) => (
              <Link key={id} href={processLiveUrl(id, contextId)}>
                <Button
                  variant={id === processId ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs"
                >
                  {id}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Метрики и KPI */}
      {showMetrics && (
        <div className="mb-6">
          <LiveProcessMetrics processId={processId} />
        </div>
      )}

      {/* View: Grid | Kanban | Gantt | Graph */}
      <div className="mb-6">
        {viewMode === 'grid' && (
          <>
            <h2 className="text-text-primary mb-3 text-sm font-bold uppercase tracking-tight">
              Поэтапная схема: {definition.name}
              {filteredStages.length !== definition.stages.length && (
                <span className="text-text-secondary ml-2 font-normal">
                  (показано {filteredStages.length} из {definition.stages.length})
                </span>
              )}
            </h2>
            <p className="text-text-secondary mb-4 text-xs">
              Выберите ответственных, даты. Наведите на блок — подсветятся связи.
            </p>
            <div className="overflow-x-auto pb-4">
              <LiveProcessSchemeGrid
                stages={filteredStages.length ? filteredStages : definition.stages}
                runtimes={runtimes}
                team={team}
                isBlocked={isBlocked}
                onUpdateRuntime={updateStageRuntime}
                processLinks={definition.processLinks}
              />
            </div>
          </>
        )}
        {viewMode === 'kanban' && (
          <>
            <h2 className="text-text-primary mb-3 text-sm font-bold uppercase tracking-tight">
              Kanban: этапы — колонки, карточки — инстансы
            </h2>
            <p className="text-text-secondary mb-4 text-xs">
              Карточка инстанса в колонке текущего этапа. Клик — переход к инстансу.
            </p>
            <ProcessKanbanView
              processId={processId}
              stages={definition.stages}
              team={team}
              contextId={contextId || undefined}
              refreshToken={runtimes}
              filterContextIds={filters.contextIds.length ? filters.contextIds : undefined}
            />
          </>
        )}
        {viewMode === 'gantt' && (
          <>
            <h2 className="text-text-primary mb-3 text-sm font-bold uppercase tracking-tight">
              Gantt: этапы по датам
            </h2>
            <p className="text-text-secondary mb-4 text-xs">
              Все этапы инстансов. Даты синхронизируются с календарём.
            </p>
            <ProcessGanttView processId={processId} contextId={contextId || undefined} />
          </>
        )}
        {viewMode === 'graph' && (
          <>
            <h2 className="text-text-primary mb-3 text-sm font-bold uppercase tracking-tight">
              Граф: узлы — этапы, рёбра — зависимости
            </h2>
            <p className="text-text-secondary mb-4 text-xs">
              Наведите на узел — подсветятся связи. Цвет: зелёный — готово, синий — в работе.
            </p>
            <ProcessGraphView stages={definition.stages} runtimes={runtimes} />
          </>
        )}
      </div>

      {/* Подробный вид: доступ, обсуждения, задачи */}
      <div className="border-border-default mt-8 border-t pt-6">
        <button
          type="button"
          onClick={() => setShowDetailedView(!showDetailedView)}
          className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm font-medium"
        >
          {showDetailedView ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          Подробный вид по этапам: доступ, участники обсуждения, комментарии, заметки, задачи
        </button>
        {showDetailedView && (
          <div className="mt-4 space-y-4">
            {definition.stages.map((stage, index) => {
              const runtime = runtimes[stage.id];
              if (!runtime) return null;
              return (
                <LiveProcessStageCard
                  key={stage.id}
                  stage={stage}
                  runtime={runtime}
                  team={team}
                  isBlocked={isBlocked(stage.id)}
                  onUpdateRuntime={updateStageRuntime}
                  index={index}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Триггеры и Webhooks */}
      <div className="border-border-default mt-8 border-t pt-6">
        <ProcessTriggersConfig />
      </div>

      {/* Мобильный вид: быстрая смена статуса и комментарии */}
      <LiveProcessMobileQuickActions
        stages={definition.stages}
        runtimes={runtimes}
        onStatusChange={(stageId, status) => updateStageRuntime(stageId, { status })}
        onOpenChat={() => setShowDetailedView(true)}
      />
    </div>
  );
}
