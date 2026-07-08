import type { BrandMaterialPassportCertRow } from '@/lib/fashion/brand-material-passport-certs';

export type BrandMaterialPassportCertsResponse = {
  ok: boolean;
  collectionId?: string;
  rows?: BrandMaterialPassportCertRow[];
  summary?: { total: number; ready: number; blocked: number };
  releaseBlocked?: boolean;
  storageMode?: 'pg' | 'file' | 'memory' | 'demo';
};

export async function fetchBrandMaterialPassportCerts(
  collectionId?: string
): Promise<BrandMaterialPassportCertsResponse> {
  const params = new URLSearchParams();
  if (collectionId?.trim()) params.set('collectionId', collectionId.trim());
  const res = await fetch(`/api/brand/merch/material-passport/certs?${params.toString()}`, {
    cache: 'no-store',
  });
  const json = (await res.json()) as BrandMaterialPassportCertsResponse;
  if (!res.ok || !json.ok) {
    return { ok: false, rows: [], summary: { total: 0, ready: 0, blocked: 0 } };
  }
  return json;
}

export async function patchBrandMaterialPassportCertReady(input: {
  collectionId: string;
  sku: string;
  certReady: boolean;
}): Promise<BrandMaterialPassportCertsResponse> {
  const res = await fetch('/api/brand/merch/material-passport/certs', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as BrandMaterialPassportCertsResponse & {
    row?: BrandMaterialPassportCertRow;
  };
  if (!res.ok || !json.ok) {
    return { ok: false };
  }
  return json;
}
