import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { manufacturerOrderCommsFeatureHref } from '@/lib/b2b/manufacturer-order-comms';
import { shopOrderCommsTabHref } from '@/lib/b2b/shop-collection-order-hrefs';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { ROUTES } from '@/lib/routes';

export type ManufacturerCommsWorkspaceSession = {
  collectionId: string;
  orderId: string;
  factoryId: string;
  inboxHref: string;
  entitiesHref: string;
  orderTabHref: string;
  handoffHref: string;
  shopTrackingHref: string;
};

export function buildManufacturerCommsWorkspaceSession(input?: {
  collectionId?: string;
  orderId?: string;
  factoryId?: string;
}): ManufacturerCommsWorkspaceSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const factoryId = input?.factoryId?.trim() || PLATFORM_CORE_DEMO.factoryId;
  const base = `${EXTENDED_ROUTES.factory.messages}?collection=${encodeURIComponent(collectionId)}&factoryId=${encodeURIComponent(factoryId)}`;

  return {
    collectionId,
    orderId,
    factoryId,
    inboxHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=inbox`,
    entitiesHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=entities&order=${encodeURIComponent(orderId)}`,
    orderTabHref: manufacturerOrderCommsFeatureHref(orderId, collectionId, factoryId),
    handoffHref: manufacturerHandoffFeatureHref('handoff', { factoryId, collectionId, orderId }),
    shopTrackingHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
  };
}

export function manufacturerCommsWorkspaceFeatureHref(
  featureId: 'inbox' | 'entities' | 'order',
  opts?: { collectionId?: string; orderId?: string; factoryId?: string }
): string {
  const session = buildManufacturerCommsWorkspaceSession(opts);
  if (featureId === 'inbox') return session.inboxHref;
  if (featureId === 'entities') return session.entitiesHref;
  return session.orderTabHref;
}
