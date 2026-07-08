/**
 * Демо-полоска «рост по типам» + merge с `dashboard.partnerEcosystem.growthByPeriod`.
 * Вынесено из page-data для узкого read агентами.
 */

/** Рост числа партнёров по периодам (для виджета «Рост за период») */
export const PARTNER_GROWTH_BY_PERIOD: Record<
  '7d' | '30d',
  { total: number; items: { label: string; value: string; href: string }[] }
> = {
  '7d': {
    total: 8,
    items: [
      { label: 'Производства', value: '+1', href: '/brand/factories' },
      { label: 'Поставщики', value: '+2', href: '/brand/materials' },
      { label: 'Магазины', value: '+4', href: '/brand/retailers' },
      { label: 'Дистрибуторы', value: '+1', href: '/brand/distributors' },
    ],
  },
  '30d': {
    total: 22,
    items: [
      { label: 'Производства', value: '+2', href: '/brand/factories' },
      { label: 'Поставщики', value: '+5', href: '/brand/materials' },
      { label: 'Магазины', value: '+12', href: '/brand/retailers' },
      { label: 'Дистрибуторы', value: '+3', href: '/brand/distributors' },
    ],
  },
};

/** Полоска «рост по типам» из dashboard.partnerEcosystem.growthByPeriod */
export type PartnerGrowthSlice = {
  total: number;
  items: { label: string; value: string; href: string }[];
};

export function mergePartnerGrowthSlice(
  periodKey: '7d' | '30d',
  growthByPeriod: unknown
): PartnerGrowthSlice {
  const fallback = PARTNER_GROWTH_BY_PERIOD[periodKey];
  if (!growthByPeriod || typeof growthByPeriod !== 'object') return fallback;
  const slice = (growthByPeriod as Record<string, unknown>)[periodKey];
  if (!slice || typeof slice !== 'object') return fallback;
  const o = slice as Record<string, unknown>;
  const total = Number(o.total);
  const itemsRaw = o.items;
  if (!Number.isFinite(total) || !Array.isArray(itemsRaw)) return fallback;
  const items = itemsRaw
    .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object')
    .map((x) => ({
      label: String(x.label ?? ''),
      value: String(x.value ?? ''),
      href: typeof x.href === 'string' && x.href.length > 0 ? x.href : '#',
    }))
    .filter((x) => x.label.length > 0 && x.value.length > 0);
  if (items.length === 0) return fallback;
  return { total, items };
}
