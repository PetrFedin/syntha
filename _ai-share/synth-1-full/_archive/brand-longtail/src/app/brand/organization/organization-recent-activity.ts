/**
 * Демо-лента «Недавняя активность», участники фильтра, команда для метрик здоровья.
 */

import { Building2, Users, Zap, ShieldCheck, CreditCard, UserCircle2, Cpu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type RecentActivity = {
  user: string;
  action: string;
  time: string;
  type: 'profile' | 'team' | 'integration' | 'security' | 'billing';
  icon: LucideIcon;
  participantId: string;
  /** ISO date for period filtering */
  dateStr: string;
};

/** Базовые события без даты; dayOffset = 0 сегодня, -1 вчера и т.д. */
const RECENT_ACTIVITIES_BASE: (Omit<RecentActivity, 'dateStr'> & { dayOffset: number })[] = [
  {
    user: 'Анна К.',
    action: 'Обновила юридический адрес компании',
    time: '5 мин назад',
    type: 'profile',
    icon: Building2,
    participantId: 'anna',
    dayOffset: 0,
  },
  {
    user: 'Игорь Д.',
    action: 'Добавил нового сотрудника (CFO)',
    time: '12 мин назад',
    type: 'team',
    icon: Users,
    participantId: 'igor',
    dayOffset: 0,
  },
  {
    user: 'Мария С.',
    action: 'Подключила интеграцию с 1C:Предприятие',
    time: '25 мин назад',
    type: 'integration',
    icon: Zap,
    participantId: 'maria',
    dayOffset: 0,
  },
  {
    user: 'Петр В.',
    action: 'Включил двухфакторную аутентификацию',
    time: '1ч назад',
    type: 'security',
    icon: ShieldCheck,
    participantId: 'petr',
    dayOffset: 0,
  },
  {
    user: 'Система',
    action: 'Автоматическое продление подписки Elite',
    time: '2ч назад',
    type: 'billing',
    icon: CreditCard,
    participantId: 'system',
    dayOffset: 0,
  },
  {
    user: 'Анна К.',
    action: 'Загрузила логотип бренда',
    time: 'вчера',
    type: 'profile',
    icon: Building2,
    participantId: 'anna',
    dayOffset: -1,
  },
  {
    user: 'Игорь Д.',
    action: 'Создал задачу по интеграции',
    time: '2 дня назад',
    type: 'team',
    icon: Users,
    participantId: 'igor',
    dayOffset: -2,
  },
  {
    user: 'Мария С.',
    action: 'Экспорт в 1С выполнен успешно',
    time: '3 дня назад',
    type: 'integration',
    icon: Zap,
    participantId: 'maria',
    dayOffset: -3,
  },
  {
    user: 'Петр В.',
    action: 'Настроил 2FA для команды',
    time: '4 дня назад',
    type: 'security',
    icon: ShieldCheck,
    participantId: 'petr',
    dayOffset: -4,
  },
  {
    user: 'Анна К.',
    action: 'Обновила контакты в профиле',
    time: '5 дней назад',
    type: 'profile',
    icon: Building2,
    participantId: 'anna',
    dayOffset: -5,
  },
  {
    user: 'Система',
    action: 'Еженедельный отчёт по маркировке отправлен в ЭДО',
    time: '6 дней назад',
    type: 'billing',
    icon: CreditCard,
    participantId: 'system',
    dayOffset: -6,
  },
  {
    user: 'Игорь Д.',
    action: 'Согласовал доступ роли Finance к складским данным',
    time: '8 дней назад',
    type: 'team',
    icon: Users,
    participantId: 'igor',
    dayOffset: -8,
  },
  {
    user: 'Мария С.',
    action: 'Обновила маппинг номенклатуры для выгрузки в маркетплейс',
    time: '10 дней назад',
    type: 'integration',
    icon: Zap,
    participantId: 'maria',
    dayOffset: -10,
  },
  {
    user: 'Петр В.',
    action: 'Провёл ротацию API-ключей интеграций',
    time: '14 дней назад',
    type: 'security',
    icon: ShieldCheck,
    participantId: 'petr',
    dayOffset: -14,
  },
  {
    user: 'Анна К.',
    action: 'Уточнила условия договора с производственным партнёром',
    time: '18 дней назад',
    type: 'profile',
    icon: Building2,
    participantId: 'anna',
    dayOffset: -18,
  },
  {
    user: 'Система',
    action: 'Начисление по тарифу Elite за прошлый цикл',
    time: '27 дней назад',
    type: 'billing',
    icon: CreditCard,
    participantId: 'system',
    dayOffset: -27,
  },
];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Активность с датами относительно переданного «сегодня» — при выборе 7/30 дней события попадают в период */
export function getRecentActivities(relativeTo: Date = new Date()): RecentActivity[] {
  return RECENT_ACTIVITIES_BASE.map((a) => {
    const d = new Date(relativeTo);
    d.setDate(d.getDate() + a.dayOffset);
    const { dayOffset: _dayOffset, ...rest } = a;
    return { ...rest, dateStr: toDateStr(d) };
  });
}

/** Для обратной совместимости: активность относительно текущей даты (один раз при импорте не подойдёт, используйте getRecentActivities в компоненте) */
export const RECENT_ACTIVITIES: RecentActivity[] = getRecentActivities(new Date());

/** Team members for Health Index metric assignment */
export const HEALTH_METRIC_TEAM = [
  { id: 'anna', label: 'Анна К.', role: 'CEO' },
  { id: 'igor', label: 'Игорь Д.', role: 'CFO' },
  { id: 'maria', label: 'Мария С.', role: 'CTO' },
  { id: 'petr', label: 'Петр В.', role: 'Security' },
  { id: 'olga', label: 'Ольга С.', role: 'HR' },
  { id: 'dmitry', label: 'Дмитрий К.', role: 'Operations' },
];

/** Unique participants for activity filter - icons for buttons, label in tooltip */
export const ACTIVITY_PARTICIPANTS = [
  { id: 'all', label: 'Все', Icon: Users },
  { id: 'anna', label: 'Анна К.', Icon: UserCircle2, initials: 'А' },
  { id: 'igor', label: 'Игорь Д.', Icon: UserCircle2, initials: 'И' },
  { id: 'maria', label: 'Мария С.', Icon: UserCircle2, initials: 'М' },
  { id: 'petr', label: 'Петр В.', Icon: UserCircle2, initials: 'П' },
  { id: 'system', label: 'Система', Icon: Cpu },
];
