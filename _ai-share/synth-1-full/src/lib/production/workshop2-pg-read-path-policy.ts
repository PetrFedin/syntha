import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { isPlatformCoreGoldenCollectionId } from '@/lib/platform-core-demo-context';
import type { Workshop2PublishedArticlesReadPath } from '@/lib/production/workshop2-pg-source-stats';

/** Platform Core golden-коллекции: published articles только из PG API, не localStorage SoT. */
export function isWorkshop2CorePgReadPathOnly(collectionId: string): boolean {
  const cid = collectionId.trim();
  return isPlatformCoreMode() && isPlatformCoreGoldenCollectionId(cid);
}

export function resolveWorkshop2HubPublishedArticlesReadPath(input: {
  collectionId: string;
  preferApi: boolean;
}): Workshop2PublishedArticlesReadPath {
  /** PG live → API; PG down → localStorage/demo seed без operator-баннеров. */
  if (input.preferApi) {
    return 'api';
  }
  return 'localStorage';
}

/** В core mode не пишем overlay/range-planner в localStorage как SoT. */
export function shouldPersistWorkshop2ClientOverlayToLocalStorage(): boolean {
  return !isPlatformCoreMode();
}

/** В core mode не зеркалим PG-досье в localStorage при hydrate. */
export function shouldMirrorWorkshop2DossierToLocalStorage(collectionId: string): boolean {
  return !isWorkshop2CorePgReadPathOnly(collectionId);
}

/** Wave SL: в core mode не читаем/пишем client-side localStorage как fallback SoT. */
export function shouldUseLocalStorageClientFallbackInCore(): boolean {
  return !isPlatformCoreMode();
}

/** Wave SL: не зеркалить успешный PG fetch в localStorage (rep drafts, templates, …). */
export function shouldMirrorPgClientStoreToLocalStorage(): boolean {
  return !isPlatformCoreMode();
}

/** Wave ST: matrix draft autosave — PG SoT в core, без localStorage fallback. */
export function shouldPersistShopMatrixDraftToLocalStorage(): boolean {
  return !isPlatformCoreMode();
}

/** Wave UN/XQ: phase1-dossier offline dual-write OFF in core (fail-closed LS). */
export function shouldPersistPhase1DossierOfflineDualWrite(): boolean {
  return shouldUseLocalStorageClientFallbackInCore();
}

/** Wave WS: rep offline drafts sync queue — PG only in core, no file/memory fallback. */
export function shouldUseShopRepOfflineDraftsFileMemoryFallback(): boolean {
  return !isPlatformCoreMode();
}
