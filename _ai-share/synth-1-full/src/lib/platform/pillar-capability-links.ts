/**
 * Cross-links из pillar-capability-registry → EntityLink для UI.
 */
import type { EntityLink } from '@/lib/data/entity-links';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';
import {
  getPillarCapabilityById,
  listPillarCapabilities,
  type PillarCapabilityContext,
  type PillarCapabilityEntry,
} from '@/lib/platform/pillar-capability-registry';
import { annotatePillarCrossLink } from '@/lib/platform/pillar-cross-link-order-policy';
import {
  ROUTES,
  shopB2bMatrixOrderContextHref,
  shopB2bMatrixPrepackHref,
  shopB2bMatrixReorderHref,
} from '@/lib/routes';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';

function entryToLink(entry: PillarCapabilityEntry, ctx: PillarCapabilityContext): EntityLink {
  const link = { label: entry.titleRu, href: entry.resolveHref(ctx) };
  return annotatePillarCrossLink(link, entry.id, ctx);
}

/** Связанные возможности по графу relatedIds (без дубля anchor). */
export function getPillarCapabilityCrossLinks(
  anchorId: string,
  ctx: PillarCapabilityContext = {},
  limit = 6
): EntityLink[] {
  const anchor = getPillarCapabilityById(anchorId);
  if (!anchor) return [];

  const links: EntityLink[] = [];
  const seen = new Set<string>([anchorId]);

  for (const relatedId of anchor.relatedIds) {
    if (links.length >= limit) break;
    if (seen.has(relatedId)) continue;
    const related = getPillarCapabilityById(relatedId);
    if (!related) continue;
    seen.add(relatedId);
    links.push(entryToLink(related, ctx));
  }
  return links;
}

/** Cross-links для экрана столпа×роли (live + enhance, phase now). */
export function getPillarScreenCrossLinks(
  pillar: CoreHubPillarId,
  role: CoreChainRoleId,
  ctx: PillarCapabilityContext = {},
  limit = 5
): EntityLink[] {
  const roleCtx = ctx.role ? ctx : { ...ctx, role };
  const entries = listPillarCapabilities({ pillar, role, phase: 'now' }).filter(
    (e) => e.status !== 'planned'
  );
  return entries.slice(0, limit).map((e) => entryToLink(e, roleCtx));
}

/** Shop replenishment: anchor + контекст заказа/коллекции. */
export function getShopReplenishmentWorkflowLinks(ctx: PillarCapabilityContext = {}): EntityLink[] {
  const collectionId = ctx.collectionId;
  const orderId = ctx.orderId;
  const base = getPillarCapabilityCrossLinks('co-replenishment-workspace', ctx, 8);

  const contextual: EntityLink[] = [];
  if (collectionId) {
    contextual.push({
      label: 'Pre-pack · matrix',
      href: shopB2bMatrixPrepackHref(collectionId, orderId),
    });
    contextual.push({
      label: 'Матрица коллекции',
      href: orderId
        ? shopB2bMatrixReorderHref(collectionId, orderId)
        : `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`,
    });
  }
  if (orderId && !collectionId) {
    contextual.push({
      label: 'Матрица заказа',
      href: shopB2bMatrixOrderContextHref(orderId),
    });
  }
  if (orderId) {
    contextual.push({
      label: 'Inventory reconcile',
      href: `${ROUTES.shop.inventory}?${PILLAR_CAPABILITY_FEATURE_PARAM}=reconcile`,
    });
    contextual.push({
      label: 'Трекинг заказа',
      href: `${ROUTES.shop.b2bTracking}?order=${encodeURIComponent(orderId)}`,
    });
  }

  const seen = new Set<string>();
  return [...contextual, ...base].filter((l) => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
}

/** Brand W2 / release: development + sample_collection bridge. */
export function getBrandDevelopmentReleaseLinks(ctx: PillarCapabilityContext = {}): EntityLink[] {
  return getPillarCapabilityCrossLinks('dev-sample-lifecycle', ctx, 5);
}
