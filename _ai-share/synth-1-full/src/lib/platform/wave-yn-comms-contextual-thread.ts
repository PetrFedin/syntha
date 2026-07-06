/**
 * Wave YN — brand/shop comms contextual POST from tracking/calendar/order card + RU labels.
 */

export const WAVE_YN_ORDER_CHAT_RU = 'Чат заказа';
export const WAVE_YN_ORDER_CHAT_SHORT_RU = 'Чат';
export const WAVE_YN_OPEN_MESSAGES_RU = 'Открыть сообщения';
export const WAVE_YN_CHAT_TAB_RU = 'Вкладка чата';
export const WAVE_YN_BRAND_CHAT_RU = 'Чат с брендом';
export const WAVE_YN_SHOP_CHAT_RU = 'Чат магазина';
export const WAVE_YN_PLACEHOLDER_SUBTITLE_RU = 'Начните переписку по заказу';

export type CommsContextualThreadSource = 'tracking' | 'calendar' | 'order-card';

export const WAVE_YN_CONTEXTUAL_THREAD_LINK_TESTID = 'comms-contextual-thread-link';

export function waveYnContextualThreadSectionId(source: CommsContextualThreadSource): string {
  return `wave-yn-${source}`;
}
