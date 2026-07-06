'use client';

import { shouldUseLocalStorageClientFallbackInCore } from '@/lib/production/workshop2-pg-read-path-policy';
import type { BrandTaskRecord } from './port';
import { loadBrandTasks, saveBrandTasks } from './brand-tasks-store';

export type BrandTasksPersistMode = 'postgres' | 'local';

export type BrandTasksLoadResult = {
  tasks: BrandTaskRecord[];
  persistMode: BrandTasksPersistMode;
  pgUnavailable: boolean;
};

let cachedPersistMode: BrandTasksPersistMode | null = null;

export function resetBrandTasksPersistModeCacheForTests(): void {
  cachedPersistMode = null;
}

/** PG `/api/brand/tasks` when доступен; иначе localStorage (не в Platform Core pg-only). */
export async function loadBrandTasksWithMode(): Promise<BrandTasksLoadResult> {
  const corePgOnly = !shouldUseLocalStorageClientFallbackInCore();
  try {
    const res = await fetch('/api/brand/tasks', { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean; tasks?: BrandTaskRecord[] };
      if (data.ok && Array.isArray(data.tasks)) {
        cachedPersistMode = 'postgres';
        return { tasks: data.tasks, persistMode: 'postgres', pgUnavailable: false };
      }
    }
    if (corePgOnly) {
      cachedPersistMode = 'postgres';
      return { tasks: [], persistMode: 'postgres', pgUnavailable: true };
    }
  } catch {
    if (corePgOnly) {
      cachedPersistMode = 'postgres';
      return { tasks: [], persistMode: 'postgres', pgUnavailable: true };
    }
  }
  cachedPersistMode = 'local';
  return { tasks: loadBrandTasks(), persistMode: 'local', pgUnavailable: false };
}

export async function persistBrandTasks(tasks: BrandTaskRecord[]): Promise<void> {
  const corePgOnly = !shouldUseLocalStorageClientFallbackInCore();
  const mode = cachedPersistMode ?? (await loadBrandTasksWithMode()).persistMode;
  if (corePgOnly || mode === 'postgres') {
    await fetch('/api/brand/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    });
    return;
  }
  saveBrandTasks(tasks);
}
