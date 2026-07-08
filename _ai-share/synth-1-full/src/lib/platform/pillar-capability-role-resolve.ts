import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
/**
 * Role-aware resolveHref для возможностей с несколькими ролями.
 * Default (без ctx.role) — shop/brand-safe fallback для audit и hub matrix.
 */
import { brandOrderCommsFeatureHref } from '@/lib/b2b/brand-order-comms';
import { brandLandedMarginFeatureHref } from '@/lib/b2b/brand-landed-margin';
import { brandPricelistFeatureHref } from '@/lib/b2b/brand-pricelist-workspace';
import { platformB2bHubFeatureHref } from '@/lib/b2b/platform-b2b-hub';
import { platformB2bMarketroomFeatureHref } from '@/lib/b2b/platform-b2b-marketroom';
import { brandPackRulesFeatureHref } from '@/lib/fashion/brand-pack-rules-workspace';
import { shopCollaborativeOrderFeatureHref } from '@/lib/b2b/shop-collaborative-order';
import { shopReplenishmentFeatureHref } from '@/lib/b2b/shop-replenishment-workspace';
import { shopWholesaleMatrixFeatureHref } from '@/lib/b2b/shop-wholesale-matrix-workspace';
import { shopWorkingOrderFeatureHref } from '@/lib/b2b/shop-working-order-session';
import { shopLandedMarginFeatureHref } from '@/lib/b2b/shop-landed-margin';
import { brandAgentRepLedgerHref } from '@/lib/fashion/brand-agent-rep-oversight';
import { brandPricelistShopMatrixHref } from '@/lib/fashion/brand-pricelist-version';
import { brandInventoryFeatureHref } from '@/lib/b2b/brand-inventory-ops';
import { brandProductionOpsFeatureHref } from '@/lib/brand-production/brand-production-handoff';
import { manufacturerOrderCommsFeatureHref } from '@/lib/b2b/manufacturer-order-comms';
import { shopInventoryFeatureHref } from '@/lib/b2b/shop-inventory-ops';
import { shopOrderCommsFeatureHref } from '@/lib/b2b/shop-order-comms';
import { supplierOrderCommsFeatureHref } from '@/lib/b2b/supplier-order-comms';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix.types';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { manufacturerProductionOpsFeatureHref } from '@/lib/production/manufacturer-production-ops';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import {
  ROUTES,
  factorySupplierCalendarB2bOrderContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  factorySupplierRfqInboxHref,
  shopB2bMatrixPrepackHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';
import type { PillarCapabilityContext } from '@/lib/platform/pillar-capability-registry';

export function demoCollection(ctx: PillarCapabilityContext): string {
  return (ctx.collectionId ?? PLATFORM_CORE_DEMO.collectionId).trim() || 'SS27';
}

export function demoArticle(ctx: PillarCapabilityContext): string {
  const fromCtx = ctx.articleId?.trim();
  if (fromCtx) return fromCtx;
  const fromDemo = PLATFORM_CORE_DEMO.demoArticleId?.trim();
  return fromDemo || 'demo-ss27-01';
}

export function demoOrder(ctx: PillarCapabilityContext): string {
  const fromCtx = ctx.orderId?.trim();
  if (fromCtx) return fromCtx;
  return PLATFORM_CORE_DEMO.demoOrderId.trim();
}

export function withPillarCapabilityRole(
  ctx: PillarCapabilityContext,
  role: CoreChainRoleId
): PillarCapabilityContext {
  return ctx.role ? ctx : { ...ctx, role };
}

function supplierProcurementFeatureHref(
  featureId: 'bom' | 'rfq' | 'supply' | 'order' | 'entities',
  ctx: PillarCapabilityContext
): string {
  const collection = demoCollection(ctx);
  const article = demoArticle(ctx);
  const order = demoOrder(ctx);
  if (featureId === 'rfq') {
    return factorySupplierRfqInboxHref({ collectionId: collection, articleId: article });
  }
  const sp = new URLSearchParams({
    collection,
    article,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: featureId,
  });
  if (order && (featureId === 'order' || featureId === 'supply')) {
    sp.set('order', order);
  }
  return `${EXTENDED_ROUTES.factory.supplierMessages}?${sp.toString()}`;
}

export function resolveCommsOrderContextHref(ctx: PillarCapabilityContext): string {
  const order = demoOrder(ctx);
  const collection = demoCollection(ctx);
  const article = demoArticle(ctx);

  switch (ctx.role) {
    case 'brand':
      return brandOrderCommsFeatureHref(order, 'chat', collection);
    case 'manufacturer':
      return manufacturerOrderCommsFeatureHref(order, collection);
    case 'supplier':
      return supplierOrderCommsFeatureHref(order, collection, article);
    case 'shop':
      return shopOrderCommsFeatureHref(order, 'tracking', collection);
    default:
      return shopOrderCommsFeatureHref(order, 'tracking', collection);
  }
}

export function resolveCommsEntityThreadsHref(ctx: PillarCapabilityContext): string {
  const collection = demoCollection(ctx);

  switch (ctx.role) {
    case 'manufacturer':
      return `${EXTENDED_ROUTES.factory.messages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=entities&collection=${encodeURIComponent(collection)}`;
    case 'supplier':
      return supplierProcurementFeatureHref('entities', ctx);
    case 'brand':
    default:
      return `${ROUTES.brand.messages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=entities&collection=${encodeURIComponent(collection)}`;
  }
}

export function resolveDevRfqSupplierHref(ctx: PillarCapabilityContext): string {
  if (ctx.role === 'supplier') {
    return supplierProcurementFeatureHref('rfq', ctx);
  }
  return `${ROUTES.brand.integrationsCentric}?${PILLAR_CAPABILITY_FEATURE_PARAM}=rfq`;
}

export function resolveDevSupplierModelBomHref(ctx: PillarCapabilityContext): string {
  if (ctx.role === 'supplier') {
    return supplierProcurementFeatureHref('bom', ctx);
  }
  const collection = demoCollection(ctx);
  const article = demoArticle(ctx);
  return `${ROUTES.brand.suppliersRfq}?${PILLAR_CAPABILITY_FEATURE_PARAM}=bom&collection=${encodeURIComponent(collection)}&article=${encodeURIComponent(article)}`;
}

export function resolveDevMaterialPassportHref(ctx: PillarCapabilityContext): string {
  if (ctx.role === 'supplier') {
    return supplierProcurementFeatureHref('rfq', ctx);
  }
  return `${ROUTES.brand.fabricPassportRollup}?${PILLAR_CAPABILITY_FEATURE_PARAM}=certs`;
}

export function resolveOpMrpSupplyHref(ctx: PillarCapabilityContext): string {
  if (ctx.role === 'supplier') {
    return supplierProcurementFeatureHref('supply', ctx);
  }
  return workshop2ArticleHref(demoCollection(ctx), demoArticle(ctx), { w2pane: 'supply' });
}

export function resolveOpHandoffQueueHref(ctx: PillarCapabilityContext): string {
  const order = demoOrder(ctx);
  const collection = demoCollection(ctx);

  if (ctx.role === 'brand') {
    return brandProductionOpsFeatureHref(order, 'handoff');
  }

  const sp = new URLSearchParams({
    collection,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: 'handoff',
  });
  if (order) sp.set('order', order);
  return `${EXTENDED_ROUTES.factory.production}?${sp.toString()}#handoff-queue`;
}

export function resolveOpFactoryTechpackAckHref(ctx: PillarCapabilityContext): string {
  return manufacturerHandoffFeatureHref('techpack-ack', {
    orderId: demoOrder(ctx),
    collectionId: demoCollection(ctx),
    articleId: demoArticle(ctx),
  });
}

export function resolveOpCutTicketWipHref(ctx: PillarCapabilityContext): string {
  const order = demoOrder(ctx);
  const collection = demoCollection(ctx);

  if (ctx.role === 'brand') {
    return brandProductionOpsFeatureHref(order, 'cut-ticket');
  }

  return manufacturerProductionOpsFeatureHref('cut-ticket', {
    factoryId: PLATFORM_CORE_DEMO.factoryId,
    collectionId: collection,
    orderId: order,
  });
}

export function resolveOpQcGateHref(ctx: PillarCapabilityContext): string {
  const order = demoOrder(ctx);

  if (ctx.role === 'manufacturer') {
    return manufacturerHandoffFeatureHref('qc-gate', {
      orderId: order,
      collectionId: demoCollection(ctx),
    });
  }

  return brandProductionOpsFeatureHref(order, 'qc-gate');
}

export function resolveOpInventoryAtpHref(ctx: PillarCapabilityContext): string {
  const collection = demoCollection(ctx);
  if (ctx.role === 'brand') {
    return brandInventoryFeatureHref('overview', collection);
  }
  return shopInventoryFeatureHref('overview', collection);
}

export function resolveOpPhysicalCountHref(ctx: PillarCapabilityContext): string {
  const collection = demoCollection(ctx);
  if (ctx.role === 'brand') {
    return brandInventoryFeatureHref('count', collection);
  }
  return shopInventoryFeatureHref('reconcile', collection);
}

export function resolveScShowroomBuyHref(ctx: PillarCapabilityContext): string {
  const collection = demoCollection(ctx);
  if (ctx.surface === 'platform') {
    if (ctx.workspaceId === 'platform-b2b-hub') {
      return platformB2bHubFeatureHref('hub', collection);
    }
    return platformB2bMarketroomFeatureHref('showcase', collection);
  }
  if (ctx.role === 'brand') {
    return `${ROUTES.brand.showroom}?collection=${encodeURIComponent(collection)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=preview`;
  }
  return `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collection)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=showroom`;
}

export function resolveCoWholesaleMatrixHref(ctx: PillarCapabilityContext): string {
  const collection = demoCollection(ctx);
  if (ctx.surface === 'platform') {
    return platformB2bMarketroomFeatureHref('buy-path', collection);
  }
  if (ctx.role === 'brand') {
    return brandPricelistShopMatrixHref(collection, ctx.orderId);
  }
  return shopWholesaleMatrixFeatureHref('matrix', collection, ctx.orderId);
}

export function resolveCoPrepackCurveHref(ctx: PillarCapabilityContext): string {
  const collection = demoCollection(ctx);
  if (ctx.role === 'brand') {
    return brandPackRulesFeatureHref('shop-prepack', collection, ctx.orderId);
  }
  return shopB2bMatrixPrepackHref(collection, ctx.orderId);
}

export function resolveCoPricelistVersionHref(ctx: PillarCapabilityContext): string {
  if (ctx.role === 'shop') {
    return shopLandedMarginFeatureHref('pricelist', demoCollection(ctx), demoOrder(ctx));
  }
  return brandPricelistFeatureHref('versions', demoCollection(ctx));
}

export function resolveCoLandedMarginHref(ctx: PillarCapabilityContext): string {
  if (ctx.role === 'brand') {
    return brandLandedMarginFeatureHref('simulator', demoCollection(ctx), demoOrder(ctx));
  }
  return shopLandedMarginFeatureHref('rollup', demoCollection(ctx), demoOrder(ctx));
}

export function resolveCoAgentRepHref(ctx: PillarCapabilityContext): string {
  if (ctx.role === 'brand') {
    return brandAgentRepLedgerHref();
  }
  return `${LEGACY_ROUTES.shop.b2bSalesRepPortal}?${PILLAR_CAPABILITY_FEATURE_PARAM}=portal`;
}

export function resolveCoCollaborativeOrderHref(ctx: PillarCapabilityContext): string {
  return shopCollaborativeOrderFeatureHref(demoOrder(ctx), 'session', demoCollection(ctx));
}

export function resolveCoWorkingOrderHref(ctx: PillarCapabilityContext): string {
  return shopWorkingOrderFeatureHref(demoOrder(ctx), 'versions', demoCollection(ctx));
}

export function resolveCoReplenishmentHref(ctx: PillarCapabilityContext): string {
  return shopReplenishmentFeatureHref('alerts', demoCollection(ctx), ctx.orderId);
}
