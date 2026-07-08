import type {
  BrandWssiCapacityFeedRow,
  BrandWssiMixFeedRow,
} from '@/lib/fashion/brand-wssi-otb-feed';

export type BrandWssiOtbResponse = {
  ok: boolean;
  collectionId?: string;
  mix?: BrandWssiMixFeedRow[];
  capacity?: BrandWssiCapacityFeedRow[];
  mixSummary?: {
    categories: number;
    overAssorted: number;
    underAssorted: number;
    pgSourced: number;
  };
  storageMode?: 'pg' | 'file' | 'memory' | 'demo';
};

export async function fetchBrandWssiOtb(collectionId?: string): Promise<BrandWssiOtbResponse> {
  const params = new URLSearchParams();
  if (collectionId?.trim()) params.set('collectionId', collectionId.trim());
  const res = await fetch(`/api/brand/merch/wssi-otb?${params.toString()}`, { cache: 'no-store' });
  const json = (await res.json()) as BrandWssiOtbResponse;
  if (!res.ok || !json.ok) {
    return {
      ok: false,
      mix: [],
      capacity: [],
      mixSummary: { categories: 0, overAssorted: 0, underAssorted: 0, pgSourced: 0 },
    };
  }
  return json;
}

export async function patchBrandWssiMixTarget(input: {
  collectionId: string;
  category: string;
  targetPct: number;
}): Promise<BrandWssiOtbResponse & { row?: BrandWssiMixFeedRow }> {
  const res = await fetch('/api/brand/merch/wssi-otb', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as BrandWssiOtbResponse & { row?: BrandWssiMixFeedRow };
  if (!res.ok || !json.ok) return { ok: false };
  return json;
}

export async function refreshBrandWssiOtb(collectionId: string): Promise<BrandWssiOtbResponse> {
  const res = await fetch('/api/brand/merch/wssi-otb', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionId }),
  });
  const json = (await res.json()) as BrandWssiOtbResponse;
  if (!res.ok || !json.ok) return { ok: false };
  return json;
}
