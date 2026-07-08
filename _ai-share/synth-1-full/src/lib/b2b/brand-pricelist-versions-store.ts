import type { BrandPricelistVersionRow } from '@/lib/b2b/brand-pricelist-versions-feed';
import type { BrandPricelistPublishResult } from '@/lib/b2b/brand-pricelist-publish';

export type BrandPricelistVersionsResponse = {
  ok: boolean;
  collectionId?: string;
  rows?: BrandPricelistVersionRow[];
  summary?: {
    total: number;
    active: number;
    channels: number;
    pgSourced: number;
  };
  storageMode?: 'pg' | 'file' | 'memory' | 'demo';
};

export async function fetchBrandPricelistVersions(
  collectionId?: string
): Promise<BrandPricelistVersionsResponse> {
  const params = new URLSearchParams();
  if (collectionId?.trim()) params.set('collectionId', collectionId.trim());
  const res = await fetch(`/api/brand/b2b/pricelist/versions?${params.toString()}`, {
    cache: 'no-store',
  });
  const json = (await res.json()) as BrandPricelistVersionsResponse;
  if (!res.ok || !json.ok) {
    return {
      ok: false,
      rows: [],
      summary: { total: 0, active: 0, channels: 0, pgSourced: 0 },
    };
  }
  return json;
}

export async function patchBrandPricelistVersion(input: {
  collectionId: string;
  id: string;
  multiplier?: number;
  validTo?: string;
}): Promise<BrandPricelistVersionsResponse & { row?: BrandPricelistVersionRow }> {
  const res = await fetch('/api/brand/b2b/pricelist/versions', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as BrandPricelistVersionsResponse & {
    row?: BrandPricelistVersionRow;
  };
  if (!res.ok || !json.ok) return { ok: false };
  return json;
}

export async function refreshBrandPricelistVersions(
  collectionId: string
): Promise<BrandPricelistVersionsResponse> {
  const res = await fetch('/api/brand/b2b/pricelist/versions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionId }),
  });
  const json = (await res.json()) as BrandPricelistVersionsResponse;
  if (!res.ok || !json.ok) return { ok: false };
  return json;
}

export async function publishBrandPricelist(input: {
  collectionId: string;
  id: string;
  syncTierToShop?: boolean;
}): Promise<BrandPricelistPublishResult & { pricelist?: BrandPricelistVersionRow }> {
  const res = await fetch('/api/brand/b2b/pricelist/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as BrandPricelistPublishResult & {
    pricelist?: BrandPricelistVersionRow;
    error?: { messageRu?: string };
  };
  if (!res.ok || !json.ok) {
    return {
      ok: false,
      messageRu: json.error?.messageRu ?? json.messageRu,
    };
  }
  return json;
}
