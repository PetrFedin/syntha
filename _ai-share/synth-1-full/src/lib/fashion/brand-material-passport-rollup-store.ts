import type { BrandMaterialPassportRollupRow } from '@/lib/fashion/brand-material-passport-rollup';

export type BrandMaterialPassportRollupResponse = {
  ok: boolean;
  collectionId?: string;
  rows?: BrandMaterialPassportRollupRow[];
  summary?: {
    total: number;
    withComposition: number;
    dossierSourced: number;
    pgSourced: number;
  };
  storageMode?: 'pg' | 'file' | 'memory' | 'demo';
  dossierLinked?: boolean;
};

export async function fetchBrandMaterialPassportRollup(
  collectionId?: string
): Promise<BrandMaterialPassportRollupResponse> {
  const params = new URLSearchParams();
  if (collectionId?.trim()) params.set('collectionId', collectionId.trim());
  const res = await fetch(`/api/brand/merch/material-passport/rollup?${params.toString()}`, {
    cache: 'no-store',
  });
  const json = (await res.json()) as BrandMaterialPassportRollupResponse;
  if (!res.ok || !json.ok) {
    return {
      ok: false,
      rows: [],
      summary: { total: 0, withComposition: 0, dossierSourced: 0, pgSourced: 0 },
    };
  }
  return json;
}

export async function refreshBrandMaterialPassportRollup(
  collectionId: string
): Promise<BrandMaterialPassportRollupResponse> {
  const res = await fetch('/api/brand/merch/material-passport/rollup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionId }),
  });
  const json = (await res.json()) as BrandMaterialPassportRollupResponse;
  if (!res.ok || !json.ok) {
    return { ok: false };
  }
  return json;
}
