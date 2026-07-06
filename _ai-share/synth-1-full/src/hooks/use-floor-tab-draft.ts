'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FloorTabScope } from '@/lib/production-data/port';
import { getProductionDataPort } from '@/lib/production-data';
import type { FloorTabDraftPersistMode } from '@/lib/production-data/floor-tab-draft-client';
import { loadFloorTabDraftWithMode } from '@/lib/production-data/floor-tab-draft-client';

/**
 * Черновик вкладки цеха: PG API в core mode, иначе localStorage через ProductionDataPort.
 */
export function useFloorTabDraftState<T extends Record<string, unknown>>(
  scope: FloorTabScope,
  defaultData: T
) {
  const defaultRef = useRef(defaultData);
  defaultRef.current = defaultData;

  const [data, setData] = useState<T>(() => ({ ...defaultData }));
  const [hydrated, setHydrated] = useState(false);
  const [persistMode, setPersistMode] = useState<FloorTabDraftPersistMode>('local');
  const [pgUnavailable, setPgUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadFloorTabDraftWithMode(scope);
        if (cancelled) return;
        setPersistMode(loaded.persistMode);
        setPgUnavailable(loaded.pgUnavailable);
        const raw = loaded.draft ?? (await getProductionDataPort().getFloorTabDraft(scope));
        if (raw && typeof raw === 'object' && (raw as { v?: number }).v === 1) {
          setData({ ...(defaultRef.current as object), ...(raw as object) } as T);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const save = useCallback(async () => {
    const payload = {
      ...(data as object),
      v: 1 as const,
      updatedAt: new Date().toISOString(),
    };
    await getProductionDataPort().saveFloorTabDraft(scope, payload);
    const refreshed = await loadFloorTabDraftWithMode(scope);
    setPersistMode(refreshed.persistMode);
    setPgUnavailable(refreshed.pgUnavailable);
  }, [scope, data]);

  return { data, setData, save, hydrated, persistMode, pgUnavailable };
}
