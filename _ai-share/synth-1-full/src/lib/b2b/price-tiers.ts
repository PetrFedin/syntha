/**
 * SparkLayer: ценовые уровни (Retail A / B / Outlet) в данных.
 * Разные цены в матрице и каталоге в зависимости от уровня партнёра.
 * Связь с партнёром, минималка по заказу/бренду — в правилах.
 */

export type PriceTierId = 'retail_a' | 'retail_b' | 'outlet';

export const PRICE_TIER_LABELS: Record<PriceTierId, string> = {
  retail_a: 'Retail A',
  retail_b: 'Retail B',
  outlet: 'Outlet',
};

const PRICE_TIER_IDS: PriceTierId[] = ['retail_a', 'retail_b', 'outlet'];

/** Map CRM segment tier string → canonical PriceTierId (null if unknown). */
export function parsePriceTierId(value: string | null | undefined): PriceTierId | null {
  const normalized = String(value ?? '').trim() as PriceTierId;
  return PRICE_TIER_IDS.includes(normalized) ? normalized : null;
}

/** Множитель к базовой оптовой цене по уровню. При API — с бэкенда по партнёру. */
const TIER_MULTIPLIER: Record<PriceTierId, number> = {
  retail_a: 1,
  retail_b: 0.96,
  outlet: 0.7,
};

/** Цена по уровню (базовая оптовая × множитель). */
export function getPriceForTier(basePrice: number, tier: PriceTierId): number {
  return Math.round(basePrice * TIER_MULTIPLIER[tier]);
}

/** Текущий ценовой уровень текущего партнёра. Мок: из localStorage или default retail_b. */
export function getCurrentPriceTier(): PriceTierId {
  if (typeof window === 'undefined') return 'retail_b';
  const stored = window.localStorage?.getItem('b2b_price_tier') as PriceTierId | null;
  return stored && PRICE_TIER_LABELS[stored] ? stored : 'retail_b';
}

export function setCurrentPriceTier(tier: PriceTierId): void {
  if (typeof window !== 'undefined') window.localStorage?.setItem('b2b_price_tier', tier);
}
