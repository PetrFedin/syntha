import type { BrandPackRulesFeedRow } from '@/lib/fashion/brand-pack-rules-feed';

export type BrandPackRulesFeedResponse = {
  ok: boolean;
  collectionId?: string;
  rows?: BrandPackRulesFeedRow[];
  summary?: {
    total: number;
    withMoq: number;
    withCasePack: number;
    pgSourced: number;
  };
  storageMode?: 'pg' | 'file' | 'memory' | 'demo';
};

export async function fetchBrandPackRules(
  collectionId?: string
): Promise<BrandPackRulesFeedResponse> {
  const params = new URLSearchParams();
  if (collectionId?.trim()) params.set('collectionId', collectionId.trim());
  const res = await fetch(`/api/brand/merch/pack-rules?${params.toString()}`, {
    cache: 'no-store',
  });
  const json = (await res.json()) as BrandPackRulesFeedResponse;
  if (!res.ok || !json.ok) {
    return {
      ok: false,
      rows: [],
      summary: { total: 0, withMoq: 0, withCasePack: 0, pgSourced: 0 },
    };
  }
  return json;
}

export async function patchBrandPackRules(input: {
  collectionId: string;
  sku: string;
  moq?: number | null;
  casePack?: number | null;
}): Promise<BrandPackRulesFeedResponse & { row?: BrandPackRulesFeedRow }> {
  const res = await fetch('/api/brand/merch/pack-rules', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as BrandPackRulesFeedResponse & { row?: BrandPackRulesFeedRow };
  if (!res.ok || !json.ok) return { ok: false };
  return json;
}

export async function refreshBrandPackRules(
  collectionId: string
): Promise<BrandPackRulesFeedResponse> {
  const res = await fetch('/api/brand/merch/pack-rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionId }),
  });
  const json = (await res.json()) as BrandPackRulesFeedResponse;
  if (!res.ok || !json.ok) return { ok: false };
  return json;
}
