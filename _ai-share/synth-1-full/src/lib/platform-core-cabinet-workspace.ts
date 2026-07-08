/**
 * Embedded pillar workspaces в RoleCoreCabinetHub (кольцо A).
 * Sidebar / audit section → `?pillar=…&section=…` на core cabinet роли.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';
import {
  isArticleSpineArchiveSection,
  isPlatformCoreArticleSpineMode,
} from '@/lib/platform-core-article-spine';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/platform-core-routes'
import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import {
  isDefaultPlatformCoreCollectionId,
  omitDefaultCollectionSearchParam,
} from '@/lib/platform-core-url-canon';

export const SHOP_CO_MATRIX_SECTION = 'shop-co-matrix';

export type PlatformCoreEmbeddedWorkspaceKey = `${CoreChainRoleId}:${CoreHubPillarId}`;

const EMBEDDED: readonly PlatformCoreEmbeddedWorkspaceKey[] = [
  'brand:development',
  'brand:collection_order',
  'shop:collection_order',
  'manufacturer:order_production',
  'manufacturer:comms',
  'supplier:development',
  'supplier:order_production',
  'supplier:comms',
];

/** Первый рабочий раздел столпа (если `section` не задан в URL). */
export const PLATFORM_CORE_CABINET_DEFAULT_SECTION: Partial<
  Record<CoreChainRoleId, Partial<Record<CoreHubPillarId, string>>>
> = {
  brand: { development: 'brand-dev-w2-hub', collection_order: 'brand-co-registry' },
  shop: { collection_order: 'shop-co-matrix' },
  manufacturer: {
    order_production: 'mfr-op-handoff-queue',
    comms: 'mfr-cm-order',
  },
  supplier: {
    development: 'sup-dev-bom',
    order_production: 'sup-op-procurement',
    comms: 'sup-cm-order',
  },
};

export const BRAND_DEV_W2_HUB_SECTION = 'brand-dev-w2-hub';
export const BRAND_DEV_DOSSIER_SECTION = 'brand-dev-dossier';

/** Hub артикулов (список/создание) vs досье выбранного артикула. */
export function shouldShowBrandDevelopmentArticleWorkspace(
  sectionId: string | null | undefined,
  articleId: string | null | undefined
): boolean {
  const article = articleId?.trim();
  if (!article || article.startsWith('__')) return false;
  const section = sectionId?.trim();
  if (!section) return true;
  return section !== BRAND_DEV_W2_HUB_SECTION;
}

export function brandDevelopmentArticlesHubCabinetHref(
  collectionId: string,
  demo: Pick<PlatformCoreDemoContext, 'collectionId' | 'demoOrderId' | 'demoArticleId'>
): string {
  return platformCoreCabinetSectionHref('brand', 'development', BRAND_DEV_W2_HUB_SECTION, {
    ...demo,
    collectionId,
    demoArticleId: '',
  });
}

export function brandDevelopmentDossierCabinetHref(
  collectionId: string,
  articleId: string,
  demo: Pick<PlatformCoreDemoContext, 'collectionId' | 'demoOrderId' | 'demoArticleId'>
): string {
  return platformCoreCabinetSectionHref('brand', 'development', BRAND_DEV_DOSSIER_SECTION, {
    ...demo,
    collectionId,
    demoArticleId: articleId,
  });
}

export function roleCoreCabinetBasePath(roleId: CoreChainRoleId): string {
  switch (roleId) {
    case 'brand':
      return ROUTES.brand.coreCabinet;
    case 'shop':
      return ROUTES.shop.coreCabinet;
    case 'manufacturer':
      return EXTENDED_ROUTES.factory.productionCoreCabinet;
    case 'supplier':
      return EXTENDED_ROUTES.factory.supplierCoreCabinet;
    default:
      return ROUTES.brand.coreCabinet;
  }
}

/** Канонический query для входа в core-кабинет роли (без collection=SS27). */
export function buildRoleCoreCabinetQueryString(input: {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  collectionId?: string;
  sectionId?: string | null;
  orderId?: string | null;
  articleId?: string | null;
  baseParams?: URLSearchParams;
}): string {
  const params = new URLSearchParams(input.baseParams?.toString() ?? '');
  params.set('pillar', input.pillarId);
  const section = input.sectionId?.trim();
  if (section) params.set('section', section);
  else params.delete('section');
  const collectionId = input.collectionId?.trim();
  if (collectionId && !isDefaultPlatformCoreCollectionId(collectionId)) {
    params.set('collection', collectionId);
  } else {
    params.delete('collection');
  }
  const orderId = input.orderId?.trim();
  if (orderId && !orderId.startsWith('__')) params.set('order', orderId);
  else params.delete('order');
  const articleId = input.articleId?.trim();
  if (articleId && !articleId.startsWith('__')) params.set('article', articleId);
  else params.delete('article');
  return omitDefaultCollectionSearchParam(params).toString();
}

export function roleCoreCabinetHref(input: {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  collectionId?: string;
  sectionId?: string | null;
  orderId?: string | null;
  articleId?: string | null;
}): string {
  const qs = buildRoleCoreCabinetQueryString(input);
  return qs
    ? `${roleCoreCabinetBasePath(input.roleId)}?${qs}`
    : roleCoreCabinetBasePath(input.roleId);
}

export function platformCoreCabinetSectionHref(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  sectionId: string,
  demo: Pick<PlatformCoreDemoContext, 'collectionId' | 'demoOrderId' | 'demoArticleId'>
): string {
  const sp = new URLSearchParams({
    pillar: pillarId,
    collection: demo.collectionId,
    section: sectionId,
  });
  const orderId = demo.demoOrderId?.trim();
  if (orderId && !orderId.startsWith('__')) sp.set('order', orderId);
  const articleId = demo.demoArticleId?.trim();
  const skipArticleForBrandDevHub =
    roleId === 'brand' && pillarId === 'development' && sectionId === BRAND_DEV_W2_HUB_SECTION;
  if (articleId && !articleId.startsWith('__') && !skipArticleForBrandDevHub) {
    if (
      pillarId === 'development' ||
      pillarId === 'collection_order' ||
      sectionId.includes('dossier') ||
      sectionId.includes('bom') ||
      sectionId.includes('materials') ||
      sectionId.includes('procurement')
    ) {
      sp.set('article', articleId);
    }
  }
  return `${roleCoreCabinetBasePath(roleId)}?${sp.toString()}`;
}

/** Native `/shop/core` tabs матрицы CO (matrix / inspector / prepack) — без legacy `/shop/b2b/matrix`. */
export function shopCoMatrixEmbeddedTabHref(
  featureId: 'matrix' | 'inspector' | 'prepack',
  input: { collectionId: string; orderId?: string; articleId?: string }
): string {
  const sp = new URLSearchParams({
    pillar: 'collection_order',
    section: SHOP_CO_MATRIX_SECTION,
    collection: input.collectionId.trim(),
    [PILLAR_CAPABILITY_FEATURE_PARAM]: featureId,
  });
  const orderId = input.orderId?.trim();
  if (orderId && !orderId.startsWith('__')) sp.set('order', orderId);
  const articleId = input.articleId?.trim();
  if (articleId && !articleId.startsWith('__')) sp.set('article', articleId);
  return `${ROUTES.shop.coreCabinet}?${sp.toString()}`;
}

export function isShopCoMatrixEmbeddedCabinetContext(
  pathname: string,
  sectionFromUrl: string | null | undefined
): boolean {
  return (
    sectionFromUrl === SHOP_CO_MATRIX_SECTION &&
    (pathname === '/shop/core' || pathname.endsWith('/shop/core'))
  );
}

export function hasEmbeddedPlatformCoreWorkspace(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): boolean {
  return EMBEDDED.includes(`${roleId}:${pillarId}` as PlatformCoreEmbeddedWorkspaceKey);
}

export function resolveCabinetWorkspaceSection(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  sectionFromUrl: string | null | undefined
): string | null {
  const defaultSection = PLATFORM_CORE_CABINET_DEFAULT_SECTION[roleId]?.[pillarId] ?? null;
  const trimmed = sectionFromUrl?.trim();
  if (!trimmed) return defaultSection;
  if (isPlatformCoreArticleSpineMode() && isArticleSpineArchiveSection(trimmed)) {
    return defaultSection;
  }
  return trimmed;
}
