import type { LocalOrderLine } from '@/lib/production/local-collection-inventory';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { BRAND_COLLECTION_INVENTORY_OVERLAY_API } from '@/lib/platform/wave-yb-brand-inventory-overlay-pg';

export type CollectionInventoryOverlayDoc = {
  v: 1;
  articles: LocalOrderLine[];
};

export type CollectionInventoryOverlayServerFetchResult = {
  doc: CollectionInventoryOverlayDoc | null;
  storageMode: 'postgres' | 'memory' | 'unavailable';
};

export async function persistCollectionInventoryOverlayToServer(input: {
  collectionId: string;
  doc: CollectionInventoryOverlayDoc;
}): Promise<'pg' | 'local' | 'error'> {
  if (!isPlatformCoreMode()) return 'local';
  const collectionId = input.collectionId.trim();
  if (!collectionId) return 'error';
  try {
    const res = await fetch(BRAND_COLLECTION_INVENTORY_OVERLAY_API, {
      method: 'PUT',
      headers: {
        ...buildWorkshop2ApiRequestHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionId, doc: input.doc }),
    });
    if (!res.ok) return 'error';
    const json = (await res.json()) as { storageMode?: string };
    return json.storageMode === 'postgres' ? 'pg' : 'local';
  } catch {
    return 'error';
  }
}

export async function fetchCollectionInventoryOverlayFromServerWithMode(
  collectionId: string
): Promise<CollectionInventoryOverlayServerFetchResult> {
  const cid = collectionId.trim();
  if (!cid) {
    return { doc: null, storageMode: 'unavailable' };
  }
  try {
    const res = await fetch(
      `${BRAND_COLLECTION_INVENTORY_OVERLAY_API}?collectionId=${encodeURIComponent(cid)}`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    );
    const json = (await res.json()) as {
      doc?: CollectionInventoryOverlayDoc | null;
      storageMode?: string;
    };
    if (!res.ok) {
      return { doc: null, storageMode: 'unavailable' };
    }
    const storageMode = json.storageMode === 'postgres' ? 'postgres' : 'memory';
    return { doc: json.doc ?? { v: 1, articles: [] }, storageMode };
  } catch {
    return { doc: null, storageMode: 'unavailable' };
  }
}
