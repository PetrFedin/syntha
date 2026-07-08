/**
 * Cross-role peer navigation for hub matrix (handoff peers, golden path links).
 */
import {
  ROUTES,
  brandB2bOrderHref,
  brandDevelopmentCabinetHref,
  brandMessagesB2bOrderContextHref,
  shopB2bOrderHref,
  shopB2bTrackingOrderHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/platform-core-routes';
import {
  type PlatformCoreDemoContext,
  PLATFORM_CORE_DEMO,
  resolvePlatformCoreCollectionId,
} from '@/lib/platform-core-demo-context';
import { isDefaultPlatformCoreCollectionId } from '@/lib/platform-core-url-canon';
import { brandLinesheetsHrefForDemo } from '@/lib/platform-core-hub-matrix-demo-hrefs';
import {
  getExtendedCrossRolePeerDemoHrefForDemo,
  isExtendedCoreRole,
} from '@/lib/platform-core-hub-matrix-extended-peers';
import { getRolePillarDemoHrefForDemo } from '@/lib/platform-core-hub-matrix-role-pillar-hrefs';
import { PLATFORM_CORE_HUB_ROWS } from '@/lib/platform-core-hub-matrix-rows-all';
import { filterPlatformCoreHubRowsForBaseline } from '@/lib/platform-core-article-spine';
import {
  buildPillarEntityLabels,
  PLATFORM_CORE_PILLARS,
} from '@/lib/platform-core-hub-matrix-pillars';
import type {
  CoreChainRoleId,
  CoreHubPillarId,
  CoreHubRoleRow,
} from '@/lib/platform-core-hub-matrix.types';
import {
  rewriteHrefForDemo,
  rewriteLabelForDemo,
} from '@/lib/platform-core-hub-matrix-demo-rewrite';

export type PillarCrossRolePeer = {
  roleId: CoreChainRoleId;
  label: string;
  participates: boolean;
  cabinetHref: string;
  title: string;
  demoEntityRu: string;
  demoHref?: string;
};

function getPlatformCoreHubRowsForUi(): readonly CoreHubRoleRow[] {
  return filterPlatformCoreHubRowsForBaseline(PLATFORM_CORE_HUB_ROWS);
}

function getPlatformCoreHubRow(roleId: CoreChainRoleId): CoreHubRoleRow | undefined {
  return PLATFORM_CORE_HUB_ROWS.find((r) => r.id === roleId);
}

export function platformCoreRolePillarHref(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  collectionId?: string
): string {
  const row = getPlatformCoreHubRow(roleId);
  if (!row) return '/platform';
  const params = new URLSearchParams({ pillar: pillarId });
  const cid = collectionId?.trim();
  const resolved = cid ? resolvePlatformCoreCollectionId(cid) : undefined;
  if (resolved && !isDefaultPlatformCoreCollectionId(resolved)) {
    params.set('collection', resolved);
  }
  return `${row.landingHref}?${params.toString()}`;
}

function getPlatformCorePillarEntityLabelForDemo(
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  return buildPillarEntityLabels(demo)[pillarId];
}

/** Другие роли в том же столпе — для handoff из кабинета. */
export function getPillarCrossRolePeers(
  viewerRoleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): PillarCrossRolePeer[] {
  return getPillarCrossRolePeersForDemo(viewerRoleId, pillarId, PLATFORM_CORE_DEMO);
}

/** Рабочий экран peer-роли с учётом viewer — без dead-end (магазин → handoff бренда). */
export function getCrossRolePeerDemoHrefForDemo(
  viewerRoleId: CoreChainRoleId,
  peerRoleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string | undefined {
  const orderId = demo.demoOrderId.trim();

  if (isExtendedCoreRole(viewerRoleId) || isExtendedCoreRole(peerRoleId)) {
    const extended = getExtendedCrossRolePeerDemoHrefForDemo(
      viewerRoleId,
      peerRoleId,
      pillarId,
      demo
    );
    if (extended) return extended;
  }

  if (pillarId === 'comms') {
    if (viewerRoleId === 'brand' && peerRoleId === 'shop') {
      return shopMessagesB2bOrderContextHref(orderId);
    }
    if (viewerRoleId === 'shop' && peerRoleId === 'brand') {
      return brandMessagesB2bOrderContextHref(orderId);
    }
  }

  if (pillarId === 'order_production') {
    if (viewerRoleId === 'brand' && peerRoleId === 'shop') {
      return shopB2bTrackingOrderHref(orderId);
    }
    if (viewerRoleId === 'shop' && peerRoleId === 'brand') {
      return shopB2bOrderHref(orderId);
    }
  }

  if (pillarId === 'development') {
    const showroomHref = `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(demo.collectionId)}`;
    const brandDevHref = brandDevelopmentCabinetHref(demo.collectionId);
    if (viewerRoleId === 'brand' && peerRoleId === 'shop') return showroomHref;
    if (viewerRoleId === 'shop' && peerRoleId === 'brand') return brandDevHref;
  }

  if (pillarId === 'sample_collection') {
    if (viewerRoleId === 'brand' && peerRoleId === 'shop') {
      return `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(demo.collectionId)}`;
    }
    if (viewerRoleId === 'shop' && peerRoleId === 'brand') {
      return brandLinesheetsHrefForDemo(demo);
    }
  }

  if (viewerRoleId === 'shop' && peerRoleId === 'brand' && pillarId === 'order_production') {
    return shopB2bOrderHref(orderId);
  }
  if (viewerRoleId === 'shop' && peerRoleId === 'brand' && pillarId === 'collection_order') {
    return brandB2bOrderHref(orderId);
  }
  if (viewerRoleId === 'brand' && peerRoleId === 'shop' && pillarId === 'collection_order') {
    return shopB2bTrackingOrderHref(orderId);
  }
  if (viewerRoleId === 'brand' && peerRoleId === 'shop' && pillarId === 'sample_collection') {
    return `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(demo.collectionId)}`;
  }
  return getRolePillarDemoHrefForDemo(peerRoleId, pillarId, demo);
}

export function getPillarCrossRolePeersForDemo(
  viewerRoleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): PillarCrossRolePeer[] {
  const collectionId =
    demo.collectionId !== PLATFORM_CORE_DEMO.collectionId ? demo.collectionId : undefined;
  return getPlatformCoreHubRowsForUi()
    .filter((r) => r.id !== viewerRoleId)
    .map((row) => {
      const cell = row.pillars[pillarId];
      const participates = cell.kind === 'active';
      return {
        roleId: row.id,
        label: row.label,
        participates,
        cabinetHref: platformCoreRolePillarHref(row.id, pillarId, collectionId),
        title: participates ? cell.title : cell.reason,
        demoEntityRu: getPlatformCorePillarEntityLabelForDemo(pillarId, demo),
        demoHref: (() => {
          if (!participates) return undefined;
          const href = getCrossRolePeerDemoHrefForDemo(viewerRoleId, row.id, pillarId, demo);
          return href ? rewriteHrefForDemo(href, demo) : undefined;
        })(),
      };
    });
}

/** Дедуплированные рабочие ссылки роли для strip «Цепочка» в кабинете. */
export function getRoleGoldenPathQuickLinks(
  roleId: CoreChainRoleId,
  navPillarIds: readonly CoreHubPillarId[],
  max = 6
): Array<{ label: string; href: string }> {
  const row = getPlatformCoreHubRow(roleId);
  if (!row) return [];
  const seen = new Set<string>();
  const out: Array<{ label: string; href: string }> = [];
  for (const pillarId of navPillarIds) {
    const cell = row.pillars[pillarId];
    if (cell.kind !== 'active' || !cell.actions?.length) continue;
    for (const action of cell.actions) {
      if (!action.href || seen.has(action.href)) continue;
      seen.add(action.href);
      out.push(action);
      if (out.length >= max) return out;
    }
  }
  return out;
}

export { rewriteLabelForDemo };
