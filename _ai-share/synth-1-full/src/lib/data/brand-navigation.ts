import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES, processLiveUrl } from '@/lib/routes';
import { COLLECTION_DEV_SIDEBAR_LINK_RU } from '@/lib/production/collection-development-labels';
import { PRIMARY_LINK_VALUES, type SecondaryNavItem } from './brand-nav-priority';
import { SYNTHA_SIDEBAR_CLUSTERS } from './syntha-nav-clusters';
import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  Calculator,
  Database,
  DollarSign,
  Cpu,
  Factory,
  FileSearch,
  FileText,
  Gavel,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  Layers2,
  LayoutDashboard,
  Megaphone,
  Monitor,
  Package,
  PackageCheck,
  QrCode,
  Rocket,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Target,
  Truck,
  UserCircle,
  Users,
  Wallet,
  Warehouse,
  Zap,
  Map,
  Search,
  Store,
  CreditCard,
  UserPlus,
  PackageSearch,
  MessageSquare,
} from 'lucide-react';

/** Кластеры сайдбара: основной контур · ядра 1–3 и архив (см. `syntha-nav-clusters.ts`). */
export const NAV_GROUP_CLUSTERS = SYNTHA_SIDEBAR_CLUSTERS;

/**
 * Порядок групп в UI задаётся `BRAND_CORE_GROUP_ORDER` / `BRAND_ARCHIVE_GROUP_ORDER`
 * (syntha-nav-clusters), а не порядком в массиве.
 * Основной контур бренда: team → comms → partners → development → pim → b2b → production → logistics.
 * Перегруз убран в архив: второй пункт «Склад» в логистике объединён с хабом; быстрые ссылки ритейла у календаря — только в «Витрина байера».
 * Группа `comms` (идентификатор как у shop/distributor/factory) — сквозные сообщения/календарь; межролевые сценарии: `CROSS_ROLE_FLOWS.md`.
 */
export const brandNavGroups = [
  // ─── Команда (ядро) — только участники; профиль и настройки → brand-admin (архив) ─
  {
    id: 'team',
    label: 'Команда',
    clusterId: 'syntha-cores',
    icon: Users,
    scope: 'shared',
    links: [
      {
        label: 'Команда',
        value: 'team',
        icon: Users,
        href: ROUTES.brand.team,
        description: 'Участники проекта, задачи, права и орг. структура бренда.',
      },
    ],
  },
  {
    id: 'brand-admin',
    label: 'Организация и настройки',
    clusterId: 'archive',
    icon: Building2,
    scope: 'shared',
    links: [
      {
        label: 'Профиль',
        value: 'profile',
        icon: UserCircle,
        href: '/brand/profile?group=profile&tab=brand',
        description: 'Профиль бренда, юр. данные, контакты',
      },
      {
        label: 'Интеграции',
        value: 'integrations',
        icon: Zap,
        href: ROUTES.brand.integrations,
        description: 'Маркетплейсы, ERP, PLM, 1С, Webhooks, SSO',
      },
      {
        label: 'Документооборот и ЭДО',
        value: 'documents',
        icon: FileText,
        href: ROUTES.brand.documents,
        description:
          'Договоры, счета, ЭДО, Честный ЗНАК. Шаблоны, интеграции Диадок/СБИС, склад КИЗ.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Комплаенс', href: ROUTES.brand.compliance, icon: Shield },
          { label: 'B2B', href: ROUTES.brand.b2bOrders, icon: Factory },
        ],
      },
      {
        label: 'Настройки',
        value: 'settings',
        icon: Settings,
        href: ROUTES.brand.settings,
        description: 'Общие, безопасность, подписка',
      },
      {
        label: 'Центр управления',
        value: 'dashboard',
        icon: Cpu,
        href: ROUTES.brand.controlCenter,
        description:
          'Стратегический хаб: все модули организации, логистики, продуктов, B2B, производства, маркетинга, аналитики, финансов, арбитража, устойчивости, коммуникаций. Обзор и быстрые переходы.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Обзор', href: ROUTES.brand.dashboard, icon: LayoutDashboard },
          { label: 'Заказы B2B', href: ROUTES.brand.b2bOrders, icon: ShoppingCart },
          { label: 'Производство', href: ROUTES.brand.production, icon: Factory },
        ],
      },
    ],
  },

  {
    id: 'pim',
    label: 'Товар',
    clusterId: 'syntha-cores',
    icon: Database,
    scope: 'shared',
    links: [
      {
        label: 'Товары',
        value: 'pim',
        icon: Database,
        href: ROUTES.brand.products,
        description:
          'Единый источник правды по карточке артикула: полный каталог и архив, сезонность, цены, медиа, статусы. Матрица и выпуск в цеху — в «Производство».',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Производство', href: ROUTES.brand.production, icon: Factory },
          { label: 'Заказы B2B', href: ROUTES.brand.b2bOrders, icon: ShoppingCart },
        ],
      },
      {
        label: 'Коллекции',
        value: 'collections',
        icon: Layers,
        href: ROUTES.brand.collections,
        description:
          'Собранные подборки сезонов, фотосессии и контекст для B2B; не дублирует полный каталог в «Товары».',
        iconColor: 'indigo',
      },
      {
        label: 'B2B Шоурум',
        value: 'showroom',
        icon: Monitor,
        href: ROUTES.brand.showroom,
        description:
          'Phygital-витрина для байеров; лайншиты доступны внутри модуля, отдельной строки в навигации нет.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets, icon: FileText },
          { label: 'Заказы B2B', href: ROUTES.brand.b2bOrders, icon: Package },
        ],
        subsections: [
          {
            href: ROUTES.brand.b2bLinesheets,
            label: 'Лайншиты',
            value: 'linesheets',
            hideInSidebar: true,
          },
        ],
      },
    ],
  },

  // ─── Кластер: Разработка (артикул → ТЗ → образец → шоурум) ─────
  {
    id: 'development',
    label: 'Разработка',
    clusterId: 'syntha-cores',
    icon: Sparkles,
    scope: 'shared',
    links: [
      {
        label: COLLECTION_DEV_SIDEBAR_LINK_RU,
        value: 'workshop2',
        icon: Layers2,
        href: ROUTES.brand.productionWorkshop2,
        description:
          'Полный процесс от карточки артикула до ТЗ, согласования образца и финального сэмпла. Серия и опт — в «Производстве» и B2B.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Производство', href: ROUTES.brand.production, icon: Factory },
          { label: 'Коллекции', href: ROUTES.brand.collections, icon: Layers },
        ],
      },
    ],
  },

  // ─── Ядро 1: производство (исполнение) ───────────────────────
  {
    id: 'production',
    label: 'Производство',
    clusterId: 'syntha-cores',
    icon: Factory,
    scope: 'shared',
    links: [
      {
        label: 'Производство',
        value: 'shop-floor',
        icon: Factory,
        href: ROUTES.brand.production,
        description:
          'Исполнение B2B-заказов и серий: этапы, снабжение, выпуск, ОТК. Матрица SKU — внутри модуля; данные карточки — в «Товар» → «Товары».',
        quickActions: [
          { label: 'Матрица SKU', href: ROUTES.brand.productsMatrix, icon: Layers },
          { label: 'Товары', href: ROUTES.brand.products, icon: Database },
        ],
        subsections: [
          {
            href: ROUTES.brand.productsMatrix,
            label: 'Матрица SKU',
            value: 'products-matrix',
            hideInSidebar: true,
          },
        ],
      },
    ],
  },
  {
    id: 'production-live',
    label: 'LIVE и сценарии',
    clusterId: 'archive',
    icon: Activity,
    scope: 'shared',
    links: [
      {
        label: 'LIVE: от идеи до склада',
        value: 'live-production',
        icon: Activity,
        href: processLiveUrl('production'),
        description:
          'Поэтапная схема процесса коллекции (бриф → ассортимент → материалы → сэмплы → PO → QC → склад). Контекст коллекции, сетка этапов, Kanban и Gantt. Дополняет вкладки цеха, не заменяет их.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Цех', href: ROUTES.brand.production, icon: Factory },
          { label: 'Все LIVE', href: ROUTES.brand.processLiveHub, icon: Activity },
        ],
      },
    ],
  },
  {
    id: 'logistics',
    label: 'Логистика и остатки',
    clusterId: 'syntha-cores',
    icon: Truck,
    scope: 'shared',
    links: [
      {
        label: 'Логистика и склад',
        value: 'logistics-hub',
        icon: Truck,
        href: ROUTES.brand.logistics,
        description:
          'Единая точка: перевозчики, документы, склад готовой продукции и материалов, КИЗ. Детальные экраны — через быстрые действия и deep link (без второй строки в сайдбаре).',
        iconColor: 'amber',
        quickActions: [
          { label: 'Склад', href: ROUTES.brand.warehouse, icon: Package },
          { label: 'Материалы', href: ROUTES.brand.materials, icon: Layers },
          { label: 'B2B', href: ROUTES.brand.b2bOrders, icon: ShoppingCart },
          { label: 'КИЗ', href: ROUTES.brand.complianceStock, icon: QrCode },
        ],
        subsections: [
          {
            href: ROUTES.brand.warehouse,
            label: 'Склад и остатки',
            value: 'warehouse',
            hideInSidebar: true,
          },
          {
            href: ROUTES.brand.materials,
            label: 'Материалы',
            value: 'materials',
            hideInSidebar: true,
          },
          {
            href: ROUTES.brand.complianceStock,
            label: 'КИЗ / маркировка',
            value: 'compliance-stock',
            hideInSidebar: true,
          },
        ],
      },
    ],
  },

  // ─── Кластер: Продажи ──────────────────────────────────────────
  {
    id: 'b2b',
    label: 'Заказы',
    clusterId: 'syntha-cores',
    icon: ShoppingCart,
    scope: 'b2b',
    links: [
      {
        label: 'Заказы B2B',
        value: 'orders',
        icon: Package,
        href: ROUTES.brand.b2bOrders,
        description:
          'Заказы, PO, отгрузки, согласование. Лайншиты и витрина — в «Товар» → «B2B Шоурум».',
      },
    ],
  },
  {
    id: 'b2b-showcase',
    label: 'B2B: витрина и карты',
    clusterId: 'archive',
    icon: Monitor,
    scope: 'b2b',
    links: [
      {
        label: 'Карта B2B (ритейл)',
        value: 'retail-b2b-map',
        icon: Map,
        href: LEGACY_ROUTES.shop.b2bWorkspaceMap,
        description:
          'Сквозная визуализация модулей закупок в кабинете магазина: где шоурум, заказы и финансы стыкуются с вашим контуром.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Заказы B2B', href: ROUTES.brand.b2bOrders, icon: Package },
          { label: 'Ритейлеры', href: ROUTES.brand.retailers, icon: Users },
        ],
      },
      {
        label: 'Выставки и события (бренд)',
        value: 'brand-trade-shows',
        icon: Monitor,
        href: LEGACY_ROUTES.brand.tradeShows,
        description:
          'Календарь и стенды бренда; связь с заявками байеров и витриной в кабинете магазина.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Заявки байеров', href: LEGACY_ROUTES.brand.buyerApplications, icon: Users },
          { label: 'Passport (бренд)', href: LEGACY_ROUTES.brand.b2bPassport, icon: FileText },
        ],
      },
    ],
  },
  // ─── Связь: переписка и календарь процессов (первый блок основного контура) ──
  {
    id: 'comms',
    label: 'Связь',
    clusterId: 'syntha-cores',
    icon: MessageSquare,
    scope: 'shared',
    links: [
      {
        label: 'Сообщения',
        value: 'messages',
        icon: MessageSquare,
        href: ROUTES.brand.messages,
        description:
          'Переписка по заказам B2B, производству и сопутствующим процессам; участники сети бренда.',
      },
      {
        label: 'Календарь',
        value: 'calendar',
        icon: Calendar,
        href: `${ROUTES.brand.calendar}?layers=tasks,orders,production`,
        description:
          'Единая временная шкала: задачи, дедлайны по заказам B2B и этапам производства. События ритейла (выставки, слоты встреч) смотрите в архиве «Витрина байера» — там же ссылки на сторону магазина.',
      },
    ],
  },
  {
    id: 'buyer-retail-mirror',
    label: 'Витрина байера и площадка',
    clusterId: 'archive',
    icon: Globe,
    scope: 'b2b',
    links: [
      {
        label: 'Кабинет магазина',
        value: 'shop-home',
        icon: Store,
        href: ROUTES.shop.home,
        description:
          'Тот же хаб ритейла, что видит байер: сверка UX с шоурумом, лайншитами и B2B-заказами.',
      },
      {
        label: 'Выставки (ритейл)',
        value: 'shop-b2b-trade-shows',
        icon: Calendar,
        href: LEGACY_ROUTES.shop.b2bTradeShows,
        description:
          'Календарь событий и стендов в кабинете магазина (раньше — быстрые ссылки у календаря бренда).',
      },
      {
        label: 'Запись на встречи (ритейл)',
        value: 'shop-b2b-trade-appointments',
        icon: Calendar,
        href: LEGACY_ROUTES.shop.b2bTradeShowAppointments,
        description: 'Слоты встреч с брендами — интерфейс байера.',
      },
      {
        label: 'Подбор брендов (маркетплейс)',
        value: 'shop-discover',
        icon: Search,
        href: LEGACY_ROUTES.shop.b2bDiscover,
        description: 'Поиск брендов и запрос доступа — зеркало байерского подбора.',
      },
      {
        label: 'Карта процессов B2B',
        value: 'shop-b2b-map',
        icon: Map,
        href: LEGACY_ROUTES.shop.b2bWorkspaceMap,
        description: 'Сквозная схема модулей закупок в кабинете магазина.',
      },
      {
        label: 'Оплата заказов (ритейл)',
        value: 'shop-b2b-payment',
        icon: CreditCard,
        href: LEGACY_ROUTES.shop.b2bPayment,
        description: 'Оплата и этапы инвойса в интерфейсе байера.',
      },
      {
        label: 'Подать заявку (сторона байера)',
        value: 'shop-b2b-apply',
        icon: UserPlus,
        href: LEGACY_ROUTES.shop.b2bApply,
        description: 'Онбординг байера к бренду — сопоставьте с заявками в бренд-кабинете.',
      },
      {
        label: 'Passport выставки (ритейл)',
        value: 'shop-passport',
        icon: FileText,
        href: LEGACY_ROUTES.shop.b2bPassport,
        description: 'Портал события в интерфейсе байера.',
      },
      {
        label: 'Заявки байеров (бренд)',
        value: 'buyer-applications',
        icon: Users,
        href: LEGACY_ROUTES.brand.buyerApplications,
        description: 'Входящие заявки и статусы — пара к «Подать заявку» в ритейле.',
      },
      {
        label: 'Fulfillment (ритейл)',
        value: 'shop-fulfillment',
        icon: Truck,
        href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard,
        description: 'SLA и каналы исполнения в кабинете магазина (наблюдение для бренда).',
      },
      {
        label: 'RFQ на площадке',
        value: 'shop-rfq',
        icon: FileSearch,
        href: LEGACY_ROUTES.shop.b2bRfq,
        description: 'Запросы котировок байеров; связь с RFQ материалов у бренда.',
      },
      {
        label: 'Тендеры (площадка)',
        value: 'shop-tenders',
        icon: Gavel,
        href: LEGACY_ROUTES.shop.b2bTenders,
        description: 'Конкурентные закупки на стороне ритейла.',
      },
      {
        label: 'Поиск поставщиков (площадка)',
        value: 'shop-supplier-discovery',
        icon: PackageSearch,
        href: ROUTES.shop.b2bSupplierDiscovery,
        description: 'Реестр поставщиков в контуре магазина; дополняет реестр бренда.',
      },
      {
        label: 'RFQ материалов (бренд)',
        value: 'brand-suppliers-rfq',
        icon: FileText,
        href: ROUTES.brand.suppliersRfq,
        description: 'Ваши запросы к поставщикам материалов — параллельно витрине RFQ ритейла.',
      },
      {
        label: 'BOPIS Hub',
        value: 'bopis',
        icon: PackageCheck,
        href: ROUTES.brand.bopis,
        description:
          'Выдача и возврат интернет-заказов в магазине (Buy Online, Pick Up In Store). Статусы заказов на выдачу, приём возвратов в точке, отчётность по магазинам.',
        iconColor: 'emerald',
        quickActions: [
          { label: 'Склад', href: ROUTES.brand.warehouse, icon: Package },
          { label: 'Возвраты', href: ROUTES.brand.returnsClaims, icon: Truck },
          { label: 'Партнёры', href: ROUTES.brand.retailers, icon: Users },
        ],
      },
    ],
  },
  {
    id: 'partners',
    label: 'Партнёры',
    clusterId: 'syntha-cores',
    icon: Users,
    scope: 'shared',
    links: [
      {
        label: 'Партнёры',
        value: 'retailers',
        icon: Users,
        href: ROUTES.brand.retailers,
        description:
          'Единый контур партнёров бренда: ритейлеры (список по умолчанию), поставщики и фабрики — из быстрых действий; отдельных строк в меню нет.',
        quickActions: [
          { label: 'Поставщики', href: ROUTES.brand.suppliers, icon: Package },
          { label: 'Фабрики', href: ROUTES.brand.factories, icon: Factory },
        ],
        subsections: [
          {
            href: ROUTES.brand.suppliers,
            label: 'Поставщики',
            value: 'suppliers',
            hideInSidebar: true,
          },
          {
            href: ROUTES.brand.factories,
            label: 'Фабрики',
            value: 'factories',
            hideInSidebar: true,
          },
        ],
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Маркетинг',
    clusterId: 'archive',
    icon: Megaphone,
    scope: 'shared',
    links: [
      {
        label: 'CRM и лояльность',
        value: 'customer-intelligence',
        icon: Sparkles,
        href: ROUTES.brand.customerIntelligence,
        description:
          'Аналитика аудитории, RFM, сегменты. Связь с Customers, Analytics, Reviews и B2B (байеры).',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Customers', href: ROUTES.brand.customers, icon: Users },
          { label: 'Analytics', href: ROUTES.brand.analytics, icon: BarChart3 },
        ],
      },
      {
        label: 'Кампании и промо',
        value: 'campaigns',
        icon: Rocket,
        href: ROUTES.brand.kickstarter,
        description:
          'AI кампании, краудфандинг, предзаказы, скидки, акции. Связи: Pre-orders, Production, B2B Orders, Finance.',
        iconColor: 'emerald',
        quickActions: [
          { label: 'Pre-orders', href: ROUTES.brand.preOrders, icon: Package },
          { label: 'Production', href: ROUTES.brand.production, icon: Factory },
          { label: 'B2B', href: ROUTES.brand.b2bOrders, icon: ShoppingCart },
          { label: 'Finance', href: ROUTES.brand.finance, icon: DollarSign },
        ],
      },
      {
        label: 'PR-образцы',
        value: 'samples',
        icon: QrCode,
        href: ROUTES.brand.marketingSamples,
        description:
          'Учёт образцов коллекции для съёмок, редакций и стилистов. Связь с Production (сэмплы, артикулы) и маркетингом (кампании). ROI кампаний — в Аналитике.',
        iconColor: 'amber',
        quickActions: [
          { label: 'Products', href: ROUTES.brand.products, icon: Package },
          { label: 'Production', href: ROUTES.brand.production, icon: Factory },
          { label: 'Аналитика', href: ROUTES.brand.analyticsBi, icon: BarChart3 },
          { label: 'Content', href: ROUTES.brand.marketingContentFactory, icon: Megaphone },
        ],
      },
      {
        label: 'Медиа и контент',
        value: 'media',
        icon: ImageIcon,
        href: ROUTES.brand.media,
        description: 'DAM, трансляции, AI-видео. Связь с Products, Showroom и Marketing.',
        iconColor: 'blue',
        quickActions: [
          { label: 'Products', href: ROUTES.brand.products, icon: Package },
          { label: 'Showroom', href: ROUTES.brand.showroom, icon: Monitor },
        ],
      },
    ],
  },

  // ─── Кластер: Аналитика (BI, отчёты, прогнозы) ─────────────────
  {
    id: 'analytics',
    label: 'Аналитика',
    clusterId: 'archive',
    icon: BarChart3,
    scope: 'shared',
    links: [
      {
        label: 'Аналитика 360',
        value: 'analytics-360',
        icon: Target,
        href: ROUTES.brand.analytics360,
        description: 'Сквозная стратегическая аналитика',
      },
      {
        label: 'BI и отчёты',
        value: 'analytics-bi',
        icon: BarChart3,
        href: ROUTES.brand.analyticsBi,
        description:
          'Полная статистика бренда: продажи (B2B, дистрибуторы, маркетплейс, аутлет), производство, остатки, клиенты, коллекции. План vs Факт, Phase 2 закупки, дашборды. Интеграция: 1С, Excel, Мой Склад.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'План vs Факт', href: ROUTES.brand.budgetActual, icon: Calculator },
          { label: 'Phase 2', href: ROUTES.brand.analyticsPhase2, icon: Layers },
          { label: 'AI Прогнозы', href: ROUTES.brand.analytics, icon: Zap },
          { label: '360°', href: ROUTES.brand.analytics360, icon: Target },
        ],
      },
      {
        label: 'AI Прогнозы',
        value: 'ai-analytics',
        icon: Zap,
        href: ROUTES.brand.analytics,
        description:
          'Анализ SKU, промо, A/B-тесты. Связи: Analytics 360, BI, Products, Promotions, Finance.',
        iconColor: 'indigo',
        quickActions: [
          { label: '360° Analytics', href: ROUTES.brand.analytics360, icon: Target },
          { label: 'BI Reports', href: ROUTES.brand.analyticsBi, icon: BarChart3 },
          { label: 'Products', href: ROUTES.brand.products, icon: Layers },
          { label: 'Promotions', href: ROUTES.brand.promotions, icon: Megaphone },
          { label: 'Finance', href: ROUTES.brand.finance, icon: DollarSign },
        ],
      },
      {
        label: 'Ценообразование',
        value: 'ai-pricing',
        icon: Calculator,
        href: ROUTES.brand.pricing,
        description: 'AI инструмент для настройки цен и маржи',
      },
    ],
  },
  {
    id: 'finance',
    label: 'Финансы',
    clusterId: 'archive',
    icon: DollarSign,
    scope: 'shared',
    links: [
      {
        label: 'План vs Факт',
        value: 'budget-actual',
        icon: Calculator,
        href: ROUTES.brand.budgetActual,
        description:
          'Бюджеты закупок, производства, маркетинга и логистики. РФ: рубли, контрагенты, статьи. Инфраструктура под API: ETL в fact_* / snapshot_*, импорт 1С/Мой Склад.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'BI Hub', href: ROUTES.brand.analyticsBi, icon: BarChart3 },
          { label: 'Финансы', href: ROUTES.brand.finance, icon: DollarSign },
        ],
      },
      {
        label: 'Финансовый хаб',
        value: 'finance',
        icon: Wallet,
        href: ROUTES.brand.finance,
        description:
          'P&L, факторинг, бюджеты и кассовый контроль. Landed Cost — расчёт полной себестоимости (ткань + CMT + логистика + пошлины). Escrow — безопасные сделки B2B.',
        iconColor: 'emerald',
        quickActions: [
          { label: 'Landed Cost', href: ROUTES.brand.financeLandedCost, icon: Calculator },
          { label: 'Escrow', href: ROUTES.brand.financeEscrow, icon: Shield },
        ],
      },
      {
        label: 'Арбитраж и споры',
        value: 'disputes',
        icon: Gavel,
        href: ROUTES.brand.disputes,
        description:
          'B2B-претензии, арбитраж. Escrow — безопасные сделки. Связь с Production, B2B Orders и Finance.',
        iconColor: 'rose',
        quickActions: [
          { label: 'Escrow', href: ROUTES.brand.financeEscrow, icon: Shield },
          { label: 'B2B Orders', href: ROUTES.brand.b2bOrders, icon: Package },
        ],
      },
      {
        label: 'ESG-мониторинг',
        value: 'esg',
        icon: Globe,
        href: ROUTES.brand.esg,
        description:
          'Сертификаты, отчёты GRI/CDP, углеродный след. Связь с Production (BOM, материалы), Compliance и Quality.',
        iconColor: 'emerald',
        quickActions: [
          { label: 'Production', href: ROUTES.brand.production, icon: Factory },
          { label: 'Compliance', href: ROUTES.brand.compliance, icon: Shield },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'AI и обучение',
    clusterId: 'archive',
    icon: Zap,
    scope: 'shared',
    links: [
      {
        label: 'AI Инструменты',
        value: 'ai-tools',
        icon: Sparkles,
        href: ROUTES.brand.aiDesign,
        description:
          'Генерация дизайна по описанию, техпакеты. Связь с Production (Tech Pack), Products и Planning.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Production', href: ROUTES.brand.production, icon: Factory },
          { label: 'Planning', href: ROUTES.brand.planning, icon: Layers },
        ],
      },
      {
        label: 'Академия',
        value: 'academy',
        icon: GraduationCap,
        href: ROUTES.brand.academy,
        description: 'Курсы, база знаний, материалы',
      },
      {
        label: 'HR-центр',
        value: 'hr-hub',
        icon: Briefcase,
        href: ROUTES.brand.hrHub,
        description:
          'Единый центр: вакансии, резюме, онбординг, обучение. Связь с Командой, Академией, Career.',
        iconColor: 'indigo',
        quickActions: [
          { label: 'Команда', href: ROUTES.brand.team, icon: Users },
          { label: 'Академия', href: ROUTES.brand.academy, icon: GraduationCap },
        ],
      },
    ],
  },
];

/** Плоский список ссылок; пункты с `quickActions` расширяют union — см. типы группы `tools`. */
// @ts-expect-error TS2322 — объединение вариантов ссылок бренда (quickActions, iconColor) не сводится к одному литералу
export const allBrandNavLinks = brandNavGroups.flatMap((group) => group.links);

/** Группы с только primary-пунктами (~25–35 видимых). */
export function getPrimaryNavGroups(
  groups: typeof brandNavGroups,
  filter: (g: (typeof brandNavGroups)[number]) => boolean
) {
  return groups
    .filter(filter)
    .map((g) => {
      const primaryValues = PRIMARY_LINK_VALUES[g.id] ?? [];
      const primaryLinks = g.links.filter((l) => primaryValues.includes(l.value));
      if (primaryLinks.length === 0) return null;
      return { ...g, links: primaryLinks };
    })
    .filter(Boolean) as (typeof brandNavGroups)[number][];
}

/** Второстепенные пункты для блока «Ещё», с указанием исходной группы. */
export function getSecondaryNavItems(
  groups: typeof brandNavGroups,
  filter: (g: (typeof brandNavGroups)[number]) => boolean
): SecondaryNavItem[] {
  const out: SecondaryNavItem[] = [];
  for (const g of groups) {
    if (!filter(g)) continue;
    const primaryValues = PRIMARY_LINK_VALUES[g.id] ?? [];
    for (const link of g.links) {
      if (!primaryValues.includes(link.value)) {
        out.push({
          link: link as SecondaryNavItem['link'],
          sourceGroupId: g.id,
          sourceGroupLabel: g.label,
        });
      }
    }
  }
  return out;
}

/** Хаб группы — первый (главный) раздел группы */
export function getGroupHub(groupId: string): { href: string; label: string } {
  const group = brandNavGroups.find((g) => g.id === groupId);
  if (!group?.links?.length) return { href: ROUTES.brand.home, label: 'Бренд' };
  const first = group.links[0];
  return { href: first.href, label: first.label };
}

export type BrandSectionMeta = {
  groupId: string;
  groupLabel: string;
  groupHref: string;
  sectionLabel: string;
  sectionHref: string;
  /** Подраздел (напр. SSO внутри Интеграций) */
  subsectionLabel?: string;
  subsectionHref?: string;
  description: string;
  icon: (typeof brandNavGroups)[0]['links'][0]['icon'];
  iconColor?: 'indigo' | 'slate' | 'emerald' | 'amber' | 'rose' | 'blue';
  quickActions?: Array<{
    label: string;
    href: string;
    icon: (typeof brandNavGroups)[0]['links'][0]['icon'];
  }>;
};

function pathFromHref(href: string): string {
  return (href.split('?')[0] || '').replace(/\/$/, '') || '/';
}

/** Метаданные раздела по pathname — единый источник для BrandSectionHeaderBlock и breadcrumb */
export function getBrandSectionMeta(
  pathname: string,
  searchString?: string
): BrandSectionMeta | null {
  const path = pathname.replace(/\/$/, '') || '/brand';
  const flat: {
    href: string;
    pathOnly: string;
    link: (typeof brandNavGroups)[0]['links'][0];
    group: (typeof brandNavGroups)[0];
    subsection?: { href: string; label: string; value: string };
  }[] = [];
  for (const group of brandNavGroups) {
    for (const link of group.links) {
      const rawHref = link.href;
      flat.push({ href: rawHref, pathOnly: pathFromHref(rawHref), link, group });
      const subsections = (
        link as { subsections?: { href: string; label: string; value: string }[] }
      ).subsections;
      if (subsections?.length) {
        for (const sub of subsections) {
          flat.push({
            href: sub.href,
            pathOnly: pathFromHref(sub.href),
            link,
            group,
            subsection: sub,
          });
          const nested = (sub as { children?: { href: string; label: string; value: string }[] })
            .children;
          if (nested?.length) {
            for (const ch of nested) {
              flat.push({
                href: ch.href,
                pathOnly: pathFromHref(ch.href),
                link,
                group,
                subsection: ch,
              });
            }
          }
        }
      }
    }
  }
  flat.sort((a, b) => b.pathOnly.length - a.pathOnly.length);
  const matches: {
    link: (typeof brandNavGroups)[0]['links'][0];
    group: (typeof brandNavGroups)[0];
    subsection?: { href: string; label: string; value: string };
    prefersSearch: boolean;
  }[] = [];
  for (const { href, pathOnly, link, group, subsection } of flat) {
    const exact = path === pathOnly || path === pathFromHref(href);
    const nested = pathOnly !== '/brand' && path.startsWith(pathOnly + '/');
    if (exact || nested) {
      const prefersSearch = !!(
        searchString &&
        subsection?.href.includes('?') &&
        subsection.href.includes(searchString)
      );
      matches.push({ link, group, subsection, prefersSearch });
    }
  }
  const best = matches.sort((a, b) => (b.prefersSearch ? 1 : 0) - (a.prefersSearch ? 1 : 0))[0];
  if (best) {
    const { link, group, subsection } = best;
    const hub = getGroupHub(group.id);
    const subsections = (link as { subsections?: { href: string; label: string; value: string }[] })
      .subsections;
    let subsectionLabel: string | undefined;
    let subsectionHref: string | undefined;
    if (subsection) {
      subsectionLabel = subsection.label;
      subsectionHref = subsection.href;
    } else if (subsections?.length) {
      const sub = searchString
        ? (subsections.find((s) => s.href.includes('?') && s.href.includes(searchString)) ??
          subsections.find((s) => pathFromHref(s.href) === path))
        : subsections.find((s) => pathFromHref(s.href) === path);
      if (sub) {
        subsectionLabel = sub.label;
        subsectionHref = sub.href;
      }
    }
    const linkExt = link as {
      iconColor?: BrandSectionMeta['iconColor'];
      quickActions?: BrandSectionMeta['quickActions'];
    };
    return {
      groupId: group.id,
      groupLabel: group.label,
      groupHref: hub.href,
      sectionLabel: link.label,
      sectionHref: link.href,
      subsectionLabel,
      subsectionHref,
      description: link.description,
      icon: link.icon,
      iconColor: linkExt.iconColor ?? 'indigo',
      quickActions: linkExt.quickActions,
    };
  }
  return null;
}
