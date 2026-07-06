import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { Workshop2SketchPinTemplate } from '@/lib/production/workshop2-dossier-phase1.types';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  readOrgSketchPinTemplatesSync,
  type SketchOrgPinTemplateRepository,
} from '@/lib/production/sketch-org-templates-repository';

export async function fetchOrgSketchPinTemplatesRemote(
  collectionId: string
): Promise<{ templates: Workshop2SketchPinTemplate[]; storageMode: string }> {
  const cid = collectionId.trim();
  if (!cid) return { templates: [], storageMode: 'empty' };
  if (!isPlatformCoreMode()) {
    return { templates: readOrgSketchPinTemplatesSync(cid), storageMode: 'local' };
  }
  try {
    const res = await fetch(
      `/api/brand/sketch-org-templates?collectionId=${encodeURIComponent(cid)}`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    );
    const json = (await res.json()) as {
      templates?: Workshop2SketchPinTemplate[];
      storageMode?: string;
    };
    if (!res.ok) {
      return {
        templates: isPlatformCoreMode() ? [] : readOrgSketchPinTemplatesSync(cid),
        storageMode: 'unavailable',
      };
    }
    return { templates: json.templates ?? [], storageMode: json.storageMode ?? 'postgres' };
  } catch {
    return {
      templates: isPlatformCoreMode() ? [] : readOrgSketchPinTemplatesSync(cid),
      storageMode: 'unavailable',
    };
  }
}

export async function replaceOrgSketchPinTemplatesRemote(
  collectionId: string,
  templates: Workshop2SketchPinTemplate[]
): Promise<boolean> {
  const cid = collectionId.trim();
  if (!cid) return false;
  if (!isPlatformCoreMode()) return false;
  try {
    const res = await fetch('/api/brand/sketch-org-templates', {
      method: 'PUT',
      headers: {
        ...buildWorkshop2ApiRequestHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionId: cid, templates }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

class ApiSketchOrgPinTemplateRepository implements SketchOrgPinTemplateRepository {
  async list(collectionId: string): Promise<Workshop2SketchPinTemplate[]> {
    const { templates } = await fetchOrgSketchPinTemplatesRemote(collectionId);
    return templates;
  }

  async replaceAll(collectionId: string, items: Workshop2SketchPinTemplate[]): Promise<void> {
    await replaceOrgSketchPinTemplatesRemote(collectionId, items);
  }
}

let apiRepo: ApiSketchOrgPinTemplateRepository | null = null;

export function getApiSketchOrgPinTemplateRepository(): SketchOrgPinTemplateRepository {
  if (!apiRepo) apiRepo = new ApiSketchOrgPinTemplateRepository();
  return apiRepo;
}
