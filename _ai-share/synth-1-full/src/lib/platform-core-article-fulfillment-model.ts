/**
 * Platform Core Article + Fulfillment Model
 *
 * Adds the missing real-fashion scenario: a Brand article may be produced,
 * sourced as ready-made goods, supplied from stock or fulfilled through a mixed
 * backstage route. Shop sees one Brand order lifecycle; only Brand sees the
 * internal supplier/production route.
 */

export type PlatformCoreArticleOriginType =
  | 'own_development'
  | 'ready_made_sourcing'
  | 'modified_ready_made'
  | 'carryover'
  | 'external_capsule';

export type PlatformCoreBackstageFulfillmentRoute =
  | 'brand_production'
  | 'supplier_purchase_order'
  | 'brand_stock'
  | 'mixed_execution';

export type PlatformCoreShopFacingOrderStatus =
  | 'confirmed'
  | 'in_execution'
  | 'preparing_shipment'
  | 'shipped'
  | 'accepted'
  | 'closed';

export type PlatformCoreBrandInternalFulfillmentStatus =
  | 'not_started'
  | 'supplier_po_required'
  | 'supplier_po_sent'
  | 'inbound_pending'
  | 'production_started'
  | 'qc_pending'
  | 'ready_to_ship'
  | 'partially_shipped'
  | 'closed';

export type PlatformCoreSampleStatus =
  | 'sample_only'
  | 'approved_sample'
  | 'commercial_ready'
  | 'showroom_only'
  | 'not_available_for_order';

export type PlatformCoreCommercialAvailabilityStatus =
  | 'available_to_order'
  | 'available_from_stock'
  | 'available_by_supplier'
  | 'available_by_production'
  | 'limited_allocation'
  | 'not_available';

export type PlatformCoreArticleFulfillmentProfile = {
  articleOrigin: PlatformCoreArticleOriginType;
  backstageRoute: PlatformCoreBackstageFulfillmentRoute;
  sampleStatus: PlatformCoreSampleStatus;
  commercialAvailability: PlatformCoreCommercialAvailabilityStatus;
  supplierVisibleToShop: false;
  requiresTechPack: boolean;
  requiresSupplierPo: boolean;
  requiresProductionOrder: boolean;
};

export const PLATFORM_CORE_ARTICLE_ORIGIN_FULFILLMENT_PROFILES: Record<
  PlatformCoreArticleOriginType,
  PlatformCoreArticleFulfillmentProfile
> = {
  own_development: {
    articleOrigin: 'own_development',
    backstageRoute: 'brand_production',
    sampleStatus: 'commercial_ready',
    commercialAvailability: 'available_by_production',
    supplierVisibleToShop: false,
    requiresTechPack: true,
    requiresSupplierPo: false,
    requiresProductionOrder: true,
  },
  ready_made_sourcing: {
    articleOrigin: 'ready_made_sourcing',
    backstageRoute: 'supplier_purchase_order',
    sampleStatus: 'commercial_ready',
    commercialAvailability: 'available_by_supplier',
    supplierVisibleToShop: false,
    requiresTechPack: false,
    requiresSupplierPo: true,
    requiresProductionOrder: false,
  },
  modified_ready_made: {
    articleOrigin: 'modified_ready_made',
    backstageRoute: 'mixed_execution',
    sampleStatus: 'commercial_ready',
    commercialAvailability: 'available_by_supplier',
    supplierVisibleToShop: false,
    requiresTechPack: true,
    requiresSupplierPo: true,
    requiresProductionOrder: false,
  },
  carryover: {
    articleOrigin: 'carryover',
    backstageRoute: 'brand_stock',
    sampleStatus: 'commercial_ready',
    commercialAvailability: 'available_from_stock',
    supplierVisibleToShop: false,
    requiresTechPack: false,
    requiresSupplierPo: false,
    requiresProductionOrder: false,
  },
  external_capsule: {
    articleOrigin: 'external_capsule',
    backstageRoute: 'mixed_execution',
    sampleStatus: 'commercial_ready',
    commercialAvailability: 'limited_allocation',
    supplierVisibleToShop: false,
    requiresTechPack: true,
    requiresSupplierPo: true,
    requiresProductionOrder: false,
  },
} as const;

export function getPlatformCoreArticleFulfillmentProfile(
  articleOrigin: PlatformCoreArticleOriginType
): PlatformCoreArticleFulfillmentProfile {
  return PLATFORM_CORE_ARTICLE_ORIGIN_FULFILLMENT_PROFILES[articleOrigin];
}

export function isPlatformCoreSupplierBackstageRoute(
  articleOrigin: PlatformCoreArticleOriginType
): boolean {
  return getPlatformCoreArticleFulfillmentProfile(articleOrigin).requiresSupplierPo;
}

export function isPlatformCoreProductionBackstageRoute(
  articleOrigin: PlatformCoreArticleOriginType
): boolean {
  return getPlatformCoreArticleFulfillmentProfile(articleOrigin).requiresProductionOrder;
}

export function getPlatformCoreShopFacingStatusFromInternalStatus(
  internalStatus: PlatformCoreBrandInternalFulfillmentStatus
): PlatformCoreShopFacingOrderStatus {
  switch (internalStatus) {
    case 'not_started':
    case 'supplier_po_required':
    case 'supplier_po_sent':
    case 'inbound_pending':
    case 'production_started':
    case 'qc_pending':
      return 'in_execution';
    case 'ready_to_ship':
      return 'preparing_shipment';
    case 'partially_shipped':
      return 'shipped';
    case 'closed':
      return 'closed';
  }
}
