import type { PlatformCoreB2bMessageTemplateContext } from '@/lib/communications/platform-core-b2b-message-templates';
import type { SavedPlatformCoreB2bMessageTemplate } from '@/lib/communications/platform-core-b2b-message-templates-storage';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

export async function fetchPlatformCoreB2bMessageTemplates(input: {
  context: PlatformCoreB2bMessageTemplateContext;
  ownerKey?: string;
}): Promise<{ templates: SavedPlatformCoreB2bMessageTemplate[]; storageMode: string }> {
  if (!isPlatformCoreMode()) {
    return { templates: [], storageMode: 'local' };
  }
  const params = new URLSearchParams({ context: input.context });
  if (input.ownerKey?.trim()) params.set('ownerKey', input.ownerKey.trim());
  const res = await fetch(`/api/platform-core/b2b/message-templates?${params}`, {
    headers: buildWorkshop2ApiRequestHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return { templates: [], storageMode: 'error' };
  const json = (await res.json()) as {
    templates?: SavedPlatformCoreB2bMessageTemplate[];
    storageMode?: string;
  };
  return {
    templates: json.templates ?? [],
    storageMode: json.storageMode ?? 'unknown',
  };
}

export async function savePlatformCoreB2bMessageTemplateRemote(input: {
  labelRu: string;
  context: PlatformCoreB2bMessageTemplateContext;
  bodyTemplate: string;
  ownerKey?: string;
}): Promise<SavedPlatformCoreB2bMessageTemplate | null> {
  const res = await fetch('/api/platform-core/b2b/message-templates', {
    method: 'POST',
    headers: {
      ...buildWorkshop2ApiRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { template?: SavedPlatformCoreB2bMessageTemplate };
  return json.template ?? null;
}

export async function deletePlatformCoreB2bMessageTemplateRemote(input: {
  id: string;
  ownerKey?: string;
}): Promise<boolean> {
  const params = new URLSearchParams({ id: input.id });
  if (input.ownerKey?.trim()) params.set('ownerKey', input.ownerKey.trim());
  const res = await fetch(`/api/platform-core/b2b/message-templates?${params}`, {
    method: 'DELETE',
    headers: buildWorkshop2ApiRequestHeaders(),
  });
  return res.ok;
}
