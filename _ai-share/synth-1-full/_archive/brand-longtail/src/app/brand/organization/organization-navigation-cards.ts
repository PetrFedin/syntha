/**
 * Карточки модулей хаба «Организация» + merge с `brand/dashboard.moduleStats`.
 */

import { Building2, Users, Settings, Zap, CreditCard, ShieldCheck, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const NAVIGATION_CARDS = [
  {
    title: 'Профиль бренда',
    description: 'Юридические данные, контакты, Brand DNA, история и ценности.',
    icon: Building2,
    href: '/brand',
    color: 'text-accent-primary',
    bg: 'bg-accent-primary/10',
    stats: { label: 'Заполнено', value: '92%', status: 'success' as const },
    changePct7d: 2,
    changePct30d: -1,
    addHref: '/brand',
    addLabel: 'Редактировать',
  },
  {
    title: 'Команда',
    description: 'Сотрудники, роли, права, активность, задачи и коллаборация.',
    icon: Users,
    href: '/brand/team',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    stats: { label: 'Участников', value: '24', status: 'active' as const },
    changePct7d: 5,
    changePct30d: 12,
    addHref: '/brand/team?action=invite',
    addLabel: 'Добавить',
  },
  {
    title: 'Документооборот',
    description: 'Договоры, акты, спецификации, ЭДО и генератор документов.',
    icon: FileText,
    href: '/brand/documents',
    color: 'text-accent-primary',
    bg: 'bg-accent-primary/10',
    stats: { label: 'На подписи', value: '2', status: 'warning' as const },
    changePct7d: -3,
    changePct30d: 2,
    addHref: '/brand/documents?action=new',
    addLabel: 'Добавить',
  },
  {
    title: 'Интеграции',
    description: 'Маркетплейсы (WB, Ozon), ERP, логистика, webhooks, SSO.',
    icon: Zap,
    href: '/brand/integrations',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    stats: { label: 'Активно', value: '3/13', status: 'warning' as const },
    changePct7d: 0,
    changePct30d: 5,
    addHref: '/brand/integrations',
    addLabel: 'Подключить',
  },
  {
    title: 'Подписка и биллинг',
    description: 'Тариф, лимиты, история платежей и способы оплаты.',
    icon: CreditCard,
    href: '/brand/subscription',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    stats: { label: 'План', value: 'Elite', status: 'success' as const },
    changePct7d: 0,
    changePct30d: 0,
  },
  {
    title: 'Безопасность',
    description: '2FA, API ключи, активные сессии, журнал аудита.',
    icon: ShieldCheck,
    href: '/brand/security',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    stats: { label: 'Оценка', value: '88/100', status: 'success' as const },
    changePct7d: 1,
    changePct30d: 3,
    addHref: '/brand/security',
    addLabel: 'Настроить',
  },
  {
    title: 'Настройки',
    description: 'Локализация, уведомления, каналы продаж, налоги.',
    icon: Settings,
    href: '/brand/settings',
    color: 'text-text-secondary',
    bg: 'bg-bg-surface2',
    stats: { label: 'Конфигурация', value: 'OK', status: 'success' as const },
    changePct7d: 0,
    changePct30d: 1,
    addHref: '/brand/settings',
    addLabel: 'Открыть',
  },
  {
    title: 'ЭДО и маркировка',
    description: 'Честный ЗНАК, маркировка, синхронизация КИЗ со складом.',
    icon: ShieldCheck,
    href: '/brand/compliance',
    color: 'text-accent-primary',
    bg: 'bg-accent-primary/10',
    stats: { label: 'Статус', value: 'Настроено', status: 'success' as const },
    changePct7d: 4,
    changePct30d: 8,
    addHref: '/brand/compliance',
    addLabel: 'Настроить',
  },
];

export type NavigationCardStatStatus = 'success' | 'warning' | 'active';

export type ModuleStatPatch = Partial<{
  label: string;
  value: string;
  status: NavigationCardStatStatus;
}>;

/** Карточка раздела после возможной подстановки полей из API */
export type NavigationModuleCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bg: string;
  stats: { label: string; value: string; status: NavigationCardStatStatus };
  changePct7d: number;
  changePct30d: number;
  addHref?: string;
  addLabel?: string;
};

/** Подстановка label/value/status карточек модулей из ответа brand/dashboard (`moduleStats`). */
export function mergeNavigationCardsWithModuleStats(
  patchByHref: Record<string, ModuleStatPatch> | null | undefined
): NavigationModuleCard[] {
  if (!patchByHref || typeof patchByHref !== 'object')
    return NAVIGATION_CARDS as unknown as NavigationModuleCard[];
  return NAVIGATION_CARDS.map((card) => {
    const p = patchByHref[card.href];
    if (!p) return card as unknown as NavigationModuleCard;
    return {
      ...card,
      stats: {
        ...card.stats,
        ...(p.label !== undefined ? { label: p.label } : {}),
        ...(p.value !== undefined ? { value: p.value } : {}),
        ...(p.status !== undefined ? { status: p.status } : {}),
      },
    };
  }) as NavigationModuleCard[];
}
