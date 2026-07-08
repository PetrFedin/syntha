/**
 * Overlay артикулов коллекции на brand production floor.
 * Core mode: PG SoT через `/api/brand/collection-inventory-overlay`; localStorage только вне core.
 */

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { LocalOrderLine } from '@/lib/production/local-collection-inventory';
import {
  fetchCollectionInventoryOverlayFromServerWithMode,
  persistCollectionInventoryOverlayToServer,
  type CollectionInventoryOverlayDoc,
} from '@/lib/production/collection-inventory-overlay-api-client';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

export type { CollectionInventoryOverlayDoc };

export const COLLECTION_INVENTORY_OVERLAY_LS_PREFIX = 'brand_collection_inventory_overlay_v1__';

const PREFIX = COLLECTION_INVENTORY_OVERLAY_LS_PREFIX;

function storageKey(collectionId: string): string {
  return `${PREFIX}${collectionId.trim() || 'default'}`;
}

export type CollectionInventoryOverlayLoadResult = {
  doc: CollectionInventoryOverlayDoc;
  persistMode: 'postgres' | 'localStorage' | 'unavailable';
  pgUnavailable: boolean;
};

let persistModeCache: CollectionInventoryOverlayLoadResult['persistMode'] | null = null;

export function resetCollectionInventoryOverlayPersistModeCacheForTests(): void {
  persistModeCache = null;
}

function emptyDoc(): CollectionInventoryOverlayDoc {
  return { v: 1, articles: [] };
}

function loadFromLocalStorage(collectionId: string): CollectionInventoryOverlayDoc {
  if (typeof window === 'undefined') return emptyDoc();
  if (!shouldUseLocalStorageClientFallbackInCore()) return emptyDoc();
  try {
    const raw = window.localStorage.getItem(storageKey(collectionId));
    if (!raw) return emptyDoc();
    const p = JSON.parse(raw) as CollectionInventoryOverlayDoc;
    if (!p || p.v !== 1 || !Array.isArray(p.articles)) return emptyDoc();
    return p;
  } catch {
    return emptyDoc();
  }
}

function saveToLocalStorage(collectionId: string, doc: CollectionInventoryOverlayDoc): void {
  if (typeof window === 'undefined') return;
  if (!shouldMirrorPgClientStoreToLocalStorage()) return;
  try {
    window.localStorage.setItem(storageKey(collectionId), JSON.stringify(doc));
  } catch {
    /* quota */
  }
}

/** Core: GET PG; non-core: localStorage. Fail-closed in core when PG down. */
export async function loadCollectionInventoryOverlayWithMode(
  collectionId: string
): Promise<CollectionInventoryOverlayLoadResult> {
  const cid = collectionId.trim();
  if (!cid) {
    return { doc: emptyDoc(), persistMode: 'unavailable', pgUnavailable: true };
  }

  if (isPlatformCoreMode()) {
    const fetched = await fetchCollectionInventoryOverlayFromServerWithMode(cid);
    if (fetched.storageMode === 'postgres' && fetched.doc) {
      persistModeCache = 'postgres';
      return { doc: fetched.doc, persistMode: 'postgres', pgUnavailable: false };
    }
    persistModeCache = 'postgres';
    return { doc: emptyDoc(), persistMode: 'postgres', pgUnavailable: true };
  }

  persistModeCache = 'localStorage';
  return {
    doc: loadFromLocalStorage(cid),
    persistMode: 'localStorage',
    pgUnavailable: false,
  };
}

export async function saveCollectionInventoryOverlay(
  collectionId: string,
  doc: CollectionInventoryOverlayDoc
): Promise<'pg' | 'local' | 'error'> {
  const cid = collectionId.trim();
  if (!cid) return 'error';

  if (isPlatformCoreMode()) {
    const result = await persistCollectionInventoryOverlayToServer({ collectionId: cid, doc });
    return result;
  }

  saveToLocalStorage(cid, doc);
  return 'local';
}

export function mergeCollectionInventoryOverlayArticles(
  seedItems: readonly Record<string, unknown>[],
  overlayArticles: readonly LocalOrderLine[],
  collectionId: string
): Record<string, unknown>[] {
  if (!overlayArticles.length) return [...seedItems];
  const extras = overlayArticles as unknown as Record<string, unknown>[];
  if (collectionId === 'Investor') {
    return [...seedItems.filter((i) => i.investorDemo === true), ...extras];
  }
  if (!collectionId) {
    return [...seedItems, ...extras];
  }
  return [...seedItems.filter((item) => item.season === collectionId), ...extras];
}

export function getCollectionInventoryOverlayPersistMode(): CollectionInventoryOverlayLoadResult['persistMode'] {
  if (isPlatformCoreMode()) return persistModeCache ?? 'postgres';
  return 'localStorage';
}
