'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import {
  LayoutDashboard,
  Package,
  DollarSign,
  BarChart2,
  Handshake,
  Truck,
  CreditCard,
  Users,
  Settings,
  Calendar,
  ListOrdered,
  MessageSquare,
  Calculator,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';

/**
 * Дистрибутор: те же столпы, что у бренда (team → comms → partners → b2b → logistics), без разработки, PIM и производства.
 * Ядро уплотнено: один пункт «Партнёры» (выставки — в подразделах), один реестр заказов с оформлением, одна колонка логистики.
 * См. `BRAND_CORE_GROUP_ORDER`, `DISTRIBUTOR_CORE_GROUP_ORDER`.
 */
export const distributorNavGroups = [
  {
    id: 'team',
    label: 'Команда',
    icon: Users,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.distributor.staff,
        value: 'staff',
        label: 'Команда',
        icon: Users,
        description: 'Сотрудники дистрибутора и доступы',
      },
    ],
  },
  {
    id: 'comms',
    label: 'Связь',
    icon: MessageSquare,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.shop.b2bCalendar,
        value: 'calendar',
        label: 'Календарь',
        icon: Calendar,
        description: 'События и дедлайны',
      },
      {
        href: ROUTES.shop.messages,
        value: 'messages',
        label: 'Сообщения',
        icon: MessageSquare,
        description: 'Коммуникация с брендами',
      },
    ],
  },
  {
    id: 'partners',
    label: 'Партнёры',
    icon: Handshake,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.shop.b2bPartners,
        value: 'partner-funnel',
        label: 'Партнёры',
        icon: Handshake,
        description: 'Бренды, каталог, договоры и документы',
        subsections: [
          { href: ROUTES.shop.b2bPartners, label: 'Портфель брендов', value: 'portfolio' },
          { href: LEGACY_ROUTES.shop.b2bCatalog, label: 'Каталог опта', value: 'catalog' },
          { href: ROUTES.shop.b2bPartnersDiscover, label: 'Поиск брендов', value: 'discover' },
          { href: ROUTES.shop.b2bContracts, label: 'Контракты', value: 'contracts' },
          { href: LEGACY_ROUTES.shop.b2bDocuments, label: 'Документы', value: 'documents' },
          { href: ROUTES.shop.b2bPartnersDiscover, label: 'Подбор брендов', value: 'marketplace' },
          {
            href: LEGACY_ROUTES.shop.b2bTradeShows,
            label: 'Выставки и события',
            value: 'trade-shows',
          },
        ],
      },
    ],
  },
  {
    id: 'b2b',
    label: 'Заказы B2B',
    icon: Package,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.shop.b2bOrders,
        value: 'orders',
        label: 'Заказы B2B',
        icon: ListOrdered,
        description: 'Реестр и оформление заказов — одна колонка ядра.',
        subsections: [
          { href: ROUTES.shop.b2bOrders, label: 'Все заказы', value: 'all' },
          { href: `${ROUTES.shop.b2bOrders}?status=draft`, label: 'Черновики', value: 'draft' },
          {
            href: `${ROUTES.shop.b2bOrders}?status=pending`,
            label: 'На согласовании',
            value: 'pending',
          },
          {
            href: `${ROUTES.shop.b2bOrders}?status=confirmed`,
            label: 'Подтверждённые',
            value: 'confirmed',
          },
          { href: ROUTES.shop.b2bMatrix, label: 'Режим заказа', value: 'order-mode' },
          { href: ROUTES.shop.b2bCreateOrder, label: 'Создать заказ', value: 'create-order' },
          { href: LEGACY_ROUTES.shop.b2bQuickOrder, label: 'Быстрый заказ', value: 'quick-order' },
          { href: LEGACY_ROUTES.shop.b2bReorder, label: 'Повтор заказа', value: 'reorder' },
          { href: ROUTES.shop.b2bOrders, label: 'Черновики (личные)', value: 'order-drafts' },
        ],
      },
    ],
  },
  {
    id: 'logistics',
    label: 'Логистика и остатки',
    icon: Truck,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.shop.b2bTracking,
        value: 'tracking',
        label: 'Логистика и претензии',
        icon: Truck,
        description: 'Отслеживание поставок, автопополнение, RMA — одна колонка.',
        subsections: [
          { href: ROUTES.shop.b2bTracking, label: 'Карта поставок', value: 'tracking' },
          {
            href: LEGACY_ROUTES.shop.b2bReplenishment,
            label: 'Автопополнение',
            value: 'replenishment',
          },
          { href: ROUTES.shop.b2bClaims, label: 'RMA и рекламации', value: 'claims' },
        ],
      },
    ],
  },
  {
    id: 'overview',
    label: 'Обзор',
    icon: LayoutDashboard,
    clusterId: 'archive' as const,
    links: [
      {
        href: '/distributor',
        value: 'dashboard',
        label: 'Дашборд',
        icon: LayoutDashboard,
        description: 'Обзор оптовых продаж',
      },
    ],
  },
  {
    id: 'finance',
    label: 'Финансы',
    icon: DollarSign,
    clusterId: 'archive' as const,
    links: [
      {
        href: ROUTES.shop.b2bFinance,
        value: 'finance',
        label: 'Финансы',
        icon: DollarSign,
        description: 'Оплаты и счета',
      },
      {
        href: ROUTES.shop.b2bBudget,
        value: 'budget',
        label: 'OTB Бюджет',
        icon: CreditCard,
        description: 'Планирование бюджета',
      },
      {
        href: LEGACY_ROUTES.shop.b2bPayment,
        value: 'payment',
        label: 'Оплата заказов',
        icon: CreditCard,
        description: 'Инвойсы и этапы оплаты',
      },
      {
        href: LEGACY_ROUTES.shop.b2bMarginCalculator,
        value: 'margin-calculator',
        label: 'Калькулятор маржи',
        icon: Calculator,
        description: 'Маржа в корзине',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    icon: BarChart2,
    clusterId: 'archive' as const,
    links: [
      {
        href: ROUTES.shop.analytics,
        value: 'analytics',
        label: 'Аналитика',
        icon: BarChart2,
        description: 'Отчёты и метрики',
      },
      {
        href: LEGACY_ROUTES.shop.b2bAnalytics,
        value: 'b2b-analytics',
        label: 'Закупки B2B',
        icon: BarChart2,
        description: 'Аналитика закупок',
      },
      {
        href: ROUTES.shop.b2bOrderAnalytics,
        value: 'order-analytics',
        label: 'Аналитика заказов',
        icon: BarChart2,
        description: 'Топ стилей, тренды',
      },
    ],
  },
  {
    id: 'management-rest',
    label: 'Команда и настройки',
    icon: Settings,
    clusterId: 'archive' as const,
    links: [
      {
        href: ROUTES.shop.b2bSettings,
        value: 'settings',
        label: 'Настройки',
        icon: Settings,
        description: 'Настройки дистрибьютора',
      },
    ],
  },
];
