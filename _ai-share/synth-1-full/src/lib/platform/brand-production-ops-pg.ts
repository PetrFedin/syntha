import { brandProductionOpsFeatureHref } from '@/lib/brand-production/brand-production-handoff';

/** Wave XI · brand production operations console — PG SoT (`brand_production_ops_state` + spine PO/BOM). */

export const BRAND_PRODUCTION_OPS_STATE_API = '/api/brand/production/operations-state';
export const BRAND_PRODUCTION_OPS_SPINE_API = '/api/brand/production/ops';

export const BRAND_PRODUCTION_OPS_PG_BADGE_RU = 'PostgreSQL';
export const BRAND_PRODUCTION_OPS_PG_UNAVAILABLE_RU = 'PG недоступен';
export const BRAND_PRODUCTION_OPS_HANDOFF_PEER_LINK_RU = 'Передача в цех';
export const BRAND_PRODUCTION_OPS_OPERATIONS_PEER_LINK_RU = 'Операции PO/BOM';
export const BRAND_PRODUCTION_OPS_FACTORY_QUEUE_LINK_RU = 'Очередь фабрики';

export const BRAND_PRODUCTION_OPS_LS_KEY = 'brand_production_unified_v1';

export function brandProductionOpsOperationsPeerHref(
  orderId: string,
  collectionId?: string
): string {
  const base = brandProductionOpsFeatureHref(orderId, 'operations');
  if (!collectionId?.trim()) return base;
  return `${base}&collection=${encodeURIComponent(collectionId.trim())}`;
}

export function brandProductionOpsHandoffPeerHref(
  orderId: string,
  collectionId?: string
): string {
  const base = brandProductionOpsFeatureHref(orderId, 'handoff');
  if (!collectionId?.trim()) return base;
  return `${base}&collection=${encodeURIComponent(collectionId.trim())}`;
}
