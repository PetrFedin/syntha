import type { PlatformCoreEntityThreadKind } from '@/lib/communications/platform-core-entity-thread-templates';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

export type SavedPlatformCoreEntityThreadTemplate = {
  id: string;
  labelRu: string;
  threadKind: PlatformCoreEntityThreadKind;
  bodyTemplate: string;
  createdAt: string;
};

export const PLATFORM_CORE_ENTITY_THREAD_TEMPLATES_LS_KEY =
  'platform_core_entity_thread_templates_v1';

const MAX_SAVED = 24;

export function interpolateEntityThreadTemplateBody(
  bodyTemplate: string,
  ctx: { orderId?: string; collectionId?: string; articleId?: string; threadKind?: string }
): string {
  return bodyTemplate
    .replace(/\{\{orderId\}\}/g, ctx.orderId ?? '—')
    .replace(/\{\{collectionId\}\}/g, ctx.collectionId ?? '—')
    .replace(/\{\{articleId\}\}/g, ctx.articleId ?? '—')
    .replace(/\{\{threadKind\}\}/g, ctx.threadKind ?? '—');
}

export function readSavedPlatformCoreEntityThreadTemplates(): SavedPlatformCoreEntityThreadTemplate[] {
  if (typeof window === 'undefined') return [];
  if (!shouldUseLocalStorageClientFallbackInCore()) return [];
  try {
    const raw = localStorage.getItem(PLATFORM_CORE_ENTITY_THREAD_TEMPLATES_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is SavedPlatformCoreEntityThreadTemplate =>
        Boolean(row) &&
        typeof row === 'object' &&
        typeof (row as SavedPlatformCoreEntityThreadTemplate).id === 'string' &&
        typeof (row as SavedPlatformCoreEntityThreadTemplate).labelRu === 'string' &&
        typeof (row as SavedPlatformCoreEntityThreadTemplate).bodyTemplate === 'string' &&
        typeof (row as SavedPlatformCoreEntityThreadTemplate).threadKind === 'string'
    );
  } catch {
    return [];
  }
}

export function writeSavedPlatformCoreEntityThreadTemplates(
  templates: SavedPlatformCoreEntityThreadTemplate[]
): void {
  if (typeof window === 'undefined') return;
  if (!shouldMirrorPgClientStoreToLocalStorage()) return;
  try {
    localStorage.setItem(
      PLATFORM_CORE_ENTITY_THREAD_TEMPLATES_LS_KEY,
      JSON.stringify(templates.slice(0, MAX_SAVED))
    );
  } catch {
    /* ignore quota */
  }
}
