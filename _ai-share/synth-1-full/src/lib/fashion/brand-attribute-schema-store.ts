import type {
  BrandAttributeSchemaFeedRow,
  BrandSizeChartGradeFeedRow,
} from '@/lib/fashion/brand-attribute-schema-feed';
import type { BrandSizeChartGradeState } from '@/lib/fashion/brand-size-chart-grade';

export async function fetchBrandAttributeSchemaFeed(collectionId: string): Promise<{
  ok: boolean;
  schemas?: BrandAttributeSchemaFeedRow[];
  schemaSummary?: { total: number; weak: number; leafCount: number; pgSourced: number };
  storageMode?: string;
}> {
  const res = await fetch(
    `/api/brand/merch/attribute-schema?collectionId=${encodeURIComponent(collectionId)}&kind=schemas`,
    { cache: 'no-store' }
  );
  const json = (await res.json()) as {
    ok?: boolean;
    schemas?: BrandAttributeSchemaFeedRow[];
    schemaSummary?: { total: number; weak: number; leafCount: number; pgSourced: number };
    storageMode?: string;
  };
  if (!res.ok || !json.ok) return { ok: false, schemas: [] };
  return { ok: true, ...json };
}

export async function fetchBrandSizeChartGradeFeed(collectionId: string): Promise<{
  ok: boolean;
  rows?: BrandSizeChartGradeFeedRow[];
  summary?: { total: number; ready: number; partial: number; empty: number; pgSourced: number };
  storageMode?: string;
}> {
  const res = await fetch(
    `/api/brand/merch/attribute-schema?collectionId=${encodeURIComponent(collectionId)}&kind=size-chart`,
    { cache: 'no-store' }
  );
  const json = (await res.json()) as {
    ok?: boolean;
    rows?: BrandSizeChartGradeFeedRow[];
    summary?: { total: number; ready: number; partial: number; empty: number; pgSourced: number };
    storageMode?: string;
  };
  if (!res.ok || !json.ok) return { ok: false, rows: [] };
  return { ok: true, ...json };
}

export async function patchBrandSizeChartGradeFeed(input: {
  collectionId: string;
  sku: string;
  gradeState: BrandSizeChartGradeState;
}): Promise<{
  ok: boolean;
  rows?: BrandSizeChartGradeFeedRow[];
  summary?: { total: number; ready: number; partial: number; empty: number; pgSourced: number };
  storageMode?: string;
}> {
  const res = await fetch('/api/brand/merch/attribute-schema', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    rows?: BrandSizeChartGradeFeedRow[];
    summary?: { total: number; ready: number; partial: number; empty: number; pgSourced: number };
    storageMode?: string;
  };
  if (!res.ok || !json.ok) return { ok: false };
  return { ok: true, ...json };
}

export async function refreshBrandAttributeSchemaFeed(
  collectionId: string
): Promise<{ ok: boolean }> {
  const res = await fetch('/api/brand/merch/attribute-schema', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionId }),
  });
  const json = (await res.json()) as { ok?: boolean };
  return { ok: Boolean(res.ok && json.ok) };
}
