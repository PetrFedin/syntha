/**
 * Wave WZ — final RU noise trim + hub pillar card dedup (all roles, compact/core).
 */

export const WAVE_WZ_BRAND_SC_GOLDEN_PATH_RELEASE_GATE_RU = 'Проверка релиза';
export const WAVE_WZ_BRAND_SC_RETAIL_SYNDICATION_RU = 'Синдикация';
export const WAVE_WZ_BRAND_SC_RETAIL_PLATFORM_RU = 'B2B-платформа';
export const WAVE_WZ_BRAND_DEV_CO_LINESHEETS_RU = 'Лайншиты';
export const WAVE_WZ_BRAND_DEV_CO_SHOWROOM_RU = 'Витрина магазина';

export const WAVE_WZ_OP_MFR_SUBTITLE_RU = 'Очередь PO и WIP по оптовому заказу.';
export const WAVE_WZ_OP_NO_ORDER_RU =
  'Нет активного оптового заказа — шаги после подтверждения и передачи.';

export const WAVE_WZ_CO_SPINE_CONFIRM_SLA_RU = 'Внешний канал · ожидает подтверждения';

export const WAVE_WZ_SHOP_OP_WIP_BADGE_PREFIX_RU = 'В производстве ·';
export const WAVE_WZ_SHOP_ETA_HANDOFF_HINT_RU = 'Срок доставки после передачи — см. трекинг';
export const WAVE_WZ_SHOP_ETA_PREFIX_RU = 'Срок ·';

export const WAVE_WZ_COMMS_CHAIN_PUSH_COMPACT_RU = 'Push статуса цепочки';
export const WAVE_WZ_COMMS_CHAIN_PUSH_FULL_RU = 'Push при смене статуса цепочки';

export const WAVE_WZ_SUP_EMPTY_CO_CHECKOUT_RU =
  'Ожидание оптового заказа в spine — откройте SS27 после оформления магазина.';

export const WAVE_WZ_BRAND_SC_RETAIL_PEER_STRIP_TESTID = 'brand-sc-cabinet-retail-peer-strip';
export const WAVE_WZ_BRAND_DEV_CO_PEER_STRIP_TESTID = 'brand-dev-cabinet-co-peer-strip';
export const WAVE_WZ_SHOP_CO_SPINE_PEER_STRIP_TESTID = 'shop-co-cabinet-co-spine-peer-strip';

const SAMPLE_STATUS_RU: Record<string, string> = {
  draft: 'Черновик',
  sent: 'Отправлен',
  in_progress: 'В работе',
  dispatched: 'Отправлен в цех',
  ready: 'Готов',
  approved: 'Одобрен',
  received: 'Получен',
  queued: 'В очереди',
  pending: 'Ожидает',
  cancelled: 'Отменён',
};

/** Map W2/sample queue status codes to RU labels for hub pillar badges. */
export function formatPlatformCoreSampleStatusLabelRu(status: string | null | undefined): string {
  const raw = status?.trim() ?? '';
  if (!raw) return '';
  const mapped = SAMPLE_STATUS_RU[raw.toLowerCase()];
  return mapped ?? raw;
}
