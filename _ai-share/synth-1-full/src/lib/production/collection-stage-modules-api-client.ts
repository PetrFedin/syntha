import type { CollectionStageModulesDoc } from '@/lib/production/collection-stage-modules-store';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { BRAND_COLLECTION_STAGE_MODULES_API } from '@/lib/platform/wave-xj-collection-stage-modules-pg';

export type CollectionStageModulesServerFetchResult = {
  doc: CollectionStageModulesDoc | null;
  storageMode: 'postgres' | 'memory' | 'unavailable';
};

export async function persistCollectionStageModulesToServer(input: {
  collectionKey: string;
  doc: CollectionStageModulesDoc;
}): Promise<'pg' | 'local' | 'error'> {
  if (!isPlatformCoreMode()) return 'local';
  const collectionId = input.collectionKey.trim();
  if (!collectionId) return 'error';
  try {
    const res = await fetch(BRAND_COLLECTION_STAGE_MODULES_API, {
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

export async function fetchCollectionStageModulesFromServerWithMode(
  collectionKey: string
): Promise<CollectionStageModulesServerFetchResult> {
  const collectionId = collectionKey.trim();
  if (!collectionId) {
    return { doc: null, storageMode: 'unavailable' };
  }
  try {
    const res = await fetch(
      `${BRAND_COLLECTION_STAGE_MODULES_API}?collectionId=${encodeURIComponent(collectionId)}`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    );
    const json = (await res.json()) as {
      doc?: CollectionStageModulesDoc | null;
      storageMode?: string;
    };
    if (!res.ok) {
      return { doc: null, storageMode: 'unavailable' };
    }
    const storageMode = json.storageMode === 'postgres' ? 'postgres' : 'memory';
    return { doc: json.doc ?? null, storageMode };
  } catch {
    return { doc: null, storageMode: 'unavailable' };
  }
}

/** @deprecated Prefer `fetchCollectionStageModulesFromServerWithMode` for storageMode. */
export async function fetchCollectionStageModulesFromServer(
  collectionKey: string
): Promise<CollectionStageModulesDoc | null> {
  const { doc } = await fetchCollectionStageModulesFromServerWithMode(collectionKey);
  return doc;
}
