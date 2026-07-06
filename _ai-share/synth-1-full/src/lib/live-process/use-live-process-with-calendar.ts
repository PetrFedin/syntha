'use client';

import { useCallback } from 'react';
import { useLiveProcessRuntime } from './use-live-process-runtime';
import { syncDatesToCalendar } from './calendar-sync';
import { getLiveProcessDefinition } from './process-definitions';
import type { LiveProcessDefinition, LiveProcessStageRuntime } from './types';

/** Хук runtime с синхронизацией дат в календарь */
export function useLiveProcessRuntimeWithCalendar(
  processId: string,
  contextId: string,
  /** Схема с сервера (`/api/processes/:id`) — приоритетнее встроенной. */
  definitionOverride?: LiveProcessDefinition | null
) {
  const { runtimes, updateStageRuntime, persistMode } = useLiveProcessRuntime(processId, contextId);
  const definition = definitionOverride ?? getLiveProcessDefinition(processId);
  const ctx = contextId || 'default';

  const updateWithCalendarSync = useCallback(
    (stageId: string, patch: Partial<LiveProcessStageRuntime>) => {
      updateStageRuntime(stageId, patch);

      if ('plannedStartAt' in patch || 'plannedEndAt' in patch) {
        const stage = definition?.stages.find((s) => s.id === stageId);
        const rt = runtimes[stageId];
        const start =
          patch.plannedStartAt !== undefined ? patch.plannedStartAt : (rt?.plannedStartAt ?? null);
        const end =
          patch.plannedEndAt !== undefined ? patch.plannedEndAt : (rt?.plannedEndAt ?? null);
        syncDatesToCalendar(processId, ctx, stageId, stage?.title ?? stageId, start, end);
      }
    },
    [processId, ctx, definition, runtimes, updateStageRuntime]
  );

  return { runtimes, updateStageRuntime: updateWithCalendarSync, persistMode };
}
