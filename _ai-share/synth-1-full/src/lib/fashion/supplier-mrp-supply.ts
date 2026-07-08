import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  shopLandedMarginTabHref,
  shopMatrixWorkspaceTabHref,
  shopOrderCommsTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { manufacturerOrderCommsFeatureHref } from '@/lib/b2b/manufacturer-order-comms';
import {
  factoryMaterialsProcurementHrefForDemo,
  PLATFORM_CORE_DEMO,
  platformCoreDemoForArticle,
} from '@/lib/platform-core-hub-matrix';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import { ROUTES } from '@/lib/routes';

export type SupplierMrpSupplySession = {
  collectionId: string;
  articleId: string;
  orderId: string;
  supplyTabHref: string;
  materialsHref: string;
  brandBomHref: string;
  centricRfqHref: string;
  w2SupplyHref: string;
  replenishmentHref: string;
  brandProductionHref: string;
  shopMatrixHref: string;
  shopLandedMarginHref: string;
  shopOrderCommsHref: string;
  manufacturerOrderCommsHref: string;
};

export function buildSupplierMrpSupplySession(input?: {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
}): SupplierMrpSupplySession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01';
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const demo = { ...platformCoreDemoForArticle(collectionId, articleId), demoOrderId: orderId };
  const base = `${ROUTES.factory.supplierMessages}?collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`;

  return {
    collectionId,
    articleId,
    orderId,
    supplyTabHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=supply`,
    materialsHref: factoryMaterialsProcurementHrefForDemo(demo, { role: 'supplier' }),
    brandBomHref: `${ROUTES.brand.suppliersRfq}?${PILLAR_CAPABILITY_FEATURE_PARAM}=bom&collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`,
    centricRfqHref: `${ROUTES.brand.integrationsCentric}?${PILLAR_CAPABILITY_FEATURE_PARAM}=rfq`,
    w2SupplyHref: workshop2ArticleHref(collectionId, articleId, { w2pane: 'supply' }),
    replenishmentHref: `${ROUTES.shop.b2bReplenishment}?${PILLAR_CAPABILITY_FEATURE_PARAM}=alerts&collection=${encodeURIComponent(collectionId)}`,
    brandProductionHref: `${ROUTES.brand.productionOperations}?${PILLAR_CAPABILITY_FEATURE_PARAM}=operations&order=${encodeURIComponent(orderId)}`,
    shopMatrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    shopLandedMarginHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    shopOrderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    manufacturerOrderCommsHref: manufacturerOrderCommsFeatureHref(orderId, collectionId),
  };
}

export function supplierMrpSupplyFeatureHref(collectionId?: string, articleId?: string): string {
  return buildSupplierMrpSupplySession({ collectionId, articleId }).supplyTabHref;
}
