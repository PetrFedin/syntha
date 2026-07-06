/**
 * Brand CRM segment object — persisted query + tier terms (Onfinity BP parity).
 */
export type BrandCrmSegmentQuery = {
  minLifetimeOrderRub?: number;
  tiers?: string[];
  regions?: string[];
  tags?: string[];
  matchMode?: 'all' | 'any';
};

export type BrandCrmSegmentObject = {
  id: string;
  segmentKey: string;
  nameRu: string;
  customerGroupId?: string;
  query: BrandCrmSegmentQuery;
  defaultPriceTier: string;
  defaultNetTermDays: number;
  firstOrderDiscountPct?: number;
  vatExempt: boolean;
  /** Lower = earlier in showroom / assign UI. */
  displayOrder?: number;
  updatedAt: string;
};

export function sortBrandCrmSegments(
  segments: readonly BrandCrmSegmentObject[]
): BrandCrmSegmentObject[] {
  return [...segments].sort((a, b) => {
    const ao = a.displayOrder ?? 999;
    const bo = b.displayOrder ?? 999;
    if (ao !== bo) return ao - bo;
    return a.segmentKey.localeCompare(b.segmentKey);
  });
}

export function summarizeBrandCrmSegmentQuery(query: BrandCrmSegmentQuery): string[] {
  const chips: string[] = [];
  if (query.minLifetimeOrderRub != null && query.minLifetimeOrderRub > 0) {
    chips.push(`≥ ${query.minLifetimeOrderRub.toLocaleString('ru-RU')} ₽ LTV`);
  }
  if (query.tiers?.length) chips.push(`tier: ${query.tiers.join(', ')}`);
  if (query.regions?.length) chips.push(`region: ${query.regions.join(', ')}`);
  if (query.tags?.length) chips.push(`tags: ${query.tags.join(', ')}`);
  if (query.matchMode === 'any') chips.push('match: any');
  return chips;
}

export function evaluateBrandCrmSegmentQuery(
  query: BrandCrmSegmentQuery,
  account: {
    lifetimeOrderRub?: number;
    tier?: string;
    region?: string;
    tags?: string[];
  }
): boolean {
  const checks: boolean[] = [];
  if (query.minLifetimeOrderRub != null && query.minLifetimeOrderRub > 0) {
    checks.push((account.lifetimeOrderRub ?? 0) >= query.minLifetimeOrderRub);
  }
  if (query.tiers?.length) {
    checks.push(query.tiers.includes(account.tier ?? ''));
  }
  if (query.regions?.length) {
    checks.push(query.regions.includes(account.region ?? ''));
  }
  if (query.tags?.length) {
    const tags = new Set(account.tags ?? []);
    checks.push(
      query.matchMode === 'any'
        ? query.tags.some((t) => tags.has(t))
        : query.tags.every((t) => tags.has(t))
    );
  }
  if (!checks.length) return true;
  return query.matchMode === 'any' ? checks.some(Boolean) : checks.every(Boolean);
}
