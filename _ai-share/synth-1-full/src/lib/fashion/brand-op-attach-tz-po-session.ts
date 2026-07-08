import { brandB2bOrderAttachTzPdfPeerHref } from '@/lib/fashion/brand-op-attach-tz-pdf';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { brandW2ProductionTzHref, factoryProductionOrdersOrderContextHref } from '@/lib/routes';
import { workshop2B2bProductionHandoffPoId } from '@/lib/production/workshop2-b2b-handoff-po-id';

export type BrandOpAttachTzPoSession = {
  orderId: string;
  collectionId: string;
  articleId: string;
  productionOrderId: string;
  attachTzPoHref: string;
  attachTzPdfPeerHref: string;
  poHref: string;
};

/** Deep-link: W2 TZ material + order/po context for attach-to-PO strip (brand OP). */
export function buildBrandOpAttachTzPoSession(input?: {
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  factoryId?: string;
  productionOrderId?: string;
}): BrandOpAttachTzPoSession {
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const factoryId = input?.factoryId?.trim() || PLATFORM_CORE_DEMO.factoryId;
  const productionOrderId =
    input?.productionOrderId?.trim() || workshop2B2bProductionHandoffPoId(orderId);

  const tzBase = brandW2ProductionTzHref(collectionId, articleId);
  const attachTzPoHref = `${tzBase}&order=${encodeURIComponent(orderId)}&po=${encodeURIComponent(productionOrderId)}#w2-tz-export`;

  return {
    orderId,
    collectionId,
    articleId,
    productionOrderId,
    attachTzPoHref,
    attachTzPdfPeerHref: brandB2bOrderAttachTzPdfPeerHref(orderId, {
      collectionId,
      articleId,
      productionOrderId,
    }),
    poHref: factoryProductionOrdersOrderContextHref(orderId, { factoryId }),
  };
}
