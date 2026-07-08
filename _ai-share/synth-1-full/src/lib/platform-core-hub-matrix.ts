/**
 * Platform Core hub: матрица «роль × столп» — у каждой роли свой функционал
 * внутри общих пяти столпов (не дублирование одних и тех же экранов).
 */
import {
  ROUTES,
  brandB2bOrderHandoffContextHref,
  brandB2bOrderHref,
  brandB2bOrdersAwaitingHandoffRegistryHref,
  shopB2bOrderHref,
  shopB2bOrderProductionContextHref,
  shopB2bOrdersProductionRegistryHref,
  shopB2bTrackingOrderHref,
  brandCalendarB2bOrderContextHref,
  brandDevelopmentCabinetHref,
  brandMessagesB2bOrderContextHref,
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/platform-core-routes';
import {
  type PlatformCoreDemoContext,
  PLATFORM_CORE_COLLECTION_PRESETS,
  PLATFORM_CORE_DEMO,
  PLATFORM_CORE_DEMO_PRESETS,
  PLATFORM_CORE_EMPTY_CHAIN_COLLECTION_ID,
  PLATFORM_CORE_W2_HYDRATE_COLLECTION_IDS,
  getPlatformCoreDemo,
  getPlatformCoreCollectionLabel,
  platformCoreDemoForArticle,
  isPlatformCoreEmptyChainCollection,
  isPlatformCoreEmptyChainDemo,
  mergePlatformCoreDemoWithActiveOrder,
  resolvePageCollectionId,
  resolvePlatformCoreCollectionId,
  resolvePlatformCoreDemoPresetForArticleId,
} from '@/lib/platform-core-demo-context';
import {
  appendPlatformCoreContextToHref,
  buildPlatformCoreContextQuery,
  buildPlatformCoreContextSearchParams,
  type PlatformCoreContextQueryStyle,
} from '@/lib/platform-core-hub-matrix-context';
import {
  factoryMaterialsCatalogHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix-demo-hrefs-extended';
import { getRolePillarDemoHrefForDemo } from '@/lib/platform-core-hub-matrix-role-pillar-hrefs';
import {
  factoryDossierHrefForDemo,
  factoryHandoffQueueHrefForDemo,
} from '@/lib/platform-core-hub-matrix-extended-peers';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  rewriteHrefForDemo,
  rewriteHubTextForDemo,
  rewriteLabelForDemo,
} from '@/lib/platform-core-hub-matrix-demo-rewrite';
import { platformCoreRolePillarHref } from '@/lib/platform-core-hub-matrix-peers';
import { PLATFORM_CORE_HUB_ROWS } from '@/lib/platform-core-hub-matrix-rows-all';
import { filterPlatformCoreHubRowsForBaseline } from '@/lib/platform-core-article-spine';
import {
  PLATFORM_CORE_CHAIN_LEAD,
  PLATFORM_CORE_HUB_HEADING,
  PLATFORM_CORE_PILLAR_DEMO_ENTITY,
  PLATFORM_CORE_PILLARS,
  buildPillarEntityLabels,
} from '@/lib/platform-core-hub-matrix-pillars';
import type {
  CoreChainRoleId,
  CoreHubAction,
  CoreHubCell,
  CoreHubPillarId,
  CoreHubRoleRow,
} from '@/lib/platform-core-hub-matrix.types';
import { PLATFORM_CORE_ROLE_LABELS } from '@/lib/platform-core-hub-matrix.types';

export type { PlatformCoreDemoContext };
export {
  PLATFORM_CORE_COLLECTION_PRESETS,
  PLATFORM_CORE_DEMO,
  PLATFORM_CORE_DEMO_PRESETS,
  PLATFORM_CORE_EMPTY_CHAIN_COLLECTION_ID,
  PLATFORM_CORE_W2_HYDRATE_COLLECTION_IDS,
  getPlatformCoreDemo,
  getPlatformCoreCollectionLabel,
  platformCoreDemoForArticle,
  isPlatformCoreEmptyChainCollection,
  isPlatformCoreEmptyChainDemo,
  mergePlatformCoreDemoWithActiveOrder,
  resolvePageCollectionId,
  resolvePlatformCoreCollectionId,
};
export type {
  CoreChainRoleId,
  CoreHubAction,
  CoreHubCell,
  CoreHubPillarId,
  CoreHubRoleRow,
} from '@/lib/platform-core-hub-matrix.types';
export type { PlatformCoreContextQueryStyle } from '@/lib/platform-core-hub-matrix-context';
export { PLATFORM_CORE_ROLE_LABELS } from '@/lib/platform-core-hub-matrix.types';
export {
  appendPlatformCoreContextToHref,
  buildPlatformCoreContextQuery,
  buildPlatformCoreContextSearchParams,
} from '@/lib/platform-core-hub-matrix-context';
export {
  brandLinesheetsHrefForDemo,
  brandShowroomHrefForDemo,
  shopShowroomHrefForDemo,
} from '@/lib/platform-core-hub-matrix-demo-hrefs';
export {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsCatalogHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix-demo-hrefs-extended';
export {
  PLATFORM_CORE_HUB_ROWS,
  PLATFORM_CORE_BASELINE_ROWS,
  PLATFORM_CORE_EXTENDED_ROWS,
} from '@/lib/platform-core-hub-matrix-rows-all';

/** Hub UI: brand + shop по умолчанию; 4 роли при `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`. */
export function getPlatformCoreHubRowsForUi(): readonly CoreHubRoleRow[] {
  return filterPlatformCoreHubRowsForBaseline(PLATFORM_CORE_HUB_ROWS);
}
export {
  PLATFORM_CORE_CHAIN_LEAD,
  PLATFORM_CORE_HUB_HEADING,
  PLATFORM_CORE_PILLARS,
  buildPillarEntityLabels,
} from '@/lib/platform-core-hub-matrix-pillars';

export function getPlatformCoreDemoByOrderId(orderId: string): PlatformCoreDemoContext {
  const preset = Object.values(PLATFORM_CORE_DEMO_PRESETS).find((p) => p.demoOrderId === orderId);
  return preset ?? PLATFORM_CORE_DEMO;
}

export function getPlatformCoreDemoByArticleId(articleId: string): PlatformCoreDemoContext {
  return resolvePlatformCoreDemoPresetForArticleId(articleId);
}

export function buildPlatformCoreDemoTrail(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): ReadonlyArray<{
  pillarId: CoreHubPillarId;
  label: string;
  href: string;
}> {
  const { collectionId, demoOrderId, demoArticleId } = demo;
  const brandDevelopmentHref = brandDevelopmentCabinetHref(collectionId);
  const shopMatrixHref = `${ROUTES.shop.b2bMatrix}?collection=${collectionId}`;
  const shopShowroomHref = `${ROUTES.shop.b2bShowroom}?collection=${collectionId}`;
  const factoryDossierHref = factoryDossierHrefForDemo(demo);
  return [
    { pillarId: 'development', label: 'Цех разработки', href: brandDevelopmentHref },
    { pillarId: 'sample_collection', label: 'Витрина коллекции', href: shopShowroomHref },
    { pillarId: 'collection_order', label: 'Матрица', href: shopMatrixHref },
    { pillarId: 'collection_order', label: 'Заказ', href: shopB2bOrderHref(demoOrderId) },
    {
      pillarId: 'order_production',
      label: 'Передача в цех',
      href: factoryHandoffQueueHrefForDemo(demo),
    },
    { pillarId: 'order_production', label: 'Досье', href: factoryDossierHref },
    {
      pillarId: 'comms',
      label: 'Чат по заказу',
      href: brandMessagesB2bOrderContextHref(demoOrderId),
    },
  ];
}

/** Primary hub link для столпа в chain-overview (по demo-контексту коллекции). */
export function getPrimaryPillarHrefForDemo(
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  const brandDemo = getRolePillarDemoHrefForDemo('brand', pillarId, demo);
  return brandDemo ? rewriteHrefForDemo(brandDemo, demo) : '/platform';
}

export { getRolePillarDemoHrefForDemo } from '@/lib/platform-core-hub-matrix-role-pillar-hrefs';

/** Demo trail для SS27 — быстрые ссылки hub/overview. */
export const PLATFORM_CORE_DEMO_TRAIL = buildPlatformCoreDemoTrail(PLATFORM_CORE_DEMO);

export function getDemoTrailPrimaryHref(pillarId: CoreHubPillarId): string | undefined {
  return getDemoTrailPrimaryHrefForDemo(pillarId, PLATFORM_CORE_DEMO);
}

/** Рабочий экран роли в столпе с demo-контекстом в query (Platform Core mode). */
export function getRolePillarWorkspaceHref(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  const demoHref = getRolePillarDemoHrefForDemo(roleId, pillarId, demo);
  if (!demoHref) {
    return platformCoreRolePillarHref(roleId, pillarId, demo.collectionId);
  }
  const nativeHref = rewriteHrefForDemo(demoHref, demo);
  return appendPlatformCoreContextToHref(nativeHref, demo);
}

export function getRoleAdjacentPillarWorkspaceHref(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  direction: 'prev' | 'next',
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string | null {
  const adj = getAdjacentPillars(pillarId);
  const target = direction === 'prev' ? adj.prev : adj.next;
  if (!target) return null;
  return getRolePillarWorkspaceHref(roleId, target, demo);
}

/** Ссылка столпа в chain strip: trail на hub, workspace при highlightRole. */
export function getChainStripPillarHref(
  pillarId: CoreHubPillarId,
  options?: {
    highlightRole?: CoreChainRoleId;
    primaryHref?: string;
    demo?: PlatformCoreDemoContext;
  }
): string {
  const demo = options?.demo ?? PLATFORM_CORE_DEMO;
  if (options?.highlightRole) {
    return getRolePillarWorkspaceHref(options.highlightRole, pillarId, demo);
  }
  return getDemoTrailPrimaryHrefForDemo(pillarId, demo) ?? options?.primaryHref ?? '/platform';
}

export function getPlatformCoreHubRow(roleId: CoreChainRoleId): CoreHubRoleRow | undefined {
  return PLATFORM_CORE_HUB_ROWS.find((r) => r.id === roleId);
}

export function isCoreHubPillarId(value: string): value is CoreHubPillarId {
  return PLATFORM_CORE_PILLARS.some((p) => p.id === value);
}

/** Первый активный столп роли — стартовая вкладка в кабинете. */
export function getDefaultPillarForRole(roleId: CoreChainRoleId): CoreHubPillarId {
  const row = getPlatformCoreHubRow(roleId);
  if (!row) return 'development';
  const first = PLATFORM_CORE_PILLARS.find((p) => row.pillars[p.id].kind === 'active');
  return first?.id ?? 'development';
}

export function countActivePillarsForRole(roleId: CoreChainRoleId): number {
  const row = getPlatformCoreHubRow(roleId);
  if (!row) return 0;
  return PLATFORM_CORE_PILLARS.filter((p) => row.pillars[p.id].kind === 'active').length;
}

export function countEmptyPillarsForRole(roleId: CoreChainRoleId): number {
  return PLATFORM_CORE_PILLARS.length - countActivePillarsForRole(roleId);
}

/** Сквозной объект столпа (подписи для hub/cross-role, без технических id). */
export { PLATFORM_CORE_PILLAR_DEMO_ENTITY } from '@/lib/platform-core-hub-matrix-pillars';

export function getPlatformCorePillarEntityLabel(pillarId: CoreHubPillarId): string {
  return PLATFORM_CORE_PILLAR_DEMO_ENTITY[pillarId];
}

/** Как столп стыкуется между ролями в цепочке. */
export const PLATFORM_CORE_PILLAR_HANDOFF_RU: Record<CoreHubPillarId, string> = {
  development:
    'Бренд ведёт разработку и этапы согласования → цех шьёт образец по досье → поставщик уточняет цену через чат и закрывает материалы под артикул.',
  sample_collection:
    'Бренд публикует лайншиты и витрину → магазин открывает презентацию коллекции перед матрицей.',
  collection_order:
    'Магазин формирует матрицу и отправляет заказ → бренд принимает и готовит передачу в производство.',
  order_production:
    'Бренд подтверждает передачу → цех выпускает производственный заказ по техзаданию → поставщик обеспечивает сырьё по спецификации.',
  comms:
    'Все роли в одних контекстных тредах: артикул разработки, оптовый заказ коллекции, производственный заказ и логистика поставки.',
};

export function getPlatformCorePillarHandoffRuForDemo(
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  return rewriteLabelForDemo(PLATFORM_CORE_PILLAR_HANDOFF_RU[pillarId], demo);
}

export type { PillarCrossRolePeer } from '@/lib/platform-core-hub-matrix-peers';
export {
  getCrossRolePeerDemoHrefForDemo,
  getPillarCrossRolePeers,
  getPillarCrossRolePeersForDemo,
  getRoleGoldenPathQuickLinks,
  platformCoreRolePillarHref,
} from '@/lib/platform-core-hub-matrix-peers';
export {
  rewriteHrefForDemo,
  rewriteHubTextForDemo,
} from '@/lib/platform-core-hub-matrix-demo-rewrite';

export function getAdjacentPillars(pillarId: CoreHubPillarId): {
  prev: CoreHubPillarId | null;
  next: CoreHubPillarId | null;
} {
  const idx = PLATFORM_CORE_PILLARS.findIndex((p) => p.id === pillarId);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? PLATFORM_CORE_PILLARS[idx - 1].id : null,
    next: idx < PLATFORM_CORE_PILLARS.length - 1 ? PLATFORM_CORE_PILLARS[idx + 1].id : null,
  };
}

export function getRoleAdjacentPillarHref(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  direction: 'prev' | 'next'
): string | null {
  const adj = getAdjacentPillars(pillarId);
  const target = direction === 'prev' ? adj.prev : adj.next;
  if (!target) return null;
  return platformCoreRolePillarHref(roleId, target);
}

/** Ссылка на столп с учётом роли: кабинет или demo-экран бренда на hub. */
export function getPillarLinkForRole(
  roleId: CoreChainRoleId | undefined,
  pillarId: CoreHubPillarId,
  fallbackHref: string
): string {
  if (roleId) {
    const row = getPlatformCoreHubRow(roleId);
    if (row?.pillars[pillarId].kind === 'active') {
      return platformCoreRolePillarHref(roleId, pillarId);
    }
  }
  const brand = getPlatformCoreHubRow('brand');
  const brandCell = brand?.pillars[pillarId];
  if (brandCell?.kind === 'active' && brandCell.actions[0]) {
    return brandCell.actions[0].href;
  }
  return fallbackHref || '/platform';
}

export function isRolePillarActive(roleId: CoreChainRoleId, pillarId: CoreHubPillarId): boolean {
  const row = getPlatformCoreHubRow(roleId);
  return row?.pillars[pillarId]?.kind === 'active';
}

export function getActivePillarIdsForRole(roleId: CoreChainRoleId): CoreHubPillarId[] {
  const row = getPlatformCoreHubRow(roleId);
  if (!row) return [];
  return PLATFORM_CORE_PILLARS.filter((p) => row.pillars[p.id].kind === 'active').map((p) => p.id);
}

export function countPillarActiveRoles(pillarId: CoreHubPillarId): number {
  return PLATFORM_CORE_HUB_ROWS.filter((r) => r.pillars[pillarId].kind === 'active').length;
}

/**
 * Канонический demo-экран роли в столпе (для cross-role / handoff-peer-demo).
 * Согласован с golden path, но учитывает срез роли — не всегда = actions[0].
 */
export function getRolePillarDemoHref(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): string | undefined {
  return getRolePillarDemoHrefForDemo(roleId, pillarId, PLATFORM_CORE_DEMO);
}

export function getPlatformCorePillarEntityLabelForDemo(
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  return buildPillarEntityLabels(demo)[pillarId];
}

export function getDemoTrailPrimaryHrefForDemo(
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string | undefined {
  const raw = buildPlatformCoreDemoTrail(demo).find((t) => t.pillarId === pillarId)?.href;
  return raw ? rewriteHrefForDemo(raw, demo) : undefined;
}

/** Actions ячейки матрицы с href/label под demo-коллекцию. */
export function getHubCellActionsForDemo(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO,
  options?: {
    hidePreOrders?: boolean;
    hideDiscoverLegacy?: boolean;
    hideCatalogLegacy?: boolean;
    hideBrandFactoryHub?: boolean;
  }
): CoreHubAction[] {
  const row = getPlatformCoreHubRow(roleId);
  const cell = row?.pillars[pillarId];
  if (!cell || cell.kind !== 'active') return [];
  const hidePreOrders = options?.hidePreOrders ?? isPlatformCoreMode();
  const mapped = cell.actions
    .filter((action) => !(hidePreOrders && action.href === ROUTES.brand.preOrders))
    .filter((action) => !(options?.hideCatalogLegacy && action.href === '/shop/b2b/catalog'))
    .filter((action) => !(options?.hideDiscoverLegacy && action.href === '/shop/b2b/discover'))
    .filter(
      (action) =>
        !(
          options?.hideBrandFactoryHub &&
          (action.href.includes('/brand/factories/') || action.href === ROUTES.brand.factories)
        )
    )
    .map((action, idx) => {
      let href = rewriteHrefForDemo(action.href, demo);
      if (idx > 0) {
        href = appendPlatformCoreContextToHref(href, demo);
      }
      return {
        label: rewriteLabelForDemo(action.label, demo),
        href,
      };
    });
  return roleId === 'shop' ? mapped.slice(0, 3) : mapped;
}
