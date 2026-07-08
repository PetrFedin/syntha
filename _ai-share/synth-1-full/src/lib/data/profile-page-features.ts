import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
/**
 * Единый mapping: профили → главные страницы → ресурсы/фичи.
 * Используется для RouteGuard, INVESTOR_DEMO, фильтрации Brand sidebar по RBAC.
 */

import type { Resource, PlatformRole } from '@/lib/rbac';
import { ROUTES } from '@/lib/routes';

export type ProfileKey =
  | 'admin'
  | 'brand'
  | 'shop'
  | 'retailer'
  | 'distributor'
  | 'factory'
  | 'manufacturer'
  | 'supplier'
  | 'client';

/** Главная страница профиля и основные маршруты */
export const PROFILE_MAIN_PAGES: Record<ProfileKey, string[]> = {
  admin: [
    ROUTES.admin.home,
    ROUTES.brand.home,
    ROUTES.shop.home,
    EXTENDED_ROUTES.factory.production,
    EXTENDED_ROUTES.factory.supplier,
    ROUTES.distributor.home,
  ],
  brand: [ROUTES.brand.home, '/brand'],
  /** `/shop` — дашборд; `/shop/b2b` — редирект на `/shop`; сценарии — в сайдбаре. */
  shop: ['/shop', '/shop/b2b'],
  retailer: ['/shop', '/shop/b2b'],
  distributor: [ROUTES.distributor.home],
  factory: [EXTENDED_ROUTES.factory.production, EXTENDED_ROUTES.factory.supplier],
  manufacturer: [EXTENDED_ROUTES.factory.production],
  supplier: [EXTENDED_ROUTES.factory.supplier],
  client: [
    '/client',
    '/client/me',
    '/client/wardrobe',
    '/client/try-before-you-buy',
    '/client/wishlist',
    '/client/catalog',
    '/client/passport',
    '/client/returns',
    '/client/gift-registry',
    '/client/scanner',
  ],
};

/** Resource → основные маршруты (для поиска, breadcrumb) */
export const RESOURCE_TO_ROUTES: Record<Resource, string[]> = {
  brand_profile: ['/brand/profile', '/brand/profile?group=profile', '/brand?group=profile'],
  production: ['/brand/production', '/brand/production/operations'],
  b2b_orders: [
    ROUTES.brand.b2bOrders,
    '/brand/showroom',
    '/brand/b2b/linesheets',
    '/brand/factories',
    '/shop/b2b/orders',
  ],
  b2b_catalog: [
    '/brand/products',
    '/brand/collections',
    '/brand/products/matrix',
    '/shop/b2b/catalog',
  ],
  warehouse: ['/brand/warehouse', '/brand/logistics', '/brand/inventory', '/brand/materials'],
  finance: ['/brand/finance', '/brand/pricing', ROUTES.shop.b2bFinance, LEGACY_ROUTES.shop.b2bPayment],
  compliance: ['/brand/compliance', '/brand/documents', '/brand/disputes'],
  integrations: ['/brand/integrations'],
  team: [
    '/brand/team',
    '/brand/messages',
    '/brand/calendar',
    '/brand/tasks',
    ROUTES.shop.staff,
    ROUTES.shop.messages,
    ROUTES.shop.calendar,
    '/shop/b2b/trade-shows',
    '/shop/b2b/trade-shows/appointments',
  ],
  analytics: [
    '/brand/analytics',
    '/brand/analytics-bi',
    '/brand/control-center',
    '/brand/dashboard',
    ROUTES.shop.analytics,
    ROUTES.shop.analyticsFootfall,
    LEGACY_ROUTES.shop.b2bAnalytics,
    ROUTES.shop.b2bOrderAnalytics,
    LEGACY_ROUTES.shop.b2bReports,
    LEGACY_ROUTES.shop.b2bMarginAnalysis,
    ROUTES.shop.b2bMarginReport,
    LEGACY_ROUTES.shop.b2bMarginCalculator,
    ROUTES.shop.b2bLandedCost,
    LEGACY_ROUTES.shop.b2bDeliveryCalendar,
  ],
  /** Кампании, PR-образцы, медиа — группа сайдбара «Маркетинг» (ворота `marketing`). */
  marketing: [
    ROUTES.brand.kickstarter,
    ROUTES.brand.marketingSamples,
    ROUTES.brand.media,
    ROUTES.brand.promotions,
    ROUTES.brand.b2bCampaigns,
  ],
  /** AI, академия, HR — группа «AI и обучение» (ворота `learning`). */
  learning: [ROUTES.brand.aiDesign, ROUTES.brand.aiTools, ROUTES.brand.academy, ROUTES.brand.hrHub],
  edo: ['/brand/documents', '/brand/compliance'],
  settings: ['/brand/settings', '/brand/security', '/brand/subscription'],
};

/** Nav group id → RBAC Resource. Группы без resource видны brand/admin. */
export const NAV_GROUP_RESOURCE: Record<string, Resource> = {
  team: 'team',
  'brand-admin': 'brand_profile',
  pim: 'b2b_catalog',
  /** Разработка коллекции — тот же доступ, что к производственному контуру. */
  development: 'production',
  production: 'production',
  comms: 'team',
  logistics: 'warehouse',
  b2b: 'b2b_orders',
  partners: 'b2b_orders',
  marketing: 'marketing',
  analytics: 'analytics',
  tools: 'learning',
};

/** Shop nav group id → Resource. Для фильтрации ритейл-центра по роли. */
export const SHOP_NAV_GROUP_RESOURCE: Record<string, Resource> = {
  /** Команда магазина (`/shop/staff`) — тот же ресурс `team`, что и сообщения/календарь в связке. */
  team: 'team',
  /** Сообщения и календарь байера — `RESOURCE_TO_ROUTES.team`. */
  comms: 'team',
  overview: 'analytics',
  /** @deprecated — см. retail-ops, inventory-precision */
  retail: 'warehouse',
  'retail-ops': 'warehouse',
  'inventory-precision': 'warehouse',
  /** @deprecated монолит разбит на секции B2B ниже */
  b2b: 'b2b_orders',
  'b2b-procurement': 'b2b_orders',
  'b2b-execution': 'b2b_orders',
  'b2b-service': 'b2b_orders',
  pim: 'b2b_catalog',
  logistics: 'warehouse',
  'shop-b2b-extended': 'b2b_orders',
  /** @deprecated старые id групп до схлопывания навигации */
  'b2b-trade-entry': 'b2b_orders',
  'b2b-order-writing': 'b2b_orders',
  'b2b-ops-execution': 'b2b_orders',
  'b2b-ai-experience': 'b2b_orders',
  'b2b-channels-budget': 'b2b_orders',
  partners: 'b2b_orders',
  analytics: 'analytics',
  management: 'settings',
};

/**
 * Уточнение ролей для сайдбара Shop поверх `SHOP_NAV_GROUP_RESOURCE` + `can()`.
 * Если для группы задан список — роль должна входить в него (и пройти проверку resource, если задана).
 * См. `docs/shop-retailer-cabinet-roadmap.md` §4.
 */
export const SHOP_NAV_GROUP_ROLES: Partial<Record<string, readonly PlatformRole[]>> = {
  /** Розница и склад сети: операционные роли, не чистый HQ-buyer. */
  'retail-ops': ['retailer', 'distributor', 'sales_rep', 'merchandiser', 'admin'],
  /** @deprecated см. shop-b2b-extended */
  'inventory-precision': ['retailer', 'distributor', 'merchandiser', 'admin'],
  'shop-b2b-extended': ['retailer', 'distributor', 'sales_rep', 'merchandiser', 'admin'],
  /** Сеть, бюджет, команда: магазин + финконтур + дистрибутор. */
  management: ['retailer', 'finance_manager', 'distributor', 'admin'],
};

/** Admin видит всё. Остальные — по can(resource, 'view'). */
export function canSeeNavGroup(
  role: string,
  groupId: string,
  can: (r: Resource, a: 'view') => boolean
): boolean {
  if (role === 'admin') return true;
  const resource = NAV_GROUP_RESOURCE[groupId];
  if (!resource) return true;
  return can(resource, 'view');
}

/** Shop sidebar: admin видит всё; далее роль из `SHOP_NAV_GROUP_ROLES` (если есть) и `can()`. */
export function canSeeShopNavGroup(
  role: string,
  groupId: string,
  can: (r: Resource, a: 'view') => boolean
): boolean {
  if (role === 'admin') return true;
  const allowedRoles = SHOP_NAV_GROUP_ROLES[groupId];
  if (allowedRoles?.length) {
    const pr = role as PlatformRole;
    if (!allowedRoles.includes(pr)) return false;
  }
  const resource = SHOP_NAV_GROUP_RESOURCE[groupId];
  if (!resource) return true;
  return can(resource, 'view');
}

export type HubKey = 'admin' | 'brand' | 'shop' | 'factory' | 'supplier' | 'distributor' | 'client';

/** Доступ к хаб-страницам по PlatformRole. Для cross-hub навигации. */
export function canAccessHub(role: string, hub: HubKey): boolean {
  if (role === 'admin') return true;
  switch (hub) {
    case 'admin':
      return role === 'admin';
    case 'brand':
      return [
        'brand',
        'manufacturer',
        'supplier',
        'designer',
        'technologist',
        'production_manager',
        'finance_manager',
        'sales_rep',
        'merchandiser',
      ].includes(role);
    case 'shop':
      return [
        'retailer',
        'buyer',
        'distributor',
        'sales_rep',
        'merchandiser',
        'finance_manager',
      ].includes(role);
    case 'factory':
      return ['manufacturer', 'designer', 'technologist', 'production_manager'].includes(role);
    case 'supplier':
      return role === 'supplier';
    case 'distributor':
      return role === 'distributor';
    case 'client':
      return role === 'client';
    default:
      return false;
  }
}
