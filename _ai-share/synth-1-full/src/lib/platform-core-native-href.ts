/**
 * Platform Core — native href coercion (UI isolation layer).
 * При MODE=1 переписывает legacy long-tail URL в кабинеты /platform/*.
 * Legacy-каталог (архив): `_archive/platform-core-legacy-escapes/`.
 */

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import {
  PLATFORM_CORE_B2B_BASE,
  PLATFORM_CORE_B2B_HUB_HREF,
  PLATFORM_CORE_B2B_PARTNERS_HREF,
} from '@/lib/platform-core-mode-surfaces';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  ROUTES,
  brandB2bOrderHref,
  brandDevelopmentCabinetHref,
  brandDevelopmentArticleHref,
  platformHubHref,
  shopB2bOrderHref,
} from '@/lib/platform-core-routes';
import { SHOP_CO_MATRIX_SECTION } from '@/lib/platform-core-cabinet-workspace';

const LEGACY_WORKSHOP2_PREFIX = '/brand/production/workshop2';

function parseHref(href: string): { pathname: string; search: string; hash: string } {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    const u = new URL(href);
    return { pathname: u.pathname, search: u.search, hash: u.hash };
  }
  const hashIdx = href.indexOf('#');
  const hash = hashIdx >= 0 ? href.slice(hashIdx) : '';
  const beforeHash = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const qIdx = beforeHash.indexOf('?');
  if (qIdx >= 0) {
    return {
      pathname: beforeHash.slice(0, qIdx) || '/',
      search: beforeHash.slice(qIdx),
      hash,
    };
  }
  return { pathname: beforeHash || '/', search: '', hash };
}

function readParam(search: string, key: string): string | undefined {
  if (!search) return undefined;
  const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return sp.get(key)?.trim() || undefined;
}

function collectionFromHref(
  pathname: string,
  search: string,
  demo: PlatformCoreDemoContext
): string {
  return (
    readParam(search, 'collection') ??
    readParam(search, 'w2col') ??
    demo.collectionId ??
    PLATFORM_CORE_DEMO.collectionId
  );
}

function shopCoreHref(
  pillar: 'sample_collection' | 'collection_order' | 'order_production' | 'comms' | 'development',
  collectionId: string,
  extra?: Record<string, string>
): string {
  const sp = new URLSearchParams({ pillar, collection: collectionId });
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v.trim()) sp.set(k, v.trim());
    }
  }
  return `${ROUTES.shop.coreCabinet}?${sp.toString()}`;
}

function brandCoreHref(
  pillar: 'development' | 'sample_collection' | 'collection_order' | 'order_production' | 'comms',
  collectionId: string,
  extra?: Record<string, string>
): string {
  const sp = new URLSearchParams({ pillar, collection: collectionId });
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v.trim()) sp.set(k, v.trim());
    }
  }
  return `${ROUTES.brand.coreCabinet}?${sp.toString()}`;
}

function factoryCoreHref(
  role: 'manufacturer' | 'supplier',
  pillar: string,
  collectionId: string,
  extra?: Record<string, string>
): string {
  const base =
    role === 'supplier' ? ROUTES.factory.supplierCoreCabinet : ROUTES.factory.productionCoreCabinet;
  const sp = new URLSearchParams({ pillar, collection: collectionId });
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v.trim()) sp.set(k, v.trim());
    }
  }
  return `${base}?${sp.toString()}`;
}

function platformB2bFeatureHref(collectionId: string, feature: string, orderId?: string): string {
  void platformB2bFeatureHref;
  const sp = new URLSearchParams({
    collection: collectionId,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: feature,
  });
  if (orderId?.trim()) {
    sp.set('order', orderId.trim());
    sp.set('orderId', orderId.trim());
  }
  return `${PLATFORM_CORE_B2B_BASE}?${sp.toString()}`;
}

/** Native checkout — кабинет shop collection_order (write через native panels). */
export function platformCoreNativeCheckoutHref(
  collectionId: string,
  opts?: { buyerId?: string; orderId?: string }
): string {
  const extra: Record<string, string> = {
    section: 'shop-co-checkout',
    [PILLAR_CAPABILITY_FEATURE_PARAM]: 'checkout',
  };
  if (opts?.buyerId?.trim()) extra.buyer = opts.buyerId.trim();
  if (opts?.orderId?.trim()) {
    extra.order = opts.orderId.trim();
    extra.orderId = opts.orderId.trim();
  }
  return shopCoreHref('collection_order', collectionId, extra);
}

/** Native matrix — shop collection_order embedded section + feature matrix. */
export function platformCoreNativeMatrixHref(collectionId: string, orderId?: string): string {
  const extra: Record<string, string> = {
    section: SHOP_CO_MATRIX_SECTION,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: 'matrix',
  };
  if (orderId?.trim()) {
    extra.order = orderId.trim();
    extra.orderId = orderId.trim();
  }
  return shopCoreHref('collection_order', collectionId, extra);
}

/** Native showroom — shop sample_collection pillar. */
export function platformCoreNativeShowroomHref(collectionId: string, orderId?: string): string {
  const extra: Record<string, string> = { [PILLAR_CAPABILITY_FEATURE_PARAM]: 'showroom' };
  if (orderId?.trim()) {
    extra.order = orderId.trim();
    extra.orderId = orderId.trim();
  }
  return shopCoreHref('sample_collection', collectionId, extra);
}

/**
 * Переписать legacy href в native при PLATFORM_CORE_MODE=1.
 * Вызывается из `rewriteHrefForDemo` и напрямую из UI.
 */
export function coercePlatformCoreNativeHref(
  href: string,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  if (!isPlatformCoreMode() || !href.trim()) return href;

  const { pathname, search, hash } = parseHref(href);
  const path = pathname.replace(/\/$/, '') || '/';
  const collectionId = collectionFromHref(path, search, demo);
  const orderId = readParam(search, 'order') ?? readParam(search, 'orderId') ?? demo.demoOrderId;
  const articleId = readParam(search, 'article') ?? demo.demoArticleId;

  // Hub
  if (path === '/platform' || path.startsWith('/platform/')) {
    return href;
  }

  // Brand W2 → development cabinet
  if (path === LEGACY_WORKSHOP2_PREFIX || path.startsWith(`${LEGACY_WORKSHOP2_PREFIX}/`)) {
    const create = readParam(search, 'w2create') ?? readParam(search, 'create');
    if (articleId) {
      return brandDevelopmentArticleHref(collectionId, articleId) + hash;
    }
    return (
      brandDevelopmentCabinetHref(collectionId, undefined, {
        create: create === '1',
      }) + hash
    );
  }

  if (path === '/brand/core' || path.startsWith('/brand/core/')) return href;
  if (path === '/shop/core' || path.startsWith('/shop/core/')) return href;
  if (path === ROUTES.factory.productionCoreCabinet) return href;
  if (path === ROUTES.factory.supplierCoreCabinet) return href;

  // Brand linesheets / showroom → sample_collection cabinet
  if (path === '/brand/linesheets' || path.startsWith('/brand/linesheets/')) {
    return brandCoreHref('sample_collection', collectionId) + hash;
  }
  if (path === ROUTES.brand.showroom || path.startsWith(`${ROUTES.brand.showroom}/`)) {
    return brandCoreHref('sample_collection', collectionId) + hash;
  }
  if (path === ROUTES.brand.rangePlanner || path.startsWith(`${ROUTES.brand.rangePlanner}/`)) {
    return brandCoreHref('development', collectionId) + hash;
  }
  if (path === ROUTES.brand.materials || path.startsWith(`${ROUTES.brand.materials}/`)) {
    return (
      brandCoreHref('order_production', collectionId, {
        [PILLAR_CAPABILITY_FEATURE_PARAM]: 'materials',
      }) + hash
    );
  }
  if (
    path === ROUTES.brand.launchReadiness ||
    path.startsWith(`${ROUTES.brand.launchReadiness}/`)
  ) {
    const feature = readParam(search, PILLAR_CAPABILITY_FEATURE_PARAM) ?? 'checklist';
    return (
      brandCoreHref('sample_collection', collectionId, {
        [PILLAR_CAPABILITY_FEATURE_PARAM]: feature,
      }) + hash
    );
  }
  if (path === ROUTES.brand.retailers || path.startsWith(`${ROUTES.brand.retailers}/`)) {
    return (
      brandCoreHref('collection_order', collectionId, {
        [PILLAR_CAPABILITY_FEATURE_PARAM]: 'retailers',
      }) + hash
    );
  }
  if (path === ROUTES.brand.tasks || path.startsWith(`${ROUTES.brand.tasks}/`)) {
    return brandCoreHref('development', collectionId) + hash;
  }
  if (
    path === ROUTES.brand.productionGantt ||
    path.startsWith(`${ROUTES.brand.productionGantt}/`)
  ) {
    return (
      brandCoreHref('order_production', collectionId, orderId ? { order: orderId } : undefined) +
      hash
    );
  }

  // Shop B2B long tail → core / platform b2b
  if (path === ROUTES.shop.b2bMatrix || path.startsWith(`${ROUTES.shop.b2bMatrix}/`)) {
    return platformCoreNativeMatrixHref(collectionId, orderId) + hash;
  }
  if (path === ROUTES.shop.b2bShowroom || path.startsWith(`${ROUTES.shop.b2bShowroom}/`)) {
    return platformCoreNativeShowroomHref(collectionId, orderId) + hash;
  }
  if (path === ROUTES.shop.b2bCheckout || path.startsWith(`${ROUTES.shop.b2bCheckout}/`)) {
    return (
      platformCoreNativeCheckoutHref(collectionId, {
        buyerId: readParam(search, 'buyer'),
        orderId,
      }) + hash
    );
  }
  if (path === ROUTES.shop.b2bOrders || path.startsWith(`${ROUTES.shop.b2bOrders}/`)) {
    if (path.match(/^\/shop\/b2b\/orders\/[^/]+$/)) {
      const seg = path.split('/').pop();
      if (seg && seg !== 'orders') return shopB2bOrderHref(seg) + search + hash;
    }
    return shopCoreHref('collection_order', collectionId) + hash;
  }
  if (path === ROUTES.shop.b2bTracking) {
    return (
      shopCoreHref('order_production', collectionId, orderId ? { order: orderId } : undefined) +
      hash
    );
  }
  if (path === ROUTES.shop.b2bDiscover || path === ROUTES.shop.b2bPartnersDiscover) {
    return `${PLATFORM_CORE_B2B_PARTNERS_HREF}?collection=${encodeURIComponent(collectionId)}${hash}`;
  }
  if (path === ROUTES.shop.b2bCatalog) {
    return `${PLATFORM_CORE_B2B_HUB_HREF}?collection=${encodeURIComponent(collectionId)}${hash}`;
  }
  if (
    path === ROUTES.shop.b2bCollaborativeOrder ||
    path.startsWith(`${ROUTES.shop.b2bCollaborativeOrder}/`)
  ) {
    const tab = readParam(search, 'tab') ?? 'approvals';
    const feature = tab === 'session' ? 'collaborative' : tab;
    return (
      shopCoreHref('collection_order', collectionId, {
        [PILLAR_CAPABILITY_FEATURE_PARAM]: feature,
        ...(orderId ? { order: orderId } : {}),
      }) + hash
    );
  }
  if (path === '/shop/b2b/landed-margin' || path.startsWith('/shop/b2b/landed-margin/')) {
    const tab =
      readParam(search, PILLAR_CAPABILITY_FEATURE_PARAM) ?? readParam(search, 'tab') ?? 'pricelist';
    return (
      shopCoreHref('collection_order', collectionId, {
        [PILLAR_CAPABILITY_FEATURE_PARAM]: `margin-${tab}`,
        ...(orderId ? { order: orderId } : {}),
      }) + hash
    );
  }
  if (
    path === ROUTES.shop.b2bMarginAnalysis ||
    path.startsWith(`${ROUTES.shop.b2bMarginAnalysis}/`)
  ) {
    const feature = readParam(search, PILLAR_CAPABILITY_FEATURE_PARAM) ?? 'pricelist';
    return (
      shopCoreHref('collection_order', collectionId, {
        [PILLAR_CAPABILITY_FEATURE_PARAM]: `margin-${feature}`,
        ...(orderId ? { order: orderId } : {}),
      }) + hash
    );
  }
  if (
    path === ROUTES.shop.b2bReplenishment ||
    path.startsWith(`${ROUTES.shop.b2bReplenishment}/`)
  ) {
    const feature = readParam(search, PILLAR_CAPABILITY_FEATURE_PARAM) ?? 'stock-atp';
    return (
      shopCoreHref('collection_order', collectionId, {
        [PILLAR_CAPABILITY_FEATURE_PARAM]: feature,
        ...(orderId ? { order: orderId } : {}),
      }) + hash
    );
  }

  // Brand B2B registry — keep order detail paths (core split pages)
  if (path === ROUTES.brand.b2bOrders) {
    return brandCoreHref('collection_order', collectionId) + hash;
  }
  if (path.match(/^\/brand\/b2b-orders\/[^/]+$/)) {
    const seg = path.split('/').pop();
    if (seg) return brandB2bOrderHref(seg) + search + hash;
  }

  // Factory production home → core cabinet
  if (path === ROUTES.factory.production && !path.includes('/core')) {
    const pillar = readParam(search, 'pillar') ?? 'order_production';
    return factoryCoreHref('manufacturer', pillar, collectionId) + hash;
  }
  if (path === ROUTES.factory.supplier && !path.includes('/core')) {
    const pillar = readParam(search, 'pillar') ?? 'order_production';
    return factoryCoreHref('supplier', pillar, collectionId) + hash;
  }

  // Dossier — оставляем (native core surface)
  if (path.startsWith('/factory/production/dossier/')) {
    return href;
  }
  if (
    path === ROUTES.factory.supplierRfqInbox ||
    path.startsWith(`${ROUTES.factory.supplierRfqInbox}/`)
  ) {
    return href;
  }

  if (
    path === ROUTES.factory.productionMaterials ||
    path.startsWith(`${ROUTES.factory.productionMaterials}/`)
  ) {
    const role = readParam(search, 'role') === 'supplier' ? 'supplier' : 'manufacturer';
    const view = readParam(search, 'view');
    const feature =
      view === 'procurement'
        ? 'procurement'
        : view === 'development'
          ? 'materials-dev'
          : 'materials';
    const extra: Record<string, string> = { [PILLAR_CAPABILITY_FEATURE_PARAM]: feature };
    if (orderId) extra.order = orderId;
    return factoryCoreHref(role, 'order_production', collectionId, extra) + hash;
  }
  if (
    path === ROUTES.factory.productionCatalog ||
    path.startsWith(`${ROUTES.factory.productionCatalog}/`)
  ) {
    return (
      factoryCoreHref('supplier', 'order_production', collectionId, {
        [PILLAR_CAPABILITY_FEATURE_PARAM]: 'materials-catalog',
      }) + hash
    );
  }

  // Messages → comms pillar
  if (path === ROUTES.brand.messages || path.startsWith(`${ROUTES.brand.messages}/`)) {
    return brandCoreHref('comms', collectionId, orderId ? { order: orderId } : undefined) + hash;
  }
  if (path === ROUTES.shop.messages || path.startsWith(`${ROUTES.shop.messages}/`)) {
    return shopCoreHref('comms', collectionId, orderId ? { order: orderId } : undefined) + hash;
  }
  if (
    path === ROUTES.factory.supplierMessages ||
    path.startsWith(`${ROUTES.factory.supplierMessages}/`)
  ) {
    return (
      factoryCoreHref('supplier', 'comms', collectionId, orderId ? { order: orderId } : undefined) +
      hash
    );
  }
  if (
    path === ROUTES.factory.productionMessages ||
    path.startsWith(`${ROUTES.factory.productionMessages}/`)
  ) {
    return (
      factoryCoreHref(
        'manufacturer',
        'comms',
        collectionId,
        orderId ? { order: orderId } : undefined
      ) + hash
    );
  }

  // Fallback: unknown legacy shop/brand/factory section → hub с контекстом
  if (
    path.startsWith('/shop/b2b') ||
    path.startsWith('/brand/production') ||
    (path.startsWith('/factory/') && !path.includes('/core') && !path.includes('/dossier'))
  ) {
    return platformHubHref(collectionId) + hash;
  }

  return href;
}
