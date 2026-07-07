/**
 * Единый источник демо-данных для Центра управления (без API).
 * Цифры в шапке, алертах и карточках согласованы отсюда.
 */

/** Количество участников в команде (шапка + карточка «Команда») */
export const PARTICIPANTS_COUNT = 24;

/** Сейчас онлайн (шапка) */
export const ONLINE_COUNT = 8;

/** Истекающие сертификаты — начальное состояние для «Требует внимания» */
export const INITIAL_CERTIFICATES = [
  { id: 'c1', name: 'ISO 9001:2015', daysLeft: 14 },
  { id: 'c2', name: 'ISO 14001:2015', daysLeft: 21 },
] as const;

/** Незаполненные данные профиля */
export const INITIAL_PROFILE = [
  { id: 'p1', name: 'Brand DNA', detail: '75% заполнено' },
  { id: 'p2', name: 'Keywords', detail: 'Не указаны' },
  { id: 'p3', name: 'Target Audience', detail: 'Не указана' },
] as const;

/** Задачи без исполнителя */
export const INITIAL_TASKS = [
  { id: 't1', title: 'Согласовать заказ ЦУМ', priority: 'высокий' },
  { id: 't2', title: 'Обновить размерную сетку', priority: 'средний' },
] as const;

/** Сбои интеграций (пусто = системы в норме); в API — `{ id, message }[]`, legacy — строки. */
export const INITIAL_INTEGRATION_ISSUES: readonly { id: string; message: string }[] = [];

/** Начальное состояние алертов для useAttentionAlerts */
export function getInitialAlertsState() {
  return {
    certificates: [...INITIAL_CERTIFICATES],
    profile: [...INITIAL_PROFILE],
    tasks: [...INITIAL_TASKS],
    integrationIssues: [...INITIAL_INTEGRATION_ISSUES],
  };
}
