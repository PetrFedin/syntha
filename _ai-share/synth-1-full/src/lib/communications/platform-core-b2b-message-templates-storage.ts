import type { PlatformCoreB2bMessageTemplateContext } from '@/lib/communications/platform-core-b2b-message-templates';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

export type SavedPlatformCoreB2bMessageTemplate = {
  id: string;
  labelRu: string;
  context: PlatformCoreB2bMessageTemplateContext;
  bodyTemplate: string;
  createdAt: string;
};

export const PLATFORM_CORE_B2B_MESSAGE_TEMPLATES_LS_KEY = 'platform_core_b2b_message_templates_v1';

const MAX_SAVED = 24;

export function interpolateB2bMessageTemplateBody(
  bodyTemplate: string,
  ctx: { orderId?: string; collectionId?: string; articleId?: string }
): string {
  return bodyTemplate
    .replace(/\{\{orderId\}\}/g, ctx.orderId ?? '—')
    .replace(/\{\{collectionId\}\}/g, ctx.collectionId ?? '—')
    .replace(/\{\{articleId\}\}/g, ctx.articleId ?? '—');
}

export function readSavedPlatformCoreB2bMessageTemplates(): SavedPlatformCoreB2bMessageTemplate[] {
  if (typeof window === 'undefined') return [];
  if (!shouldUseLocalStorageClientFallbackInCore()) return [];
  try {
    const raw = localStorage.getItem(PLATFORM_CORE_B2B_MESSAGE_TEMPLATES_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is SavedPlatformCoreB2bMessageTemplate =>
        Boolean(row) &&
        typeof row === 'object' &&
        typeof (row as SavedPlatformCoreB2bMessageTemplate).id === 'string' &&
        typeof (row as SavedPlatformCoreB2bMessageTemplate).labelRu === 'string' &&
        typeof (row as SavedPlatformCoreB2bMessageTemplate).bodyTemplate === 'string' &&
        ((row as SavedPlatformCoreB2bMessageTemplate).context === 'b2b_order' ||
          (row as SavedPlatformCoreB2bMessageTemplate).context === 'workshop2_article')
    );
  } catch {
    return [];
  }
}

function writeSavedPlatformCoreB2bMessageTemplates(
  rows: SavedPlatformCoreB2bMessageTemplate[]
): void {
  if (typeof window === 'undefined') return;
  if (!shouldMirrorPgClientStoreToLocalStorage()) return;
  try {
    localStorage.setItem(
      PLATFORM_CORE_B2B_MESSAGE_TEMPLATES_LS_KEY,
      JSON.stringify(rows.slice(0, MAX_SAVED))
    );
  } catch {
    /* quota */
  }
}

export function savePlatformCoreB2bMessageTemplate(input: {
  labelRu: string;
  context: PlatformCoreB2bMessageTemplateContext;
  bodyTemplate: string;
}): SavedPlatformCoreB2bMessageTemplate | null {
  const labelRu = input.labelRu.trim();
  const bodyTemplate = input.bodyTemplate.trim();
  if (!labelRu || !bodyTemplate) return null;

  const entry: SavedPlatformCoreB2bMessageTemplate = {
    id: `custom-${Date.now()}`,
    labelRu: labelRu.slice(0, 48),
    context: input.context,
    bodyTemplate: bodyTemplate.slice(0, 2000),
    createdAt: new Date().toISOString(),
  };

  const rows = readSavedPlatformCoreB2bMessageTemplates();
  rows.unshift(entry);
  writeSavedPlatformCoreB2bMessageTemplates(rows);
  return entry;
}

export function deletePlatformCoreB2bMessageTemplate(id: string): void {
  const rows = readSavedPlatformCoreB2bMessageTemplates().filter((row) => row.id !== id);
  writeSavedPlatformCoreB2bMessageTemplates(rows);
}

export function listSavedPlatformCoreB2bMessageTemplates(
  context: PlatformCoreB2bMessageTemplateContext
): SavedPlatformCoreB2bMessageTemplate[] {
  return readSavedPlatformCoreB2bMessageTemplates().filter((row) => row.context === context);
}
