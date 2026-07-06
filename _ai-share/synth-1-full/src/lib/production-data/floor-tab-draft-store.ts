'use client';

import type { FloorTabScope } from './port';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

const PREFIX = 'brand_floor_tab_draft_v1__';

export function floorTabDraftStorageKey(scope: FloorTabScope): string {
  return `${PREFIX}${scope}`;
}

export function loadFloorTabDraft(scope: FloorTabScope): unknown | null {
  if (typeof window === 'undefined') return null;
  if (!shouldUseLocalStorageClientFallbackInCore()) return null;
  try {
    const raw = window.localStorage.getItem(floorTabDraftStorageKey(scope));
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function saveFloorTabDraftToStorage(scope: FloorTabScope, payload: unknown): void {
  if (typeof window === 'undefined') return;
  if (!shouldMirrorPgClientStoreToLocalStorage()) return;
  window.localStorage.setItem(floorTabDraftStorageKey(scope), JSON.stringify(payload));
}
