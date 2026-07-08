import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { brandOrderCommsFeatureHref } from '@/lib/b2b/brand-order-comms';
import {
  brandLandedMarginTabHref,
  brandOrderCommsTabHref,
} from '@/lib/b2b/brand-collection-order-hrefs';
import {
  shopLandedMarginTabHref,
  shopOrderCommsTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import {
  ROUTES,
  factoryCalendarB2bOrderContextHref,
  factoryMessagesB2bOrderContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';

export type ManufacturerOrderCommsSession = {
  orderId: string;
  collectionId: string;
  factoryId: string;
  orderTabHref: string;
  messagesHref: string;
  calendarHref: string;
  handoffHref: string;
  shopTrackingHref: string;
  shopOrderCommsHref: string;
  brandOrderChatHref: string;
  brandOrderHandoffHref: string;
  shopLandedMarginHref: string;
  brandLandedMarginHref: string;
  productionOpsCutTicketHref: string;
  entitiesHref: string;
};

export function buildManufacturerOrderCommsSession(input?: {
  orderId?: string;
  collectionId?: string;
  factoryId?: string;
}): ManufacturerOrderCommsSession {
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const factoryId = input?.factoryId?.trim() || PLATFORM_CORE_DEMO.factoryId;
  const base = `${EXTENDED_ROUTES.factory.messages}?order=${encodeURIComponent(orderId)}&collection=${encodeURIComponent(collectionId)}&factoryId=${encodeURIComponent(factoryId)}`;
  const opsBase = `${EXTENDED_ROUTES.factory.productionOrders}?factoryId=${encodeURIComponent(factoryId)}&collection=${encodeURIComponent(collectionId)}&order=${encodeURIComponent(orderId)}`;

  return {
    orderId,
    collectionId,
    factoryId,
    orderTabHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=order`,
    messagesHref: factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' }),
    calendarHref: factoryCalendarB2bOrderContextHref(orderId),
    handoffHref: manufacturerHandoffFeatureHref('handoff', { factoryId, collectionId, orderId }),
    shopTrackingHref: `${shopB2bTrackingOrderHref(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=tracking`,
    shopOrderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    brandOrderChatHref: brandOrderCommsFeatureHref(orderId, 'chat', collectionId),
    brandOrderHandoffHref: brandOrderCommsTabHref('handoff', orderId, collectionId),
    shopLandedMarginHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    brandLandedMarginHref: brandLandedMarginTabHref('simulator', collectionId, orderId),
    productionOpsCutTicketHref: `${opsBase}&${PILLAR_CAPABILITY_FEATURE_PARAM}=cut-ticket`,
    entitiesHref: `${EXTENDED_ROUTES.factory.messages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=entities&collection=${encodeURIComponent(collectionId)}`,
  };
}

export function manufacturerOrderCommsFeatureHref(
  orderId: string,
  collectionId?: string,
  factoryId?: string
): string {
  return buildManufacturerOrderCommsSession({ orderId, collectionId, factoryId }).orderTabHref;
}
