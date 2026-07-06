'use client';

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { shouldMirrorPgClientStoreToLocalStorage } from '@/lib/production/workshop2-pg-read-path-policy';
import type { FloorTabScope } from './port';
import { loadFloorTabDraft, saveFloorTabDraftToStorage } from './floor-tab-draft-store';

export type FloorTabDraftPersistMode = 'postgres' | 'local';

export type FloorTabDraftLoadResult = {
  draft: unknown | null;
  persistMode: FloorTabDraftPersistMode;
  pgUnavailable: boolean;
};

let cachedPersistMode: FloorTabDraftPersistMode | null = null;

export function resetFloorTabDraftPersistModeCacheForTests(): void {
  cachedPersistMode = null;
}

/** PG `/api/brand/production/floor-tabs/:scope` when доступен; иначе localStorage (не в core). */
export async function loadFloorTabDraftWithMode(scope: FloorTabScope): Promise<FloorTabDraftLoadResult> {
  const corePgOnly = isPlatformCoreMode();
  try {
    const res = await fetch(`/api/brand/production/floor-tabs/${encodeURIComponent(scope)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean; draft?: unknown | null };
      if (data.ok) {
        cachedPersistMode = 'postgres';
        const draft = data.draft ?? null;
        if (draft && shouldMirrorPgClientStoreToLocalStorage()) {
          saveFloorTabDraftToStorage(scope, draft);
        }
        return { draft, persistMode: 'postgres', pgUnavailable: false };
      }
    }
    if (corePgOnly) {
      cachedPersistMode = 'postgres';
      return { draft: null, persistMode: 'postgres', pgUnavailable: true };
    }
  } catch {
    if (corePgOnly) {
      cachedPersistMode = 'postgres';
      return { draft: null, persistMode: 'postgres', pgUnavailable: true };
    }
  }
  cachedPersistMode = 'local';
  return { draft: loadFloorTabDraft(scope), persistMode: 'local', pgUnavailable: false };
}

export async function persistFloorTabDraft(
  scope: FloorTabScope,
  payload: unknown
): Promise<{ persistMode: FloorTabDraftPersistMode }> {
  const mode = cachedPersistMode ?? (await loadFloorTabDraftWithMode(scope)).persistMode;
  if (mode === 'postgres') {
    await fetch(`/api/brand/production/floor-tabs/${encodeURIComponent(scope)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draft: payload }),
    });
    if (shouldMirrorPgClientStoreToLocalStorage()) {
      saveFloorTabDraftToStorage(scope, payload);
    }
    return { persistMode: 'postgres' };
  }
  saveFloorTabDraftToStorage(scope, payload);
  return { persistMode: 'local' };
}
