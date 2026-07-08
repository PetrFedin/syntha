'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { ROUTES } from '@/lib/routes';
import type { LucideIcon } from 'lucide-react';
import {
  Handshake,
  BarChart2,
  MessageSquare,
  Users,
  Edit,
  FileText,
  Percent,
  RefreshCcw,
  Calendar,
  Sigma,
  Star,
  DollarSign,
  BookText,
  Store,
  TrendingUp,
  Target,
  Building2,
  CreditCard,
  ShoppingBag,
  PlusCircle,
  Zap,
  LayoutGrid,
  Calculator,
  Map,
  Search,
  ShieldAlert,
  Camera,
  LayoutDashboard,
  ShoppingCart,
  Package,
  ListOrdered,
  Settings,
  Truck,
  UserPlus,
  CalendarDays,
  Ruler,
  Layers,
  UserCircle,
  Gavel,
  Sparkles,
  Network,
  Database,
} from 'lucide-react';
import {
  SYNTHA_SIDEBAR_CLUSTERS,
  SHOP_CORE_GROUP_ORDER,
  SHOP_ARCHIVE_GROUP_ORDER,
  sortNavGroupsByOrder,
} from './syntha-nav-clusters';

/**
 * Навигация кабинета ритейлера: блоки без дублирования ссылок.
 * — Обзор → розница → склад сети → закупка у брендов → исполнение опта → сервис закупки → аналитика → сеть и доступы.
 * — Отслеживание поставок — в блоке исполнения (рядом с поставками и сроками), не в «Сети».
 * — Тендеры и котировки — отдельно от опта у бренда; учёт в складе; бюджет закупок — в сети.
 * — `/shop/b2b` → редирект на `/shop`.
 * — У пунктов меню опционально `navTier: 'phase2'` — скрываются при `NEXT_PUBLIC_SHOP_NAV_MVP=1`.
 * — Группа `comms` (Связь: сообщения + календарь) — тот же `id`, что у дистрибутора и factory; см. `CROSS_ROLE_FLOWS.md`.
 * — Ядро как у бренда: team → comms → partners → pim → b2b → logistics (`SHOP_CORE_GROUP_ORDER`); прочий опт — `shop-b2b-extended` и др. в архиве.
 * — Плотность ядра: матрица заказа — подпункт каталога; создание заказа — подпункт реестра; склад и поставки B2B — одна колонка с подразделами.
 */

export const SHOP_NAV_CLUSTERS = SYNTHA_SIDEBAR_CLUSTERS;

export const shopNavGroups = [
  {
    id: 'team',
    label: 'Команда',
    icon: Users,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.shop.staff,
        value: 'staff',
        label: 'Команда',
        icon: Users,
        description: 'Сотрудники магазина, роли и доступы',
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
        href: ROUTES.shop.messages,
        value: 'messages',
        label: 'Сообщения',
        icon: MessageSquare,
        description: 'Коммуникация с брендами',
      },
      {
        href: `${ROUTES.shop.calendar}?layers=orders,logistics`,
        value: 'calendar',
        label: 'Календарь',
        icon: Calendar,
        description:
          'События по заказам B2B, поставкам и дедлайнам сети (слои orders + logistics по умолчанию).',
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
        href: ROUTES.shop.home,
        value: 'dashboard',
        label: 'Сводка',
        icon: LayoutDashboard,
        description: 'Ключевые показатели магазина',
      },
    ],
  },
  {
    id: 'retail-ops',
    label: 'Розница',
    icon: ShoppingCart,
    clusterId: 'archive' as const,
    links: [
      {
        href: ROUTES.shop.orders,
        value: 'orders',
        label: 'Заказы клиентов',
        icon: ShoppingCart,
        description: 'Розничные заказы',
        subsections: [
          { href: ROUTES.shop.orders, label: 'Все заказы', value: 'all' },
          { href: `${ROUTES.shop.orders}?status=pending`, label: 'В обработке', value: 'pending' },
          { href: `${ROUTES.shop.orders}?status=shipped`, label: 'Отправлено', value: 'shipped' },
          {
            href: `${ROUTES.shop.orders}?status=completed`,
            label: 'Завершено',
            value: 'completed',
          },
        ],
      },
      {
        href: ROUTES.shop.bopis,
        value: 'omni-customer-fulfillment',
        label: 'Выдача и отгрузка',
        icon: Truck,
        description: 'Самовывоз, заказ с полки, между магазинами, отправка из точки',
        subsections: [
          { href: ROUTES.shop.bopis, label: 'Самовывоз из магазина', value: 'bopis' },
          {
            href: ROUTES.shop.endlessAisle,
            label: 'С полки и между магазинами',
            value: 'endless-aisle',
          },
          {
            href: ROUTES.shop.shipFromStore,
            label: 'Отправка из магазина',
            value: 'ship-from-store',
          },
        ],
      },
      {
        href: ROUTES.shop.promotions,
        value: 'promotions',
        label: 'Акции и скидки',
        icon: Percent,
        description: 'Промо и скидки',
      },
      {
        href: ROUTES.shop.clienteling,
        value: 'clienteling',
        label: 'Клиенты и лояльность',
        icon: Users,
        description: 'Персональные продажи и база клиентов',
      },
      {
        href: ROUTES.shop.stylistTablet,
        value: 'stylist-tablet',
        label: 'Планшет стилиста',
        icon: LayoutGrid,
        description: 'Сборка образа из каталога на планшете продавца',
        navTier: 'phase2' as const,
      },
      {
        href: ROUTES.shop.bnpl,
        value: 'bnpl',
        label: 'Рассрочка на кассе',
        icon: CreditCard,
        description: 'Рассрочка и оплата частями (банки-партнёры)',
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
        description: 'Бренды, заявки, договоры и документы',
        subsections: [
          { href: LEGACY_ROUTES.shop.b2bDiscover, label: 'Поиск брендов', value: 'discover' },
          { href: LEGACY_ROUTES.shop.b2bApply, label: 'Заявка на доступ', value: 'apply' },
          { href: ROUTES.shop.b2bPartners, label: 'Портфель', value: 'portfolio' },
          { href: ROUTES.shop.b2bContracts, label: 'Договоры', value: 'contracts' },
          { href: LEGACY_ROUTES.shop.b2bDocuments, label: 'Документы', value: 'documents' },
          { href: ROUTES.shop.b2bRating, label: 'Рейтинг брендов', value: 'rating' },
        ],
      },
    ],
  },
  {
    id: 'pim',
    label: 'Товар',
    icon: Database,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: LEGACY_ROUTES.shop.b2bCatalog,
        value: 'b2b-catalog',
        label: 'Каталог опта',
        icon: Package,
        description:
          'Ассортимент у брендов; матрица быстрого заказа — тот же столбец, отдельной строки в сайдбаре нет.',
        subsections: [
          {
            href: ROUTES.shop.b2bMatrix,
            label: 'Матрица заказа',
            value: 'matrix',
          },
        ],
      },
      {
        href: ROUTES.shop.b2bCollectionTerms,
        value: 'collection-planning',
        label: 'Коллекции и план',
        icon: Calendar,
        description: 'Условия, сроки, план отбора',
        subsections: [
          {
            href: ROUTES.shop.b2bCollectionTerms,
            label: 'Условия и сроки',
            value: 'collection-terms',
          },
          {
            href: LEGACY_ROUTES.shop.b2bAssortmentPlanning,
            label: 'План ассортимента',
            value: 'assortment-planning',
          },
          {
            href: LEGACY_ROUTES.shop.b2bSelectionBuilder,
            label: 'Отбор коллекции',
            value: 'selection-builder',
          },
        ],
      },
      {
        href: ROUTES.shop.b2bShowroom,
        value: 'showroom-suite',
        label: 'Шоурум и презентации',
        icon: Store,
        description: 'Витрина коллекций',
        subsections: [
          { href: ROUTES.shop.b2bShowroom, label: 'Шоурум', value: 'showroom' },
          {
            href: LEGACY_ROUTES.shop.b2bVideoConsultation,
            label: 'Видеосвязь',
            value: 'video-consultation',
          },
        ],
      },
    ],
  },
  {
    id: 'b2b',
    label: 'Заказы B2B',
    icon: ShoppingCart,
    clusterId: 'syntha-cores' as const,
    links: [
      {
        href: ROUTES.shop.b2bOrders,
        value: 'b2b-orders',
        label: 'Заказы B2B',
        icon: ListOrdered,
        description:
          'Реестр опта и цепочка оформления: мастер, быстрый заказ, черновики — без второй строки в ядре.',
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
          { href: `${ROUTES.shop.b2bOrders}?status=shipped`, label: 'В пути', value: 'shipped' },
          { href: LEGACY_ROUTES.shop.b2bOrderMode, label: 'Режим заказа', value: 'order-mode' },
          { href: ROUTES.shop.b2bCreateOrder, label: 'Мастер заказа', value: 'create-order' },
          { href: LEGACY_ROUTES.shop.b2bQuickOrder, label: 'Быстрый заказ', value: 'quick-order' },
          { href: LEGACY_ROUTES.shop.b2bOrderDrafts, label: 'Черновики (личные)', value: 'order-drafts' },
          { href: LEGACY_ROUTES.shop.b2bOrderTemplates, label: 'Шаблоны', value: 'order-templates' },
          { href: LEGACY_ROUTES.shop.b2bReorder, label: 'Повтор заказа', value: 'reorder' },
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
        href: ROUTES.shop.inventory,
        value: 'inventory',
        label: 'Склад и поставки B2B',
        icon: Truck,
        description:
          'Остатки сети и исполнение опта: сроки, отслеживание, календарь поставок — одна колонка ядра.',
        subsections: [
          { href: ROUTES.shop.inventory, label: 'Текущие остатки', value: 'current' },
          { href: ROUTES.shop.inventoryArchive, label: 'Архив остатков', value: 'inv-archive' },
          {
            href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard,
            label: 'Поставки и сроки',
            value: 'fulfillment-dashboard',
          },
          {
            href: LEGACY_ROUTES.shop.b2bDeliveryCalendar,
            label: 'Календарь поставок',
            value: 'delivery-calendar',
          },
          { href: LEGACY_ROUTES.shop.b2bReplenishment, label: 'Автопополнение', value: 'replenishment' },
          { href: ROUTES.shop.b2bTracking, label: 'Отслеживание', value: 'tracking' },
          { href: LEGACY_ROUTES.shop.b2bStockMap, label: 'Остатки по сети', value: 'stock-map' },
        ],
      },
    ],
  },
  {
    id: 'shop-b2b-extended',
    label: 'Опт: дополнительно',
    icon: Building2,
    clusterId: 'archive' as const,
    links: [
      {
        href: LEGACY_ROUTES.shop.b2bTradeShows,
        value: 'trade-events',
        label: 'Выставки и события',
        icon: CalendarDays,
        description: 'Календарь выставок',
        navTier: 'phase2' as const,
      },
      {
        href: LEGACY_ROUTES.shop.b2bWhiteboard,
        value: 'whiteboard',
        label: 'Визуальная доска',
        icon: LayoutGrid,
        description: 'Планирование ассортимента',
        navTier: 'phase2' as const,
      },
      {
        href: LEGACY_ROUTES.shop.b2bPayment,
        value: 'payment',
        label: 'Оплата заказов',
        icon: CreditCard,
        description: 'Счета и этапы оплаты',
      },
      {
        href: ROUTES.shop.b2bMultiCurrency,
        value: 'multi-currency',
        label: 'Валюты и курсы',
        icon: DollarSign,
        description: 'Договорные валюты',
      },
      {
        href: ROUTES.shop.b2bLandedCost,
        value: 'landed-cost',
        label: 'Полная себестоимость',
        icon: Calculator,
        description: 'Landed cost',
      },
      {
        href: ROUTES.shop.b2bClaims,
        value: 'claims',
        label: 'Претензии и возвраты',
        icon: ShieldAlert,
        description: 'Рекламации',
      },
      {
        href: ROUTES.shop.b2bSizeMapping,
        value: 'size-mapping',
        label: 'Соответствие размеров',
        icon: Ruler,
        description: 'Сетки размеров',
      },
      {
        href: LEGACY_ROUTES.shop.b2bTenders,
        value: 'indirect-procurement',
        label: 'Тендеры и RFQ',
        icon: Gavel,
        description: 'Вне опта у бренда',
        navTier: 'phase2' as const,
        subsections: [
          { href: LEGACY_ROUTES.shop.b2bTenders, label: 'Тендеры', value: 'tenders' },
          { href: LEGACY_ROUTES.shop.b2bRfq, label: 'Запрос цен', value: 'rfq' },
          {
            href: ROUTES.shop.b2bSupplierDiscovery,
            label: 'Поставщики',
            value: 'supplier-discovery',
          },
        ],
      },
      {
        href: ROUTES.shop.b2bAiSearch,
        value: 'ai-suite',
        label: 'Умный поиск и заказ',
        icon: Sparkles,
        description: 'ИИ в закупке',
        navTier: 'phase2' as const,
        subsections: [
          { href: ROUTES.shop.b2bAiSearch, label: 'Поиск', value: 'ai-search' },
          { href: LEGACY_ROUTES.shop.b2bAiSmartOrder, label: 'Заказ из текста', value: 'ai-smart-order' },
        ],
      },
      {
        href: ROUTES.shop.b2bScanner,
        value: 'scanner',
        label: 'Сканер',
        icon: Camera,
        description: 'Заказ с пола',
      },
      {
        href: LEGACY_ROUTES.shop.b2bSocialFeed,
        value: 'social-feed',
        label: 'Лента брендов',
        icon: MessageSquare,
        description: 'Новости коллекций',
        navTier: 'phase2' as const,
      },
      {
        href: LEGACY_ROUTES.shop.b2bVipRoomBooking,
        value: 'vip-room-booking',
        label: 'Зал для встреч',
        icon: Store,
        description: 'Бронирование',
      },
      {
        href: ROUTES.shop.cycleCounting,
        value: 'cycle-counting',
        label: 'Инвентаризация по зонам',
        icon: Camera,
        description: 'Быстрый пересчёт',
      },
      {
        href: ROUTES.shop.localInventoryAds,
        value: 'lia',
        label: 'Наличие на картах',
        icon: Map,
        description: 'LIA',
        navTier: 'phase2' as const,
      },
      {
        href: LEGACY_ROUTES.shop.b2bShopifySync,
        value: 'shopify-sync',
        label: 'Учёт и каналы',
        icon: Package,
        description: '1С, каталог',
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
        value: 'retail-analytics',
        label: 'Розница',
        icon: BarChart2,
        description: 'Продажи в магазине и онлайн',
        subsections: [
          { href: ROUTES.shop.analytics, label: 'Продажи и спрос', value: 'retail-analytics' },
          { href: ROUTES.shop.analyticsFootfall, label: 'Трафик по зонам', value: 'footfall' },
        ],
      },
      {
        href: LEGACY_ROUTES.shop.b2bAnalytics,
        value: 'b2b-analytics',
        label: 'Опт',
        icon: Sigma,
        description: 'Закупки у брендов',
        subsections: [
          { href: LEGACY_ROUTES.shop.b2bAnalytics, label: 'Аналитика закупок', value: 'b2b-analytics' },
          { href: ROUTES.shop.b2bOrderAnalytics, label: 'По заказам', value: 'order-analytics' },
          { href: LEGACY_ROUTES.shop.b2bReports, label: 'Отчёты партнёра', value: 'b2b-reports' },
          { href: ROUTES.shop.b2bFinance, label: 'Финансы партнёра', value: 'b2b-finance' },
          { href: LEGACY_ROUTES.shop.b2bPayment, label: 'Оплата заказов', value: 'b2b-payment' },
        ],
      },
      {
        href: LEGACY_ROUTES.shop.b2bMarginAnalysis,
        value: 'margin-suite',
        label: 'Маржа и рентабельность',
        icon: TrendingUp,
        description: 'Маржа, отчёты, калькулятор',
        subsections: [
          { href: LEGACY_ROUTES.shop.b2bMarginAnalysis, label: 'Хаб маржи', value: 'margin-analysis' },
          { href: ROUTES.shop.b2bMarginReport, label: 'По брендам', value: 'margin-report' },
          {
            href: LEGACY_ROUTES.shop.b2bMarginCalculator,
            label: 'Калькулятор',
            value: 'margin-calculator',
          },
          { href: ROUTES.shop.b2bLandedCost, label: 'Landed cost', value: 'landed-cost' },
        ],
      },
    ],
  },
  {
    id: 'management',
    label: 'Сеть и доступы',
    icon: Settings,
    clusterId: 'archive' as const,
    links: [
      {
        href: LEGACY_ROUTES.shop.b2bWorkspaceMap,
        value: 'b2b-workspace-map',
        label: 'Схема процессов опта',
        icon: Map,
        description: 'Модули цепочки — для обучения',
        navTier: 'phase2' as const,
      },
      {
        href: ROUTES.shop.b2bBudget,
        value: 'budget',
        label: 'Бюджет закупок',
        icon: DollarSign,
        description: 'План и факт по сезонам (OTB)',
        subsections: [
          { href: ROUTES.shop.b2bBudget, label: 'Все сезоны', value: 'all' },
          { href: `${ROUTES.shop.b2bBudget}/FW26`, label: 'FW26', value: 'fw26' },
          { href: `${ROUTES.shop.b2bBudget}/SS27`, label: 'SS27', value: 'ss27' },
        ],
      },
      {
        href: ROUTES.shop.b2bPartnerOnboarding,
        value: 'partner-onboarding',
        label: 'Подключение партнёра',
        icon: UserPlus,
        description: 'ИНН, ЭДО, доступ к бренду',
      },
      {
        href: ROUTES.shop.b2bDealerCabinet,
        value: 'dealer-cabinet',
        label: 'Кабинет дилера',
        icon: LayoutDashboard,
        description: 'Документы, отчёты, аналитика',
      },
      {
        href: ROUTES.storeLocator,
        value: 'store-locator',
        label: 'Карта магазинов сети',
        icon: Map,
        description: 'Точки, часы, маршрут',
      },
      {
        href: LEGACY_ROUTES.shop.b2bGamification,
        value: 'gamification',
        label: 'Соревнования и награды',
        icon: Star,
        description: 'Мотивация закупщиков',
        navTier: 'phase2' as const,
      },
      {
        href: ROUTES.brand.b2bOrders,
        value: 'related-cabinets',
        label: 'Связанные кабинеты',
        icon: Network,
        description: 'Те же сценарии в кабинетах бренда, дистрибутора и платформы',
        subsections: [
          { href: ROUTES.brand.b2bOrders, label: 'Заказы опта (бренд)', value: 'brand-b2b-orders' },
          { href: LEGACY_ROUTES.brand.tradeShows, label: 'Выставки (бренд)', value: 'brand-tradeshows' },
          { href: ROUTES.distributor.home, label: 'Дистрибутор', value: 'distributor-home' },
          { href: ROUTES.admin.home, label: 'Админ платформы', value: 'admin-home' },
        ],
      },
      {
        href: ROUTES.shop.b2bSettings,
        value: 'settings',
        label: 'Настройки',
        icon: Settings,
        description: 'Настройки магазина',
      },
    ],
  },
];

/** Группы опта в горизонтальной навигации `/shop/b2b/*` (столпы как у бренда: partners → pim → b2b → logistics). */
export const SHOP_B2B_NAV_GROUP_IDS = ['partners', 'pim', 'b2b', 'logistics'] as const;

/** Карта хаба `/shop/b2b`: розница + ядро опта + расширенные модули + аналитика. */
export const SHOP_B2B_HUB_GROUP_IDS = [
  'retail-ops',
  'partners',
  'pim',
  'b2b',
  'logistics',
  'shop-b2b-extended',
  'analytics',
] as const;

/** Плоская ссылка сайдбара shop с опциональными подпунктами (тип для `getB2bHubTabValue` / подразделов). */
export type ShopNavLinkFlat = {
  href: string;
  value: string;
  label: string;
  description?: string;
  /** Иконка таба в горизонтальной навигации кабинета магазина (есть у пунктов `shopNavGroups`). */
  icon?: LucideIcon;
  subsections?: { href: string; label: string; value: string }[];
};

export const b2bNavLinks = shopNavGroups
  .filter((g) => (SHOP_B2B_NAV_GROUP_IDS as readonly string[]).includes(g.id))
  .flatMap((g) => g.links) as ShopNavLinkFlat[];

/** Горизонтальные вкладки подмакета `/shop/b2b/*` (корень `/shop/b2b` → редирект на `/shop`). */
export const b2bHubTabLinks = [
  { href: ROUTES.shop.b2bPartners, value: 'partner-funnel', label: 'Бренды', icon: Handshake },
  {
    href: ROUTES.shop.b2bCreateOrder,
    value: 'b2b-order-master',
    label: 'Новый заказ',
    icon: PlusCircle,
  },
  { href: ROUTES.shop.b2bMatrix, value: 'matrix', label: 'Матрица', icon: Edit },
  { href: ROUTES.shop.b2bOrders, value: 'b2b-orders', label: 'Заказы опта', icon: ListOrdered },
  { href: LEGACY_ROUTES.shop.b2bPayment, value: 'payment', label: 'Оплата', icon: CreditCard },
  {
    href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard,
    value: 'fulfillment-dashboard',
    label: 'Поставки',
    icon: Truck,
  },
  {
    href: LEGACY_ROUTES.shop.b2bAnalytics,
    value: 'b2b-analytics',
    label: 'Аналитика опта',
    icon: BarChart2,
  },
  { href: ROUTES.shop.b2bAiSearch, value: 'ai-suite', label: 'ИИ-поиск', icon: Sparkles },
  { href: ROUTES.shop.b2bShowroom, value: 'showroom-suite', label: 'Презентация', icon: Store },
  { href: ROUTES.shop.b2bSettings, value: 'settings', label: 'Настройки', icon: Settings },
] as const;

const B2B_HUB_TAB_VALUES = new Set<string>(b2bHubTabLinks.map((l) => l.value));

/** Родительский пункт B2B → вкладка таббара, если страница не входит в `b2bHubTabLinks`. */
const B2B_NAV_VALUE_TO_HUB_TAB: Record<string, string> = {
  'b2b-catalog': 'matrix',
  inventory: 'fulfillment-dashboard',
  'trade-events': 'partner-funnel',
  'collection-planning': 'partner-funnel',
  'margin-suite': 'b2b-analytics',
  whiteboard: 'matrix',
  'landed-cost': 'b2b-orders',
  claims: 'b2b-orders',
  'size-mapping': 'partner-funnel',
  'multi-currency': 'payment',
  'indirect-procurement': 'partner-funnel',
  scanner: 'showroom-suite',
  'social-feed': 'ai-suite',
};

/**
 * Активная вкладка горизонтального таббара B2B по URL (сайдбар B2B + аналитика по `/shop/b2b/*`).
 */
export function getB2bHubTabValue(pathname: string): string {
  const candidates: { href: string; parentValue: string }[] = [];
  const push = (href: string, parentValue: string) => {
    candidates.push({ href, parentValue });
  };
  for (const link of b2bNavLinks) {
    push(link.href, link.value);
    if (link.subsections) {
      for (const sub of link.subsections) {
        push(sub.href, link.value);
      }
    }
  }
  for (const g of shopNavGroups) {
    if (g.id !== 'analytics') continue;
    for (const link of g.links as ShopNavLinkFlat[]) {
      if (!link.href.startsWith('/shop/b2b')) continue;
      push(link.href, link.value);
      if (link.subsections) {
        for (const sub of link.subsections) {
          if (!sub.href.startsWith('/shop/b2b')) continue;
          push(sub.href, link.value);
        }
      }
    }
  }
  candidates.sort((a, b) => b.href.length - a.href.length);
  const hit = candidates.find((c) => pathname.startsWith(c.href));
  if (!hit) return 'partner-funnel';
  if (B2B_HUB_TAB_VALUES.has(hit.parentValue)) return hit.parentValue;
  return B2B_NAV_VALUE_TO_HUB_TAB[hit.parentValue] ?? 'partner-funnel';
}

export const mainShopNavLinks = shopNavGroups
  .flatMap((g) => g.links)
  .filter((link) => typeof link.href === 'string' && link.href.length > 0) as ShopNavLinkFlat[];

/**
 * Активный пункт верхнего уровня кабинета `/shop/*` по URL (включая href из подразделов).
 */
export function getMainShopNavTabValue(pathname: string): string {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  const candidates: { href: string; value: string }[] = [];
  for (const g of shopNavGroups) {
    for (const link of g.links as ShopNavLinkFlat[]) {
      candidates.push({ href: link.href, value: link.value });
      if (link.subsections) {
        for (const sub of link.subsections) {
          candidates.push({ href: sub.href, value: link.value });
        }
      }
    }
  }
  candidates.sort((a, b) => b.href.length - a.href.length);
  const hit = candidates.find((c) => {
    const nh = c.href.replace(/\/$/, '') || '/';
    if (nh === '/shop') return normalizedPath === '/shop';
    return normalizedPath === nh || normalizedPath.startsWith(`${nh}/`);
  });
  return hit?.value ?? 'dashboard';
}

// Helper functions
export function findShopSubsection(sectionValue: string, subsectionValue: string) {
  const section = mainShopNavLinks.find((link) => link.value === sectionValue);
  return section?.subsections?.find((sub) => sub.value === subsectionValue);
}

export function getShopSubsections(sectionValue: string) {
  const section = mainShopNavLinks.find((link) => link.value === sectionValue);
  return section?.subsections || [];
}

export type ShopNavDisplayMode = 'full' | 'mvp';

/** Режим `mvp`: скрыть пункты с `navTier: 'phase2'`. Задаётся `NEXT_PUBLIC_SHOP_NAV_MVP=1`. */
export function getShopNavDisplayMode(): ShopNavDisplayMode {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SHOP_NAV_MVP === '1') return 'mvp';
  return 'full';
}

export function filterShopNavGroupsByTier(
  groups: typeof shopNavGroups,
  mode: ShopNavDisplayMode
): typeof shopNavGroups {
  if (mode === 'full') return groups;
  return groups.map((g) => ({
    ...g,
    links: g.links.filter((l) => (l as { navTier?: string }).navTier !== 'phase2'),
  })) as typeof shopNavGroups;
}
