import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import {
  ROUTES,
  factorySupplierMessagesWorkshop2ArticleContextHref,
  factorySupplierRfqInboxHref,
} from '@/lib/routes';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { shopOrderCommsTabHref } from '@/lib/b2b/shop-collection-order-hrefs';
import { appendSupplierOpPoContextToHref } from '@/lib/b2b/supplier-op-po-context-hrefs';
import {
  factoryMaterialsProcurementHrefForDemo,
  getPlatformCoreDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import type { SupplierProcurementBomLine } from '@/lib/platform-core-pillar-snapshot.types';

export type SupplierProcurementSession = {
  collectionId: string;
  articleId: string;
  orderId: string;
  factoryId: string;
  bomHref: string;
  forecastHref: string;
  supplyHref: string;
  handoffHref: string;
  shopTrackingHref: string;
  rfqHref: string;
  entitiesHref: string;
  orderTabHref: string;
  inboxHref: string;
};

export function supplierProcurementTabHref(
  featureId: 'bom' | 'rfq' | 'supply' | 'order' | 'inbox' | 'forecast' | 'entities',
  input?: { collectionId?: string; articleId?: string; orderId?: string }
): string {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const sp = new URLSearchParams({
    collection: collectionId,
    article: articleId,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: featureId,
  });
  if (orderId && (featureId === 'order' || featureId === 'supply' || featureId === 'forecast')) {
    sp.set('order', orderId);
  }
  return `${EXTENDED_ROUTES.factory.supplierMessages}?${sp.toString()}`;
}

export function buildSupplierProcurementSession(input?: {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  factoryId?: string;
  productionOrderId?: string;
}): SupplierProcurementSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const factoryId = input?.factoryId?.trim() || PLATFORM_CORE_DEMO.factoryId;
  const productionOrderId =
    input?.productionOrderId?.trim() || PLATFORM_CORE_DEMO.productionOrderId;
  const poCtx = { orderId, productionOrderId };

  return {
    collectionId,
    articleId,
    orderId,
    factoryId,
    bomHref: supplierProcurementTabHref('bom', { collectionId, articleId, orderId }),
    forecastHref: supplierProcurementTabHref('forecast', { collectionId, articleId, orderId }),
    supplyHref: supplierProcurementTabHref('supply', { collectionId, articleId, orderId }),
    handoffHref: appendSupplierOpPoContextToHref(
      manufacturerHandoffFeatureHref('handoff', { collectionId, orderId, factoryId }),
      poCtx
    ),
    shopTrackingHref: appendSupplierOpPoContextToHref(
      shopOrderCommsTabHref('tracking', orderId, collectionId),
      poCtx
    ),
    rfqHref: factorySupplierRfqInboxHref({ collectionId, articleId }),
    entitiesHref: supplierProcurementTabHref('entities', { collectionId, articleId, orderId }),
    orderTabHref: supplierProcurementTabHref('order', { collectionId, articleId, orderId }),
    inboxHref: supplierProcurementTabHref('inbox', { collectionId, articleId, orderId }),
  };
}

export type SupplierProcurementWorkspaceLink = {
  id: string;
  labelRu: string;
  href: string;
};

export function summarizeSupplierProcurementBom(lines: readonly SupplierProcurementBomLine[]): {
  total: number;
  filled: number;
  pct: number;
} {
  const total = lines.length;
  const filled = lines.filter((line) => {
    if (!line.materialName?.trim()) return false;
    return (line.yieldPerUnit ?? line.consumption ?? line.quantity ?? 0) > 0;
  }).length;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  return { total, filled, pct };
}

export function buildSupplierProcurementCrossLinks(input: {
  collectionId: string;
  articleId: string;
  orderId?: string;
}): SupplierProcurementWorkspaceLink[] {
  const orderId = input.orderId?.trim() || getPlatformCoreDemo(input.collectionId).demoOrderId;
  const centricHref = `${ROUTES.brand.integrationsCentric}?${PILLAR_CAPABILITY_FEATURE_PARAM}=rfq`;
  const brandBomHref = `${ROUTES.brand.suppliersRfq}?${PILLAR_CAPABILITY_FEATURE_PARAM}=bom&collection=${encodeURIComponent(input.collectionId)}&article=${encodeURIComponent(input.articleId)}`;
  const demo = {
    ...getPlatformCoreDemo(input.collectionId),
    demoArticleId: input.articleId,
    demoOrderId: orderId,
  };
  const materialsHref = factoryMaterialsProcurementHrefForDemo(demo, { role: 'supplier' });

  return [
    {
      id: 'materials',
      labelRu: 'Materials · dossier',
      href: materialsHref,
    },
    {
      id: 'brand-bom',
      labelRu: 'Brand BOM workspace',
      href: brandBomHref,
    },
    {
      id: 'centric-rfq',
      labelRu: 'Centric RFQ',
      href: centricHref,
    },
    {
      id: 'article-chat',
      labelRu: 'Article chat',
      href: factorySupplierMessagesWorkshop2ArticleContextHref(input.collectionId, input.articleId),
    },
    {
      id: 'mfr-handoff',
      labelRu: 'Manufacturer handoff',
      href: manufacturerHandoffFeatureHref('handoff', {
        collectionId: input.collectionId,
        orderId,
        factoryId: demo.factoryId,
      }),
    },
  ];
}
