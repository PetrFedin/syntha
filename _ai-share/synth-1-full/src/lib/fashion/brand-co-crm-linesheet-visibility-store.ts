import type { BrandCoCrmLinesheetVisibilityRow } from '@/lib/b2b/brand-co-crm-linesheet-visibility';
import { BRAND_CO_CRM_LINESHEET_VISIBILITY_API } from '@/lib/b2b/brand-co-crm-wave-xb';

export type BrandCoCrmLinesheetVisibilityResponse = {
  ok: boolean;
  collectionId?: string;
  rows?: BrandCoCrmLinesheetVisibilityRow[];
  summary?: { total: number; autoVisible: number; gated: number };
  storageMode?: 'pg' | 'file' | 'memory' | 'demo';
  messageRu?: string;
};

export async function fetchBrandCoCrmLinesheetVisibility(
  collectionId?: string
): Promise<BrandCoCrmLinesheetVisibilityResponse> {
  const params = new URLSearchParams();
  if (collectionId?.trim()) params.set('collectionId', collectionId.trim());
  const res = await fetch(`${BRAND_CO_CRM_LINESHEET_VISIBILITY_API}?${params.toString()}`, {
    cache: 'no-store',
  });
  const json = (await res.json()) as BrandCoCrmLinesheetVisibilityResponse;
  if (!res.ok || !json.ok) {
    return { ok: false, rows: [], summary: { total: 0, autoVisible: 0, gated: 0 } };
  }
  return json;
}
