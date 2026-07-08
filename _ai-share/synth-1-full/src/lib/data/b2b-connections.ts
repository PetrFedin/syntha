import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
/**
 * JOOR / NuOrder / RepSpark / ZEOS: горизонтальные и вертикальные связи B2B.
 * Единая карта: профиль → разделы; контекст → связанные модули; роли → доступ.
 */

import { ROUTES } from '@/lib/routes';

/** Профили приложения (вертикаль: кто что видит) */
export type AppProfile = 'brand' | 'shop' | 'distributor' | 'factory' | 'admin' | 'client';

/** Роли внутри B2B (для фильтрации навигации и дашбордов) */
export type B2BRole =
  | 'buyer'
  | 'brand_manager'
  | 'sales_rep'
  | 'distributor_agent'
  | 'production'
  | 'finance'
  | 'admin';

/** Ключевые группы навигации по профилю */
export const PROFILE_NAV_GROUPS: Record<AppProfile, string[]> = {
  brand: [
    'team',
    'logistics',
    'compliance',
    'overview',
    'product',
    'b2b_wholesale',
    'b2c_retail',
    'production',
    'marketing',
    'content',
    'analytics',
    'finance',
    'protection',
    'auctions',
    'ai-tools',
    'esg',
    'collabs',
    'hr',
    'academy',
    'comm',
  ],
  shop: ['overview', 'retail', 'b2b', 'partners', 'analytics', 'management'],
  distributor: [
    'overview',
    'staff',
    'calendar',
    'messages',
    'brands',
    'matrix',
    'orders',
    'contracts',
    'retailers',
    'analytics',
    'commissions',
    'vmi',
    'settings',
  ],
  factory: ['management', 'production', 'resources', 'settings'],
  admin: ['overview', 'users', 'content', 'commerce', 'analytics', 'settings', 'integrations'],
  client: ['catalog', 'orders', 'wishlist', 'profile'],
};

/** Роль → разделы B2B (горизонталь: из какого раздела куда переходить) */
export const B2B_ROLE_SECTIONS: Record<B2BRole, string[]> = {
  buyer: [
    'order-mode',
    'create-order',
    'quick-order',
    'order-by-collection',
    'order-templates',
    'collaborative-order',
    'order-drafts',
    'collection-terms',
    'reorder',
    'matrix',
    'assortment-planning',
    'ez-order',
    'working-order',
    'b2b-orders',
    'order-analytics',
    'fulfillment-dashboard',
    'margin-report',
    'margin-calculator',
    'multi-currency',
    'size-mapping',
    'trade-shows',
    'passport',
    'discover',
    'payment',
    'tracking',
    'video-consultation',
    'vip-room-booking',
    'shopify-sync',
    'social-feed',
    'gamification',
    'store-locator',
    'partner-onboarding',
    'b2b-apply',
    'partners',
    'replenishment',
    'smart-replenishment',
    'shopping-lists',
    'dealer-cabinet',
    'ai-smart-order',
    'multiple-carts',
    'product-favorites',
    'assortment-curation',
    'product-banners',
    'volume-pack-rules',
    'ai-search',
  ],
  brand_manager: [
    'b2b-orders',
    'trade-shows',
    'passport',
    'buyer-applications',
    'linesheet-campaigns',
    'linesheets',
    'linesheet-versions',
    'showroom',
    'retailers',
    'distributors',
    'territory',
    'pre-order-quota',
    'commissions',
    'credit-risk',
    'last-call',
    'shopify-sync',
    'po',
    'shipments',
    'order-approval-workflow',
    'engagement',
    'embedded-payment',
    'integrations-erp-plm',
    'calendar',
    'tasks',
    'events',
    'messages',
  ],
  sales_rep: [
    'retailers',
    'b2b-orders',
    'trade-shows',
    'buyer-applications',
    'commissions',
    'messages',
    'calendar',
    'tasks',
  ],
  distributor_agent: [
    'orders',
    'retailers',
    'brands',
    'matrix',
    'analytics',
    'commissions',
    'vmi',
    'territory',
    'pre-order-quota',
    'calendar',
    'messages',
  ],
  production: [
    'production',
    'b2b-orders',
    'factories',
    'materials',
    'suppliers',
    'vmi',
    'calendar',
    'tasks',
    'warehouse',
  ],
  finance: [
    'finance',
    'b2b-orders',
    'escrow',
    'commissions',
    'budget-actual',
    'analytics-bi',
    'disputes',
    'returns-claims',
    'calendar',
  ],
  admin: ['control-center', 'integrations', 'team', 'documents', 'security'],
};

/** Контекст страницы → связанные маршруты (горизонтальные связи). Используется для RelatedModulesBlock и breadcrumb. */
export const CONTEXT_TO_ROUTES: Record<string, { label: string; href: string }[]> = {
  'brand/b2b-order': [
    { label: 'Календарь', href: '/brand/calendar' },
    { label: 'Чаты', href: '/brand/messages' },
    { label: 'Виртуальные выставки', href: LEGACY_ROUTES.brand.tradeShows },
    { label: 'Заявки байеров', href: LEGACY_ROUTES.brand.buyerApplications },
    { label: 'Кампании по лайншитам', href: LEGACY_ROUTES.brand.b2bLinesheetCampaigns },
    { label: 'Финансы', href: ROUTES.brand.finance },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'Возвраты и рекламации', href: ROUTES.brand.returnsClaims },
  ],
  'shop/b2b-order': [
    { label: 'Матрица заказа', href: ROUTES.shop.b2bMatrix },
    { label: 'Режим заказа', href: LEGACY_ROUTES.shop.b2bOrderMode },
    { label: 'Написание заказа по коллекции', href: ROUTES.shop.b2bCreateOrder },
    { label: 'Заказ по коллекции', href: LEGACY_ROUTES.shop.b2bOrderByCollection },
    { label: 'Шаблоны заказов', href: LEGACY_ROUTES.shop.b2bOrderTemplates },
    { label: 'Коллективный заказ', href: LEGACY_ROUTES.shop.b2bCollaborativeOrder },
    { label: 'Черновики заказов', href: LEGACY_ROUTES.shop.b2bOrderDrafts },
    { label: 'Условия по коллекциям', href: ROUTES.shop.b2bCollectionTerms },
    { label: 'EZ Order', href: LEGACY_ROUTES.shop.b2bEzOrder },
    { label: 'Working Order', href: ROUTES.shop.b2bWorkingOrder },
    { label: 'Reorder', href: LEGACY_ROUTES.shop.b2bReorder },
    { label: 'Аналитика заказов', href: ROUTES.shop.b2bOrderAnalytics },
    { label: 'Fulfillment (ZEOS)', href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard },
    { label: 'Маржа по брендам', href: ROUTES.shop.b2bMarginReport },
    { label: 'Калькулятор маржи', href: LEGACY_ROUTES.shop.b2bMarginCalculator },
    { label: 'Мультивалюта', href: ROUTES.shop.b2bMultiCurrency },
    { label: 'Видео-консультация', href: LEGACY_ROUTES.shop.b2bVideoConsultation },
    { label: 'VIP Шоурум', href: LEGACY_ROUTES.shop.b2bVipRoomBooking },
    { label: 'Синхронизация Shopify', href: LEGACY_ROUTES.shop.b2bShopifySync },
    { label: 'Лента брендов', href: LEGACY_ROUTES.shop.b2bSocialFeed },
    { label: 'Челленджи и бейджи', href: LEGACY_ROUTES.shop.b2bGamification },
    { label: 'Карта магазинов', href: ROUTES.storeLocator },
    { label: 'Онбординг партнёра', href: ROUTES.shop.b2bPartnerOnboarding },
    { label: 'Мои выставки', href: LEGACY_ROUTES.shop.b2bTradeShows },
  ],
  'brand/trade-show': [
    { label: 'Шоурум', href: ROUTES.brand.showroom },
    { label: 'B2B Заказы', href: ROUTES.brand.b2bOrders },
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'Заявки байеров', href: LEGACY_ROUTES.brand.buyerApplications },
    { label: 'Кампании по лайншитам', href: LEGACY_ROUTES.brand.b2bLinesheetCampaigns },
    { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets },
    { label: 'Календарь', href: ROUTES.brand.calendar },
    { label: 'События', href: ROUTES.brand.events },
  ],
  'brand/buyer-application': [
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'B2B Заказы', href: ROUTES.brand.b2bOrders },
    { label: 'Виртуальные выставки', href: LEGACY_ROUTES.brand.tradeShows },
    { label: 'Credit Risk', href: ROUTES.brand.creditRisk },
    { label: 'Territory Protection', href: ROUTES.brand.distributor.territory },
    { label: 'Кампании по лайншитам', href: LEGACY_ROUTES.brand.b2bLinesheetCampaigns },
  ],
  'brand/linesheet-campaign': [
    { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets },
    { label: 'B2B Заказы', href: ROUTES.brand.b2bOrders },
    { label: 'Виртуальные выставки', href: LEGACY_ROUTES.brand.tradeShows },
    { label: 'Заявки байеров', href: LEGACY_ROUTES.brand.buyerApplications },
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'Шоурум', href: ROUTES.brand.showroom },
  ],
  'brand/distributor': [
    { label: 'Territory Protection', href: ROUTES.brand.distributor.territory },
    { label: 'Pre-Order Quota', href: ROUTES.brand.distributor.preOrderQuota },
    { label: 'Sub-Agent Commission', href: ROUTES.brand.distributor.commissions },
    { label: 'B2B Заказы', href: ROUTES.brand.b2bOrders },
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'Виртуальные выставки', href: LEGACY_ROUTES.brand.tradeShows },
    { label: 'Календарь', href: ROUTES.brand.calendar },
    { label: 'События', href: ROUTES.brand.events },
  ],
  'distributor/analytics': [
    { label: 'Обзор', href: '/distributor' },
    { label: 'Заказы', href: '/distributor/orders' },
    { label: 'Ритейлеры', href: '/distributor/retailers' },
    { label: 'Комиссии', href: '/distributor/commissions' },
    { label: 'VMI', href: '/distributor/vmi' },
  ],
  'brand/last-call': [
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'B2B Заказы', href: ROUTES.brand.b2bOrders },
    { label: 'Credit Risk', href: ROUTES.brand.creditRisk },
    { label: 'Финансы', href: ROUTES.brand.finance },
    { label: 'Заявки байеров', href: LEGACY_ROUTES.brand.buyerApplications },
    { label: 'Виртуальные выставки', href: LEGACY_ROUTES.brand.tradeShows },
  ],
  'brand/po': [
    { label: 'B2B Заказы', href: ROUTES.brand.b2bOrders },
    { label: 'Финансы', href: ROUTES.brand.finance },
    { label: 'Документы', href: ROUTES.brand.documents },
  ],
  'brand/shipments': [
    { label: 'B2B Заказы', href: ROUTES.brand.b2bOrders },
    { label: 'Логистика', href: ROUTES.brand.logistics },
    { label: 'Партнёры', href: ROUTES.brand.retailers },
  ],
  'brand/engagement': [
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'Кампании по лайншитам', href: LEGACY_ROUTES.brand.b2bLinesheetCampaigns },
    { label: 'Аналитика', href: ROUTES.brand.analyticsBi },
  ],
  'brand/order-approval-workflow': [
    { label: 'B2B Заказы', href: ROUTES.brand.b2bOrders },
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'Чаты', href: ROUTES.brand.messages },
  ],
  'shop/partners': [
    { label: 'Подбор брендов', href: LEGACY_ROUTES.shop.b2bDiscover },
    { label: 'Подать заявку', href: LEGACY_ROUTES.shop.b2bApply },
    { label: 'Онбординг', href: ROUTES.shop.b2bPartnerOnboarding },
    { label: 'Мои заказы', href: ROUTES.shop.b2bOrders },
    { label: 'Написание заказа', href: ROUTES.shop.b2bCreateOrder },
    { label: 'Контракты', href: ROUTES.shop.b2bContracts },
    { label: 'Рабочее пространство', href: ROUTES.shop.b2b },
  ],
  'shop/partner-detail': [
    { label: 'Создать заказ', href: ROUTES.shop.b2bCreateOrder },
    { label: 'Мои заказы', href: ROUTES.shop.b2bOrders },
    { label: 'Контракты', href: ROUTES.shop.b2bContracts },
    { label: 'Условия по коллекциям', href: ROUTES.shop.b2bCollectionTerms },
    { label: 'Все партнёры', href: ROUTES.shop.b2bPartners },
  ],
};

/** Получить связанные маршруты по контексту (для RelatedModulesBlock в формате EntityLink) */
export function getContextLinks(context: keyof typeof CONTEXT_TO_ROUTES): {
  label: string;
  href: string;
  entityType:
    | 'order'
    | 'task'
    | 'event'
    | 'partner'
    | 'production'
    | 'product'
    | 'escrow'
    | 'dispute';
}[] {
  const routes = CONTEXT_TO_ROUTES[context];
  if (!routes) return [];
  return routes.map((r) => ({ ...r, entityType: 'order' as const }));
}
