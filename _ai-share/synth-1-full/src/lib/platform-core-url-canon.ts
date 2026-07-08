import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

/** SS27/FW27 demo pin — не показываем в URL (сезон только в данных, не в пути). */
export function isDefaultPlatformCoreCollectionId(
  collectionId: string | null | undefined
): boolean {
  const cid = collectionId?.trim();
  if (!cid) return true;
  return cid === PLATFORM_CORE_DEMO.collectionId;
}

/** Убрать `collection=SS27` из query — канонический путь role→pillar→section. */
export function omitDefaultCollectionSearchParam(searchParams: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString());
  if (isDefaultPlatformCoreCollectionId(next.get('collection'))) {
    next.delete('collection');
  }
  return next;
}

export function platformHomeHref(collectionId?: string): string {
  const cid = collectionId?.trim();
  if (cid && !isDefaultPlatformCoreCollectionId(cid)) {
    return `/platform?collection=${encodeURIComponent(cid)}`;
  }
  return '/platform';
}
