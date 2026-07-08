import type { PriceList } from '@/lib/b2b/price-lists';
import type { PriceTierId } from '@/lib/b2b/price-tiers';
import type { CustomerGroupId } from '@/lib/b2b/customer-groups';

export type BrandPricelistVersionsStorageMode = 'pg' | 'file' | 'memory' | 'demo';

export type BrandPricelistVersionRow = PriceList & {
  collectionId: string;
  source: 'pg' | 'seed';
};

export const BRAND_PRICELIST_VERSION_SEED: Omit<PriceList, 'id' | 'createdAt'>[] = [
  {
    name: 'Retail B −4% Q1',
    channel: 'retail_b',
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
    type: 'multiplier',
    multiplier: 0.96,
  },
  {
    name: 'Outlet акция −5%',
    channel: 'outlet',
    validFrom: '2025-02-01',
    validTo: '2025-02-28',
    type: 'multiplier',
    multiplier: 0.95,
  },
  {
    name: 'Retail A base',
    channel: 'retail_a',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    type: 'multiplier',
    multiplier: 1,
  },
];

export function buildBrandPricelistVersionSeedRows(
  collectionId: string
): BrandPricelistVersionRow[] {
  return BRAND_PRICELIST_VERSION_SEED.map((seed, index) => ({
    ...seed,
    id: `pl-${seed.channel}-${index}`,
    createdAt: new Date().toISOString(),
    collectionId,
    source: 'seed' as const,
  }));
}

export function filterBrandPricelistVersions(
  rows: readonly BrandPricelistVersionRow[],
  groupId?: string | null
): BrandPricelistVersionRow[] {
  if (!groupId?.trim()) return [...rows];
  return rows.filter((row) => row.customerGroupIds?.includes(groupId as CustomerGroupId));
}

export function summarizeBrandPricelistVersionRows(rows: readonly BrandPricelistVersionRow[]): {
  total: number;
  active: number;
  channels: number;
  pgSourced: number;
} {
  const today = new Date().toISOString().slice(0, 10);
  const active = rows.filter((pl) => pl.validFrom <= today && pl.validTo >= today).length;
  const channels = new Set(rows.map((pl) => pl.channel)).size;
  return {
    total: rows.length,
    active,
    channels,
    pgSourced: rows.filter((row) => row.source === 'pg').length,
  };
}

export function brandPricelistChannelLabel(channel: PriceTierId): string {
  return channel;
}

export type BrandPricelistVersionDiffField = {
  field: string;
  baseValue: string;
  targetValue: string;
  changed: boolean;
};

export function isBrandPricelistVersionActive(
  row: BrandPricelistVersionRow,
  asOfDate?: string
): boolean {
  const today = asOfDate ?? new Date().toISOString().slice(0, 10);
  return row.validFrom <= today && row.validTo >= today;
}

/** Default pair: active (or first) vs same-channel alternate (or next row). */
export function pickDefaultBrandPricelistVersionDiffPair(
  rows: readonly BrandPricelistVersionRow[],
  asOfDate?: string
): { baseId: string; targetId: string } | null {
  if (rows.length < 2) return null;
  const base = rows.find((row) => isBrandPricelistVersionActive(row, asOfDate)) ?? rows[0]!;
  const sameChannel = rows.find((row) => row.id !== base.id && row.channel === base.channel);
  const target = sameChannel ?? rows.find((row) => row.id !== base.id) ?? rows[1]!;
  return { baseId: base.id, targetId: target.id };
}

export function buildBrandPricelistVersionDiffFields(
  base: BrandPricelistVersionRow,
  target: BrandPricelistVersionRow
): BrandPricelistVersionDiffField[] {
  const fmtMult = (m?: number) => (m != null ? String(m) : '—');
  const fmtPeriod = (from: string, to: string) => `${from} – ${to}`;
  const fmtDisc = (m?: number) =>
    m != null && Number.isFinite(m) ? `${((1 - m) * 100).toFixed(1)}%` : '—';

  return [
    {
      field: 'Name',
      baseValue: base.name,
      targetValue: target.name,
      changed: base.name !== target.name,
    },
    {
      field: 'Channel',
      baseValue: brandPricelistChannelLabel(base.channel),
      targetValue: brandPricelistChannelLabel(target.channel),
      changed: base.channel !== target.channel,
    },
    {
      field: 'Period',
      baseValue: fmtPeriod(base.validFrom, base.validTo),
      targetValue: fmtPeriod(target.validFrom, target.validTo),
      changed: base.validFrom !== target.validFrom || base.validTo !== target.validTo,
    },
    {
      field: 'Multiplier',
      baseValue: fmtMult(base.multiplier),
      targetValue: fmtMult(target.multiplier),
      changed: base.multiplier !== target.multiplier,
    },
    {
      field: 'Discount vs base',
      baseValue: fmtDisc(base.multiplier),
      targetValue: fmtDisc(target.multiplier),
      changed: base.multiplier !== target.multiplier,
    },
  ];
}
