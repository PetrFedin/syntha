/** Filter slices для вкладки Stock·ATP (Onfinity-style saved views). */

export type ReplenishmentStockSlice = {
  orgId: string;
  seasonId: string;
  collectionId: string;
  labelRu: string;
};

export const REPLENISHMENT_STOCK_SLICE_PRESETS: readonly ReplenishmentStockSlice[] = [
  {
    orgId: 'shop1',
    seasonId: 'SS27',
    collectionId: 'SS27',
    labelRu: 'Магазин 1 · SS27',
  },
  {
    orgId: 'shop1',
    seasonId: 'FW27',
    collectionId: 'FW27',
    labelRu: 'Магазин 1 · FW27',
  },
  {
    orgId: 'shop2',
    seasonId: 'SS27',
    collectionId: 'SS27',
    labelRu: 'Магазин 2 · SS27',
  },
  {
    orgId: 'shop1',
    seasonId: 'all',
    collectionId: 'all',
    labelRu: 'Все сезоны',
  },
];

export const REPLENISHMENT_STOCK_SLICE_PARAMS = {
  org: 'rsOrg',
  season: 'rsSeason',
  collection: 'rsCollection',
} as const;

export function readReplenishmentStockSliceFromSearchParams(sp: {
  get(name: string): string | null;
}): ReplenishmentStockSlice {
  const orgId = sp.get(REPLENISHMENT_STOCK_SLICE_PARAMS.org)?.trim() || 'shop1';
  const seasonId = sp.get(REPLENISHMENT_STOCK_SLICE_PARAMS.season)?.trim() || 'all';
  const collectionId = sp.get(REPLENISHMENT_STOCK_SLICE_PARAMS.collection)?.trim() || 'all';
  const preset = REPLENISHMENT_STOCK_SLICE_PRESETS.find(
    (p) => p.orgId === orgId && p.seasonId === seasonId && p.collectionId === collectionId
  );
  return (
    preset ?? {
      orgId,
      seasonId,
      collectionId,
      labelRu: `${orgId} · ${seasonId}`,
    }
  );
}

export function buildReplenishmentStockSliceHref(
  basePath: string,
  slice: ReplenishmentStockSlice,
  preserve?: URLSearchParams
): string {
  const sp = new URLSearchParams(preserve?.toString() ?? '');
  sp.set(REPLENISHMENT_STOCK_SLICE_PARAMS.org, slice.orgId);
  sp.set(REPLENISHMENT_STOCK_SLICE_PARAMS.season, slice.seasonId);
  sp.set(REPLENISHMENT_STOCK_SLICE_PARAMS.collection, slice.collectionId);
  return `${basePath}?${sp.toString()}`;
}

export function rowMatchesReplenishmentStockSlice(
  row: { seasonTag?: string; orgId?: string },
  slice: ReplenishmentStockSlice
): boolean {
  if (slice.orgId !== 'all' && row.orgId && row.orgId !== slice.orgId) return false;
  if (slice.seasonId !== 'all' && row.seasonTag && row.seasonTag !== slice.seasonId) {
    return false;
  }
  if (slice.collectionId !== 'all' && row.seasonTag && row.seasonTag !== slice.collectionId) {
    return false;
  }
  return true;
}
