import type { ElementType } from 'react';
import {
  BarChart2,
  User,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Palette,
  Shirt,
  Calendar,
  Scale,
  Trophy,
  CreditCard,
  Rocket,
  Truck,
  MessageSquare,
  Users,
  Briefcase,
  TrendingDown,
  Settings,
} from 'lucide-react';

/** Верхний уровень навигации профиля клиента (4–5 групп). */
export type ClientMeMainGroup = 'hub' | 'account' | 'style' | 'commerce' | 'analytics';

/** Листовой раздел — значение `?tab=` в URL. */
export type ClientMeSectionId =
  | 'dashboard'
  | 'profile'
  | 'settings'
  | 'achievements'
  | 'referrals'
  | 'career'
  | 'smart-wardrobe'
  | 'looks'
  | 'wardrobe'
  | 'calendar'
  | 'comparisons'
  | 'preorders'
  | 'payments'
  | 'tracking'
  | 'reviews'
  | 'price-alerts'
  | 'analytics';

const ALL_SECTIONS = new Set<string>([
  'dashboard',
  'profile',
  'settings',
  'achievements',
  'referrals',
  'career',
  'smart-wardrobe',
  'looks',
  'wardrobe',
  'calendar',
  'comparisons',
  'preorders',
  'payments',
  'tracking',
  'reviews',
  'price-alerts',
  'analytics',
]);

export function parseClientMeTabParam(tab: string | null): ClientMeSectionId {
  const v = tab?.trim() || 'dashboard';
  if (ALL_SECTIONS.has(v)) return v as ClientMeSectionId;
  return 'dashboard';
}

export function sectionToGroup(section: ClientMeSectionId): ClientMeMainGroup {
  switch (section) {
    case 'dashboard':
      return 'hub';
    case 'profile':
    case 'settings':
    case 'achievements':
    case 'referrals':
    case 'career':
      return 'account';
    case 'smart-wardrobe':
    case 'looks':
    case 'wardrobe':
    case 'calendar':
    case 'comparisons':
      return 'style';
    case 'preorders':
    case 'payments':
    case 'tracking':
    case 'reviews':
    case 'price-alerts':
      return 'commerce';
    case 'analytics':
      return 'analytics';
    default:
      return 'hub';
  }
}

export const GROUP_DEFAULT_SECTION: Record<ClientMeMainGroup, ClientMeSectionId> = {
  hub: 'dashboard',
  account: 'profile',
  style: 'smart-wardrobe',
  commerce: 'preorders',
  analytics: 'analytics',
};

export const MAIN_GROUP_ORDER: ClientMeMainGroup[] = [
  'hub',
  'account',
  'style',
  'commerce',
  'analytics',
];

export const MAIN_GROUP_META: Record<
  ClientMeMainGroup,
  { label: string; icon: ElementType<{ className?: string }>; iconColor?: string }
> = {
  hub: { label: 'Обзор', icon: BarChart2 },
  account: { label: 'Профиль и аккаунт', icon: User },
  style: { label: 'Стиль и гардероб', icon: Sparkles, iconColor: 'text-accent-primary' },
  commerce: { label: 'Покупки и сервис', icon: ShoppingBag },
  analytics: { label: 'Аналитика', icon: TrendingUp },
};

export type ClientMeSubTabItem = {
  value: ClientMeSectionId;
  icon: ElementType<{ className?: string }>;
  label: string;
  count?: number;
  badgeVariant?: 'default' | 'secondary';
  iconColor?: string;
};

export function getSubTabsForGroup(
  group: ClientMeMainGroup,
  counts: {
    looks: number;
    wardrobe: number;
    preorders: number;
    comparisons: number;
    achievements: number;
    payments: number;
  }
): ClientMeSubTabItem[] | null {
  switch (group) {
    case 'hub':
    case 'analytics':
      return null;
    case 'account':
      return [
        { value: 'profile', icon: User, label: 'Профиль' },
        { value: 'settings', icon: Settings, label: 'Настройки' },
        { value: 'achievements', icon: Trophy, label: 'Достижения', count: counts.achievements },
        { value: 'referrals', icon: Users, label: 'Контакты' },
        { value: 'career', icon: Briefcase, label: 'Карьера' },
      ];
    case 'style':
      return [
        {
          value: 'smart-wardrobe',
          icon: Sparkles,
          label: 'ИИ-гардероб',
          iconColor: 'text-accent-primary',
        },
        { value: 'looks', icon: Palette, label: 'Образы', count: counts.looks },
        { value: 'wardrobe', icon: Shirt, label: 'Гардероб', count: counts.wardrobe },
        { value: 'calendar', icon: Calendar, label: 'Планер' },
        { value: 'comparisons', icon: Scale, label: 'Сравнения', count: counts.comparisons },
      ];
    case 'commerce':
      return [
        { value: 'preorders', icon: Rocket, label: 'Предзаказы', count: counts.preorders },
        {
          value: 'payments',
          icon: CreditCard,
          label: 'Финансы',
          count: counts.payments,
          badgeVariant: 'default' as const,
        },
        { value: 'tracking', icon: Truck, label: 'Логистика' },
        { value: 'reviews', icon: MessageSquare, label: 'Отзывы' },
        { value: 'price-alerts', icon: TrendingDown, label: 'Рынок' },
      ];
    default:
      return null;
  }
}
