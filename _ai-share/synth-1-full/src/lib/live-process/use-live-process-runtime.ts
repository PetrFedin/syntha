'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LiveProcessStageRuntime } from './types';
import { getLiveProcessDefinition } from './process-definitions';
import { shouldUseLocalStorageClientFallbackInCore } from '@/lib/production/workshop2-pg-read-path-policy';

export const LIVE_PROCESS_RUNTIME_STORAGE_PREFIX = 'live_process_runtime_v1';

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

function mergeRuntimesFromParsed(
  parsed: Record<string, LiveProcessStageRuntime>,
  stageIds: string[]
): Record<string, LiveProcessStageRuntime> {
  const merged = { ...buildInitialRuntimes(stageIds) };
  stageIds.forEach((id) => {
    if (!parsed[id]) return;
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
  });
  return merged;
}

export function useLiveProcessRuntime(processId: string, contextId: string) {
  const definition = getLiveProcessDefinition(processId);
  const stageIds = definition?.stages.map((s) => s.id) ?? [];
  const storageKey = `${STORAGE_PREFIX}__${processId}__${contextId || 'default'}`;
  const coreApiOnly = !shouldUseLocalStorageClientFallbackInCore();
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [runtimes, setRuntimes] = useState<Record<string, LiveProcessStageRuntime>>(() =>
    buildInitialRuntimes(stageIds)
  );

  useEffect(() => {
    if (!stageIds.length) return;

    if (coreApiOnly) {
      let cancelled = false;
      const ctx = contextId || 'default';
      void fetch(
        `/api/processes/${encodeURIComponent(processId)}/runtime?contextId=${encodeURIComponent(ctx)}`,
        { cache: 'no-store' }
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((payload: { runtimes?: Record<string, LiveProcessStageRuntime> } | null) => {
          if (cancelled || !payload?.runtimes) return;
          setRuntimes(mergeRuntimesFromParsed(payload.runtimes, stageIds));
        })
        .catch(() => {
          /* PG/file fallback — пустой seed */
        });
      return () => {
        cancelled = true;
      };
    }

    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, LiveProcessStageRuntime>;
        setRuntimes(mergeRuntimesFromParsed(parsed, stageIds));
      }
    } catch {
      // ignore
    }
  }, [coreApiOnly, storageKey, processId, contextId, stageIds.length]);

  useEffect(() => {
    if (!stageIds.length) return;

    if (coreApiOnly) {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
      persistTimerRef.current = setTimeout(() => {
        const ctx = contextId || 'default';
        void fetch(`/api/processes/${encodeURIComponent(processId)}/runtime?contextId=${encodeURIComponent(ctx)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runtimes }),
        });
      }, 400);
      window.dispatchEvent(new CustomEvent('live-process-runtime-updated'));
      return () => {
        if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
      };
    }

    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(runtimes));
    window.dispatchEvent(new CustomEvent('live-process-runtime-updated'));
  }, [runtimes, storageKey, stageIds.length, coreApiOnly, processId, contextId]);

  const updateStageRuntime = useCallback(
    (stageId: string, patch: Partial<LiveProcessStageRuntime>) => {
      setRuntimes((prev) => {
        const current = prev[stageId];
        if (!current) return prev;
        return {
          ...prev,
          [stageId]: { ...current, ...patch },
        };
      });
    },
    []
  );

  return { runtimes, updateStageRuntime, persistMode: coreApiOnly ? ('postgres' as const) : ('local' as const) };
}
