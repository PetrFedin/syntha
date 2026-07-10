import type {
  PlatformCoreArticleOriginType,
  PlatformCoreBackstageFulfillmentRoute,
  PlatformCoreBrandInternalFulfillmentStatus,
} from '@/lib/platform-core-article-fulfillment-model';
import {
  getPlatformCoreArticleFulfillmentProfile,
  isPlatformCoreSupplierBackstageRoute,
} from '@/lib/platform-core-article-fulfillment-model';

export type PlatformCoreSupplierWorkspaceVisibility = 'brand_internal_only';

export type PlatformCoreSupplierPoStatus =
  | 'draft'
  | 'sent_to_supplier'
  | 'confirmed_by_supplier'
  | 'inbound_pending'
  | 'received'
  | 'cancelled';

export type PlatformCoreSupplierTerms = {
  currency: string;
  costPrice: number;
  moq: number;
  leadTimeDays: number;
  paymentTerms: string;
  incoterms?: string;
};

export type PlatformCoreSupplierWorkspaceItem = {
  articleOrigin: PlatformCoreArticleOriginType;
  backstageRoute: PlatformCoreBackstageFulfillmentRoute;
  visibility: PlatformCoreSupplierWorkspaceVisibility;
  supplierVisibleToShop: false;
  requiresSupplierPo: boolean;
  supplierPoStatus?: PlatformCoreSupplierPoStatus;
  internalFulfillmentStatus: PlatformCoreBrandInternalFulfillmentStatus;
  terms?: PlatformCoreSupplierTerms;
  brandOnlyNotes?: string;
};

export function createPlatformCoreSupplierWorkspaceItem(args: {
  articleOrigin: PlatformCoreArticleOriginType;
  supplierPoStatus?: PlatformCoreSupplierPoStatus;
  terms?: PlatformCoreSupplierTerms;
  brandOnlyNotes?: string;
}): PlatformCoreSupplierWorkspaceItem {
  const profile = getPlatformCoreArticleFulfillmentProfile(args.articleOrigin);
  const requiresSupplierPo = isPlatformCoreSupplierBackstageRoute(args.articleOrigin);

  return {
    articleOrigin: args.articleOrigin,
    backstageRoute: profile.backstageRoute,
    visibility: 'brand_internal_only',
    supplierVisibleToShop: false,
    requiresSupplierPo,
    supplierPoStatus: requiresSupplierPo ? args.supplierPoStatus ?? 'draft' : undefined,
    internalFulfillmentStatus: requiresSupplierPo ? 'supplier_po_required' : 'not_started',
    terms: args.terms,
    brandOnlyNotes: args.brandOnlyNotes,
  };
}

export function getPlatformCoreInternalStatusFromSupplierPoStatus(
  supplierPoStatus: PlatformCoreSupplierPoStatus
): PlatformCoreBrandInternalFulfillmentStatus {
  switch (supplierPoStatus) {
    case 'draft':
      return 'supplier_po_required';
    case 'sent_to_supplier':
      return 'supplier_po_sent';
    case 'confirmed_by_supplier':
    case 'inbound_pending':
      return 'inbound_pending';
    case 'received':
      return 'ready_to_ship';
    case 'cancelled':
      return 'closed';
  }
}

export function canPlatformCoreCreateSupplierPo(articleOrigin: PlatformCoreArticleOriginType): boolean {
  return isPlatformCoreSupplierBackstageRoute(articleOrigin);
}
