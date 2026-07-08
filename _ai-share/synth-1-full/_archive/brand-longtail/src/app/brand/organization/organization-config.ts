/**
 * Конфиг Центра управления (без API).
 * При появлении API BRAND_ID брать из роута/контекста, пороги — из настроек.
 */

export const BRAND_ID = 'syntha-1';

/** Порог «норма» для индекса здоровья (>= это значение = зелёный) */
export const HEALTH_OK = 85;

/** Порог «предупреждение» (>= это значение и < HEALTH_OK = жёлтый) */
export const HEALTH_WARNING = 60;

/** Ключи периодов для активности и модулей */
export const PERIOD_7D = '7d' as const;
export const PERIOD_30D = '30d' as const;

export type PeriodKey = typeof PERIOD_7D | typeof PERIOD_30D;

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  '7d': 'За 7 дн.',
  '30d': 'За 30 дн.',
};
