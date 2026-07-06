'use client';

import { useEffect, useState, useCallback } from 'react';
import type { LiveProcessStageRuntime } from './types';
import { getLiveProcessDefinition } from './process-definitions';
import { getInstancesForProcess } from './mock-contexts';
import { LIVE_PROCESS_RUNTIME_STORAGE_PREFIX } from '@/lib/live-process/use-live-process-runtime';
import { shouldUseLocalStorageClientFallbackInCore } from '@/lib/production/workshop2-pg-read-path-policy';

const STORAGE_PREFIX = LIVE_PROCESS_RUNTIME_STORAGE_PREFIX;

function buildInitialRuntimes(stageIds: string[]): Record<string, LiveProcessStageRuntime> {
  const out: Record<string, LiveProcessStageRuntime> = {};
  stageIds.forEach((id) => {
    out[id] = {
      stageId: id,
      status: 'not_started',
      assigneeIds: [],
      primaryAssigneeId: null,
      blockedMemberIds: [],
      plannedStartAt: null,
      plannedEndAt: null,
      calendarEventId: null,
      chatId: null,
      participantIds: [],
      comments: [],
      tasks: [],
      note: null,
    };
  });
  return out;
}

function readRuntimesFromStorage(
  processId: string,
  contextId: string,
  stageIds: string[]
): Record<string, LiveProcessStageRuntime> {
  if (typeof window === 'undefined') return buildInitialRuntimes(stageIds);
  if (!shouldUseLocalStorageClientFallbackInCore()) return buildInitialRuntimes(stageIds);
  const storageKey = `${STORAGE_PREFIX}__${processId}__${contextId || 'default'}`;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return buildInitialRuntimes(stageIds);
    const parsed = JSON.parse(raw) as Record<string, LiveProcessStageRuntime>;
    const merged = { ...buildInitialRuntimes(stageIds) };
    stageIds.forEach((id) => {
      if (parsed[id]) {
        const p = parsed[id];
        const assigneeIds = Array.isArray(p.assigneeIds)
          ? p.assigneeIds
          : p.assigneeId
            ? [p.assigneeId]
            : [];
        const primaryAssigneeId =
          p.primaryAssigneeId && assigneeIds.includes(p.primaryAssigneeId)
            ? p.primaryAssigneeId
            : (assigneeIds[0] ?? null);
        merged[id] = {
          ...merged[id],
          ...p,
          stageId: id,
          assigneeIds,
          primaryAssigneeId: primaryAssigneeId ?? p.primaryAssigneeId ?? null,
          comments: p.comments ?? merged[id].comments,
          tasks: p.tasks ?? merged[id].tasks,
        };
      }
    });
    return merged;
  } catch {
    return buildInitialRuntimes(stageIds);
  }
}

export type AllInstancesRuntimes = Map<
  string,
  {
    instanceId: string;
    contextId: string;
    contextLabel: string;
    runtimes: Record<string, LiveProcessStageRuntime>;
  }
>;

/** Читает runtimes всех инстансов процесса из localStorage. Обновляется при изменении refreshToken. */
export function useAllInstancesRuntimes(
  processId: string,
  refreshToken?: unknown
): AllInstancesRuntimes {
  const [data, setData] = useState<AllInstancesRuntimes>(() => {
    const insts = getInstancesForProcess(processId);
    const def = getLiveProcessDefinition(processId);
    const stageIds = def?.stages.map((s) => s.id) ?? [];
    const map = new Map<
      string,
      {
        instanceId: string;
        contextId: string;
        contextLabel: string;
        runtimes: Record<string, LiveProcessStageRuntime>;
      }
    >();
    insts.forEach((inst) => {
      map.set(inst.contextId, {
        instanceId: inst.id,
        contextId: inst.contextId,
        contextLabel: inst.context.label,
        runtimes: readRuntimesFromStorage(processId, inst.contextId, stageIds),
      });
    });
    return map;
  });

  const refresh = useCallback(() => {
    const insts = getInstancesForProcess(processId);
    const def = getLiveProcessDefinition(processId);
    const ids = def?.stages.map((s) => s.id) ?? [];
    const map = new Map<
      string,
      {
        instanceId: string;
        contextId: string;
        contextLabel: string;
        runtimes: Record<string, LiveProcessStageRuntime>;
      }
    >();
    insts.forEach((inst) => {
      map.set(inst.contextId, {
        instanceId: inst.id,
        contextId: inst.contextId,
        contextLabel: inst.context.label,
        runtimes: readRuntimesFromStorage(processId, inst.contextId, ids),
      });
    });
    setData(map);
  }, [processId]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshToken]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('storage', handler);
    window.addEventListener('live-process-runtime-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('live-process-runtime-updated', handler);
    };
  }, [refresh]);

  return data;
}

/** Вычисляет текущий этап инстанса (где карточка в Kanban). */
export function getCurrentStageForInstance(
  stages: { id: string; dependsOn: string[] }[],
  runtimes: Record<string, LiveProcessStageRuntime>
): string {
  const stageIds = stages.map((s) => s.id);
  const depMap = new Map(stages.map((s) => [s.id, s.dependsOn]));
  const doneIds = new Set(stageIds.filter((id) => runtimes[id]?.status === 'done'));
  const inProgress = stageIds.find((id) => runtimes[id]?.status === 'in_progress');
  if (inProgress) return inProgress;
  const firstNotStarted = stageIds.find((id) => {
    const deps = depMap.get(id) ?? [];
    return runtimes[id]?.status === 'not_started' && deps.every((d) => doneIds.has(d));
  });
  if (firstNotStarted) return firstNotStarted;
  return stageIds[stageIds.length - 1] ?? '';
}
