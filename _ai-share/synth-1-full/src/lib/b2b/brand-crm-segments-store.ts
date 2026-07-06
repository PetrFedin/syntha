import type { BrandCrmSegmentObject } from '@/lib/b2b/brand-crm-segment-object';

export async function fetchBrandCrmSegments(): Promise<{
  segments: BrandCrmSegmentObject[];
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
}> {
  const res = await fetch('/api/brand/b2b/crm-segments', { cache: 'no-store' });
  const json = (await res.json()) as {
    ok?: boolean;
    segments?: BrandCrmSegmentObject[];
    storageMode?: 'pg' | 'file' | 'memory' | 'demo';
  };
  if (!res.ok || !json.ok) {
    return { segments: [], storageMode: 'demo' };
  }
  return {
    segments: json.segments ?? [],
    storageMode: json.storageMode ?? 'demo',
  };
}

export async function patchBrandCrmSegment(input: {
  segmentKey: string;
  defaultNetTermDays?: number;
  firstOrderDiscountPct?: number | null;
}): Promise<{
  ok: boolean;
  segments: BrandCrmSegmentObject[];
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
}> {
  const res = await fetch('/api/brand/b2b/crm-segments', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    segments?: BrandCrmSegmentObject[];
    storageMode?: 'pg' | 'file' | 'memory' | 'demo';
  };
  if (!res.ok || !json.ok) {
    return { ok: false, segments: [], storageMode: 'demo' };
  }
  return {
    ok: true,
    segments: json.segments ?? [],
    storageMode: json.storageMode ?? 'demo',
  };
}

export async function reorderBrandCrmSegments(segmentKeys: string[]): Promise<{
  ok: boolean;
  segments: BrandCrmSegmentObject[];
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
}> {
  const res = await fetch('/api/brand/b2b/crm-segments', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reorderSegmentKeys: segmentKeys }),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    segments?: BrandCrmSegmentObject[];
    storageMode?: 'pg' | 'file' | 'memory' | 'demo';
  };
  if (!res.ok || !json.ok) {
    return { ok: false, segments: [], storageMode: 'demo' };
  }
  return {
    ok: true,
    segments: json.segments ?? [],
    storageMode: json.storageMode ?? 'demo',
  };
}
