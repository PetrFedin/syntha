import type { PlatformCoreEntityThreadKind } from '@/lib/communications/platform-core-entity-thread-templates';
import type { SavedPlatformCoreEntityThreadTemplate } from '@/lib/communications/platform-core-entity-thread-templates-storage';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

export async function fetchPlatformCoreEntityThreadTemplates(input: {
  threadKind?: PlatformCoreEntityThreadKind;
  ownerKey?: string;
}): Promise<{
  templates: SavedPlatformCoreEntityThreadTemplate[];
  storageMode: string;
  storageModeLabelRu?: string;
}> {
  if (!isPlatformCoreMode()) {
    return { templates: [], storageMode: 'local' };
  }
  const params = new URLSearchParams();
  if (input.threadKind) params.set('threadKind', input.threadKind);
  if (input.ownerKey?.trim()) params.set('ownerKey', input.ownerKey.trim());
  const qs = params.toString();
  const res = await fetch(
    `/api/platform-core/comms/entity-thread-templates${qs ? `?${qs}` : ''}`,
    {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    }
  );
  if (!res.ok) return { templates: [], storageMode: 'error' };
  const json = (await res.json()) as {
    templates?: SavedPlatformCoreEntityThreadTemplate[];
    storageMode?: string;
    storageModeLabelRu?: string;
  };
  return {
    templates: json.templates ?? [],
    storageMode: json.storageMode ?? 'unknown',
    storageModeLabelRu: json.storageModeLabelRu,
  };
}

export async function savePlatformCoreEntityThreadTemplateRemote(input: {
  labelRu: string;
  threadKind: PlatformCoreEntityThreadKind;
  bodyTemplate: string;
  ownerKey?: string;
}): Promise<SavedPlatformCoreEntityThreadTemplate | null> {
  const res = await fetch('/api/platform-core/comms/entity-thread-templates', {
    method: 'POST',
    headers: {
      ...buildWorkshop2ApiRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { template?: SavedPlatformCoreEntityThreadTemplate };
  return json.template ?? null;
}

export async function deletePlatformCoreEntityThreadTemplateRemote(input: {
  id: string;
  ownerKey?: string;
}): Promise<boolean> {
  const params = new URLSearchParams({ id: input.id });
  if (input.ownerKey?.trim()) params.set('ownerKey', input.ownerKey.trim());
  const res = await fetch(`/api/platform-core/comms/entity-thread-templates?${params}`, {
    method: 'DELETE',
    headers: buildWorkshop2ApiRequestHeaders(),
  });
  return res.ok;
}
