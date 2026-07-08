'use client';

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { BrandProductionState } from '@/lib/brand-production/types';
import { createSeedState } from '@/lib/brand-production/seed';
import { loadBrandProductionState } from '@/lib/brand-production/store';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

export async function loadBrandProductionOpsWithMode(): Promise<{
  state: BrandProductionState;
  storageMode: 'postgres' | 'local' | 'unavailable';
}> {
  if (!isPlatformCoreMode()) {
    return { state: loadBrandProductionState(), storageMode: 'local' };
  }
  try {
    const res = await fetch('/api/brand/production/operations-state', {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    });
    const json = (await res.json()) as {
      ok?: boolean;
      state?: BrandProductionState;
      storageMode?: string;
    };
    if (res.ok && json.ok && json.state) {
      return {
        state: json.state,
        storageMode:
          json.storageMode === 'pg' || json.storageMode === 'postgres' ? 'postgres' : 'unavailable',
      };
    }
    return { state: createSeedState(), storageMode: 'unavailable' };
  } catch {
    return { state: createSeedState(), storageMode: 'unavailable' };
  }
}

export async function persistBrandProductionOpsState(state: BrandProductionState): Promise<void> {
  if (!isPlatformCoreMode()) return;
  await fetch('/api/brand/production/operations-state', {
    method: 'PUT',
    headers: {
      ...buildWorkshop2ApiRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state }),
  });
}
