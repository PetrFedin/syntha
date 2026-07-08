import { products } from '@/lib/products';
import {
  buildBrandAttributeSchemaRows,
  summarizeBrandAttributeSchema,
} from '@/lib/fashion/brand-attribute-schema';
import {
  buildBrandReleaseSyndicationRows,
  summarizeBrandReleaseSyndication,
} from '@/lib/fashion/brand-release-syndication';
import { buildBrandSampleLifecycleRows } from '@/lib/fashion/brand-sample-lifecycle';
import { brandAttributeMissingFixHref } from '@/lib/fashion/brand-attribute-schema-w2-link';
import { getPillarCapabilityWorkspace } from '@/lib/platform/pillar-capability-workspaces';
import {
  buildBrandMaterialPassportCertRows,
  summarizeBrandMaterialPassportCerts,
} from '@/lib/fashion/brand-material-passport-certs';
import {
  brandMaterialPassportFeatureHref,
  brandMaterialPassportReleaseChecklistHref,
  brandMaterialPassportSyndicationHref,
} from '@/lib/fashion/brand-material-passport-workspace';
import {
  brandAttributeSchemaFeatureHref,
  brandAttributeSchemaMaterialPassportHref,
} from '@/lib/fashion/brand-attribute-schema-workspace';
import { brandPricelistFeatureHref } from '@/lib/b2b/brand-pricelist-workspace';
import { brandPackRulesFeatureHref } from '@/lib/fashion/brand-pack-rules-workspace';
import { brandLandedMarginFeatureHref } from '@/lib/b2b/brand-landed-margin';
import { shopLandedMarginFeatureHref } from '@/lib/b2b/shop-landed-margin';
import { buildBrandCommsEntityThreads } from '@/lib/fashion/brand-comms-entity-threads';
import {
  buildBrandSizeChartGradeRows,
  summarizeBrandSizeChartGrade,
} from '@/lib/fashion/brand-size-chart-grade';
import { buildShopAgentRepSession } from '@/lib/b2b/shop-agent-rep';
import {
  buildShopLandedMarginRows,
  buildShopLandedMarginSession,
  summarizeShopLandedMargin,
} from '@/lib/b2b/shop-landed-margin';
import {
  buildBrandCommsWorkspaceSession,
  brandCommsWorkspaceFeatureHref,
} from '@/lib/fashion/brand-comms-workspace';
import {
  buildManufacturerCommsWorkspaceSession,
  manufacturerCommsWorkspaceFeatureHref,
} from '@/lib/fashion/manufacturer-comms-workspace';
import {
  buildSupplierProcurementSession,
  summarizeSupplierProcurementBom,
  supplierProcurementTabHref,
} from '@/lib/fashion/supplier-procurement-workspace';
import { summarizeBrandPricelistVersions } from '@/lib/fashion/brand-pricelist-version';
import { getPriceLists } from '@/lib/b2b/price-lists';
import {
  shopCollaborativeTabHref,
  shopShowroomTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { summarizeBrandPackRulesRows } from '@/lib/fashion/brand-pack-rules-curve';
import {
  brandPackRulesFeatureHref,
  buildBrandPackRulesSession,
} from '@/lib/fashion/brand-pack-rules-workspace';
import {
  buildShopWholesaleMatrixSession,
  shopWholesaleMatrixFeatureHref,
} from '@/lib/b2b/shop-wholesale-matrix-workspace';
import {
  buildShopReplenishmentSession,
  shopReplenishmentFeatureHref,
} from '@/lib/b2b/shop-replenishment-workspace';
import { buildPackRuleRow } from '@/lib/fashion/pack-rules-rollup';
import { summarizeBrandAgentRepLedger } from '@/lib/fashion/brand-agent-rep-oversight';
import {
  buildShopWorkingOrderSession,
  shopWorkingOrderFeatureHref,
} from '@/lib/b2b/shop-working-order-session';
import {
  brandWssiFeatureHref,
  brandWssiShopMatrixHref,
  brandWssiShowroomHref,
  buildBrandWssiCapacityRows,
  buildBrandWssiMixRows,
  summarizeBrandWssiMix,
} from '@/lib/fashion/brand-wssi-plan';
import {
  buildShopCollaborativeOrderSession,
  summarizeShopCollaborativeOrder,
} from '@/lib/b2b/shop-collaborative-order';
import {
  mapSupplierProcurementBomLines,
  summarizeBrandSupplierBomLines,
} from '@/lib/fashion/brand-supplier-bom-lines';
import {
  buildShopShowroomBuySession,
  shopShowroomBuyFeatureHref,
} from '@/lib/b2b/shop-showroom-buy';
import {
  buildBrandSampleLifecycleWorkspaceSession,
  brandSampleLifecycleFeatureHref,
} from '@/lib/fashion/brand-sample-lifecycle-workspace';
import { buildBrandShowroomBuySession } from '@/lib/fashion/brand-showroom-buy';
import {
  brandProductionOpsFeatureHref,
  buildBrandProductionHandoffSession,
} from '@/lib/brand-production/brand-production-handoff';
import { buildBrandProductionOpsSession } from '@/lib/brand-production/brand-production-ops-session';
import {
  brandRfqSupplierFeatureHref,
  buildBrandRfqSupplierSession,
} from '@/lib/fashion/brand-rfq-supplier-workspace';
import {
  brandSupplierBomFeatureHref,
  buildBrandSupplierBomSession,
} from '@/lib/fashion/brand-supplier-bom-workspace';
import { buildBrandLinesheetSyndicationSession } from '@/lib/fashion/brand-linesheet-syndication';
import { buildShopOrderCommsSession, shopOrderCommsFeatureHref } from '@/lib/b2b/shop-order-comms';
import {
  brandOrderCommsFeatureHref,
  buildBrandOrderCommsSession,
} from '@/lib/b2b/brand-order-comms';
import {
  buildSupplierMrpSupplySession,
  supplierMrpSupplyFeatureHref,
} from '@/lib/fashion/supplier-mrp-supply';
import {
  buildBrandInventoryOpsSession,
  brandInventoryFeatureHref,
} from '@/lib/b2b/brand-inventory-ops';
import {
  buildBrandCrmSegmentationSession,
  brandCrmSegmentationFeatureHref,
} from '@/lib/b2b/brand-crm-segmentation';
import {
  buildBrandLandedMarginSession,
  brandLandedMarginFeatureHref,
} from '@/lib/b2b/brand-landed-margin';
import {
  buildBrandPricelistSession,
  brandPricelistFeatureHref,
} from '@/lib/b2b/brand-pricelist-workspace';
import { buildPlatformB2bHubSession, platformB2bHubFeatureHref } from '@/lib/b2b/platform-b2b-hub';
import {
  buildPlatformB2bMarketroomSession,
  platformB2bMarketroomFeatureHref,
} from '@/lib/b2b/platform-b2b-marketroom';
import {
  buildPlatformB2bPartnersSession,
  platformB2bPartnersFeatureHref,
} from '@/lib/b2b/platform-b2b-partners';
import {
  buildManufacturerOrderCommsSession,
  manufacturerOrderCommsFeatureHref,
} from '@/lib/b2b/manufacturer-order-comms';
import {
  buildSupplierOrderCommsSession,
  supplierOrderCommsFeatureHref,
} from '@/lib/b2b/supplier-order-comms';
import {
  buildManufacturerProductionOpsSession,
  manufacturerProductionOpsFeatureHref,
} from '@/lib/production/manufacturer-production-ops';
import {
  buildShopB2bPartnersSession,
  shopB2bPartnersFeatureHref,
} from '@/lib/b2b/shop-b2b-partners-workspace';
import {
  buildShopInventoryOpsSession,
  shopInventoryFeatureHref,
} from '@/lib/b2b/shop-inventory-ops';
import {
  buildManufacturerHandoffQueueSession,
  manufacturerHandoffFeatureHref,
} from '@/lib/production/manufacturer-handoff-queue';
import { buildManufacturerQcGateSession } from '@/lib/production/manufacturer-qc-gate';
import { buildManufacturerCommsEntityThreads } from '@/lib/fashion/manufacturer-comms-entity-threads';
import {
  buildSupplierCommsEntityThreads,
  supplierCommsEntitiesHref,
} from '@/lib/fashion/supplier-comms-entity-threads';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';

describe('brand-attribute-schema', () => {
  it('builds schema rows from catalog products', () => {
    const rows = buildBrandAttributeSchemaRows(products.slice(0, 5));
    expect(rows.length).toBe(5);
    expect(rows.every((r) => r.leafId.length > 0)).toBe(true);
    const summary = summarizeBrandAttributeSchema(rows);
    expect(summary.total).toBe(5);
  });
});

describe('brand-size-chart-grade', () => {
  it('summarizes grade states', () => {
    const rows = buildBrandSizeChartGradeRows(products.slice(0, 8));
    const summary = summarizeBrandSizeChartGrade(rows);
    expect(summary.total).toBe(8);
    expect(summary.ready + summary.partial + summary.empty).toBe(8);
  });
});

describe('brand-release-syndication', () => {
  it('marks ready when launch and attrs pass gate', () => {
    const rows = buildBrandReleaseSyndicationRows(products.slice(0, 10));
    const summary = summarizeBrandReleaseSyndication(rows);
    expect(summary.total).toBe(10);
    expect(summary.ready).toBeGreaterThanOrEqual(0);
  });

  it('blocks ready when tech pack gate fails', () => {
    const product = products[0]!;
    const rows = buildBrandReleaseSyndicationRows([product], {
      techPackBySku: new Map([
        [product.sku, { ready: false, sheetsReady: 2, sheetsTotal: 6, qtyBridged: false }],
      ]),
    });
    expect(rows[0]?.ready).toBe(false);
    expect(rows[0]?.techPackSheetsReady).toBe(2);
  });
});

describe('brand-release-gate', () => {
  it('includes techpack-gate workspace feature', () => {
    const ws = getPillarCapabilityWorkspace('brand-release-gate');
    expect(ws?.features.some((f) => f.id === 'techpack-gate')).toBe(true);
  });

  it('golden path session links checklist → showroom', () => {
    const session = buildBrandLinesheetSyndicationSession({ collectionId: 'SS27' });
    expect(session.checklistHref).toContain('pcf=checklist');
    expect(session.showroomPublishHref).toContain('pcf=showroom-publish');
    expect(session.shopShowroomHref).toContain('b2b/showroom');
  });
});

describe('brand-sample-lifecycle', () => {
  it('builds sample round rows with peer href', () => {
    const rows = buildBrandSampleLifecycleRows(products.slice(0, 4));
    expect(rows.length).toBe(4);
    expect(rows.every((r) => r.peerHref.length > 0)).toBe(true);
  });

  it('brand-sample-lifecycle workspace keeps hub and rounds only (no handoff/factory-pack tabs)', () => {
    const ws = getPillarCapabilityWorkspace('brand-sample-lifecycle');
    const ids = ws?.features.map((f) => f.id) ?? [];
    expect(ids).toEqual(['hub', 'rounds']);
  });

  it('builds golden path hub rounds release showroom (handoff/factory-pack via dossier)', () => {
    const session = buildBrandSampleLifecycleWorkspaceSession({ collectionId: 'SS27' });
    expect(session.hubHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`);
    expect(session.roundsHref).toContain('pcf=rounds');
    expect(session.handoffTabHref).toContain('pcf=handoff');
    expect(session.factoryPackHref).toContain('pcf=factory-pack');
    expect(session.releaseGateHref).toContain('pcf=checklist');
    expect(session.shopShowroomHref).toContain('pcf=showroom');
    expect(session.manufacturerHandoffHref).toContain('pcf=handoff');
    expect(brandSampleLifecycleFeatureHref('rounds', 'SS27')).toContain('pcf=rounds');
  });
});

describe('brand-attribute-schema-w2-link', () => {
  it('maps missing attr to W2 tz href', () => {
    const href = brandAttributeMissingFixHref({ attributeId: 'color' });
    expect(href).toContain('w2pane=tz');
  });
});

describe('brand-comms-entity-threads', () => {
  it('builds four entity thread rows with chat hrefs', () => {
    const rows = buildBrandCommsEntityThreads();
    expect(rows.length).toBe(4);
    expect(
      rows.every((r) => r.messagesHref.includes('contextType=workshop2_article') || r.id === 'qc')
    ).toBe(true);
    expect(rows.find((r) => r.id === 'bom')?.attachTzSupported).toBe(true);
    expect(rows.find((r) => r.id === 'qc')?.attachTzSupported).toBe(false);
  });
});

describe('brand-material-passport-certs', () => {
  it('summarizes cert readiness', () => {
    const rows = buildBrandMaterialPassportCertRows(products.slice(0, 8));
    const summary = summarizeBrandMaterialPassportCerts(rows);
    expect(summary.total).toBe(8);
  });

  it('golden path hrefs chain rollup → syndication', () => {
    expect(brandMaterialPassportFeatureHref('certs', 'SS27')).toContain('pcf=certs');
    expect(brandMaterialPassportReleaseChecklistHref('SS27')).toContain('pcf=checklist');
    expect(brandMaterialPassportSyndicationHref('SS27')).toContain('pcf=syndication');
  });
});

describe('brand-attribute-schema-workspace', () => {
  it('golden path hrefs chain health → material passport', () => {
    expect(brandAttributeSchemaFeatureHref('schemas', 'SS27')).toContain('pcf=schemas');
    expect(brandAttributeSchemaMaterialPassportHref('SS27')).toContain('pcf=rollup');
  });
});

describe('brand-pricelist-workspace golden path', () => {
  it('builds versions and shop-sync hrefs', () => {
    expect(brandPricelistFeatureHref('shop-sync', 'SS27')).toContain('pcf=shop-sync');
  });
});

describe('brand-pack-rules-workspace golden path', () => {
  it('builds rules and shop-prepack hrefs', () => {
    expect(brandPackRulesFeatureHref('curve', 'SS27')).toContain('pcf=curve');
    expect(brandPackRulesFeatureHref('shop-prepack', 'SS27')).toContain('pcf=shop-prepack');
  });
});

describe('landed-margin golden path hrefs', () => {
  it('brand and shop feature hrefs', () => {
    expect(brandLandedMarginFeatureHref('shop-rollup', 'SS27')).toContain('pcf=shop-rollup');
    expect(shopLandedMarginFeatureHref('pricelist', 'SS27')).toContain('pcf=pricelist');
  });
});

describe('brand-rfq-supplier-workspace golden path', () => {
  it('chains upstream → supplier BOM → showroom', () => {
    expect(brandRfqSupplierFeatureHref('rfq', 'SS27', 'art-1')).toContain('pcf=rfq');
    const session = buildBrandRfqSupplierSession({ collectionId: 'SS27', articleId: 'art-1' });
    expect(session.supplierBomHref).toContain('pcf=bom');
    expect(session.shopShowroomHref).toContain('pcf=showroom');
  });
});

describe('brand-supplier-bom-workspace golden path', () => {
  it('chains bom → centric RFQ → supplier forecast', () => {
    expect(brandSupplierBomFeatureHref('procurement', 'SS27', 'art-1')).toContain(
      'pcf=procurement'
    );
    const session = buildBrandSupplierBomSession({ collectionId: 'SS27', articleId: 'art-1' });
    expect(session.centricRfqHref).toContain('pcf=rfq');
    expect(session.supplierForecastHref).toContain('pcf=forecast');
  });
});

describe('brand-production-ops golden path', () => {
  it('chains operations → handoff → factory queue', () => {
    const session = buildBrandProductionOpsSession({ orderId: 'INT-1', collectionId: 'SS27' });
    expect(session.operationsTabHref).toContain('pcf=operations');
    expect(session.handoffTabHref).toContain('pcf=handoff');
    expect(session.factoryQueueHref).toContain('handoff');
    expect(brandProductionOpsFeatureHref('INT-1', 'qc-gate')).toContain('pcf=qc-gate');
  });
});

describe('shop-collaborative-order golden path', () => {
  it('chains session → matrix → tracking', () => {
    const session = buildShopCollaborativeOrderSession({ orderId: 'ORD-1', collectionId: 'SS27' });
    expect(session.sessionHref).toContain('pcf=session');
    expect(session.approvalsHref).toContain('pcf=approvals');
    expect(session.trackingHref).toContain('pcf=tracking');
  });
});

describe('shop spine golden path hrefs', () => {
  it('working order chains versions → checkout', () => {
    const session = buildShopWorkingOrderSession({
      wholesaleOrderId: 'INT-1',
      collectionId: 'SS27',
    });
    expect(session.versionsHref).toContain('pcf=versions');
    expect(session.orderCommsHref).toContain('pcf=tracking');
    expect(session.checkoutHref).toContain('checkout');
    expect(shopWorkingOrderFeatureHref('INT-1', 'bulk', 'SS27')).toContain('pcf=bulk');
  });

  it('replenishment chains alerts → supplier forecast', () => {
    const session = buildShopReplenishmentSession({ orderId: 'INT-1', collectionId: 'SS27' });
    expect(session.alertsHref).toContain('pcf=alerts');
    expect(session.supplierForecastHref).toContain('pcf=forecast');
    expect(shopReplenishmentFeatureHref('rules', 'SS27')).toContain('pcf=rules');
  });

  it('order comms chains tracking → brand handoff', () => {
    const session = buildShopOrderCommsSession({ orderId: 'INT-1', collectionId: 'SS27' });
    expect(session.trackingHref).toContain('pcf=tracking');
    expect(session.brandOrderHandoffHref).toContain('pcf=handoff');
    expect(shopOrderCommsFeatureHref('INT-1', 'chat', 'SS27')).toContain('pcf=chat');
  });

  it('inventory ops chains overview → tracking', () => {
    const session = buildShopInventoryOpsSession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.overviewHref).toContain('pcf=overview');
    expect(session.replenishmentAtpHref).toContain('pcf=stock-atp');
    expect(shopInventoryFeatureHref('reconcile', 'SS27')).toContain('pcf=reconcile');
  });
});

describe('wave V.2 golden path hrefs', () => {
  it('brand inventory ops chains overview → shop tracking', () => {
    const session = buildBrandInventoryOpsSession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.overviewHref).toContain('pcf=overview');
    expect(session.shopInventoryReconcileHref).toContain('pcf=reconcile');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(brandInventoryFeatureHref('balance', 'SS27')).toContain('pcf=balance');
  });

  it('manufacturer handoff chains handoff → shop tracking', () => {
    const session = buildManufacturerHandoffQueueSession({
      orderId: 'INT-1',
      collectionId: 'SS27',
    });
    expect(session.handoffHref).toContain('handoff');
    expect(session.brandHandoffHref).toContain('pcf=handoff');
    expect(session.shopTrackingHref).toContain('pcf=tracking');
    expect(manufacturerHandoffFeatureHref('qc-gate', { orderId: 'INT-1' })).toContain(
      'pcf=qc-gate'
    );
  });

  it('supplier procurement chains bom → shop tracking', () => {
    const session = buildSupplierProcurementSession({
      collectionId: 'SS27',
      articleId: 'art-1',
      orderId: 'INT-1',
    });
    expect(session.bomHref).toContain('pcf=bom');
    expect(session.forecastHref).toContain('pcf=forecast');
    expect(session.shopTrackingHref).toContain('pcf=tracking');
    expect(
      supplierProcurementTabHref('supply', { collectionId: 'SS27', articleId: 'art-1' })
    ).toContain('pcf=supply');
  });

  it('brand comms workspace chains inbox → shop tracking', () => {
    const session = buildBrandCommsWorkspaceSession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.inboxHref).toContain('pcf=inbox');
    expect(session.entitiesHref).toContain('pcf=entities');
    expect(session.orderChatHref).toContain('pcf=chat');
    expect(session.shopTrackingHref).toContain('pcf=tracking');
    expect(brandCommsWorkspaceFeatureHref('entities', 'SS27')).toContain('pcf=entities');
  });
});

describe('brand-order-comms golden path', () => {
  it('chains detail → handoff → factory queue', () => {
    const session = buildBrandOrderCommsSession({ orderId: 'INT-1', collectionId: 'SS27' });
    expect(session.detailHref).toContain('pcf=detail');
    expect(session.handoffHref).toContain('pcf=handoff');
    expect(session.factoryQueueHref).toContain('handoff');
  });
});

describe('shop-collaborative-order', () => {
  it('builds session with matrix and messages hrefs', () => {
    const session = buildShopCollaborativeOrderSession({ orderId: 'ORD-1', collectionId: 'SS27' });
    expect(session.matrixHref).toContain('pcf=matrix');
    expect(session.prepackHref).toContain('pcf=prepack');
    expect(session.messagesHref).toContain('ORD-1');
    expect(session.sessionHref).toContain('pcf=session');
    expect(session.brandOrderChatHref).toContain('pcf=chat');
    expect(session.brandOrderHandoffHref).toContain('pcf=handoff');
    expect(session.shopMarginPricelistHref).toContain('pcf=pricelist');
    expect(session.inventoryOverviewHref).toContain('pcf=overview');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(session.platformHubHref).toContain('pcf=hub');
    const summary = summarizeShopCollaborativeOrder(session);
    expect(summary.participants).toBe(3);
    expect(summary.approvalsTotal).toBe(3);
  });
});

describe('shop-landed-margin-session', () => {
  it('builds rollup and collaborative bridges', () => {
    const session = buildShopLandedMarginSession({ orderId: 'O1', collectionId: 'SS27' });
    expect(session.rollupHref).toContain('pcf=rollup');
    expect(session.matrixHref).toContain('pcf=matrix');
    expect(session.collaborativeApprovalsHref).toContain('pcf=approvals');
    expect(session.orderCommsHref).toContain('pcf=tracking');
    expect(session.brandOrderChatHref).toContain('pcf=chat');
    expect(session.inventoryOverviewHref).toContain('pcf=overview');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(session.brandMarginSimulatorHref).toContain('pcf=simulator');
    expect(session.brandMarginPricelistHref).toContain('pcf=pricelist');
    expect(session.brandShopSyncHref).toContain('pcf=shop-sync');
  });
});

describe('brand-supplier-bom-lines', () => {
  it('maps procurement bom lines from snapshot shape', () => {
    const rows = mapSupplierProcurementBomLines([
      { materialName: 'Cotton', quantity: 2.5, unit: 'm' },
      { materialName: '', consumption: 0 },
    ]);
    expect(rows[0].qty).toBe(2.5);
    expect(rows[0].filled).toBe(true);
    expect(rows[1].filled).toBe(false);
    expect(summarizeBrandSupplierBomLines(rows).filled).toBe(1);
  });
});

describe('shop-landed-margin', () => {
  it('builds rollup rows with margin pct', () => {
    const rows = buildShopLandedMarginRows({ orderId: 'O1', collectionId: 'SS27' });
    const summary = summarizeShopLandedMargin(rows);
    expect(summary.total).toBe(3);
    expect(summary.avgMarginPct).toBeGreaterThan(0);
  });
});

describe('shop-agent-rep', () => {
  it('builds rep session hrefs', () => {
    const session = buildShopAgentRepSession({ orderId: 'ORD-9' });
    expect(session.matrixHref).toContain('ORD-9');
    expect(session.collaborativeHref).toContain('pcf=session');
    expect(session.brandLedgerHref).toContain('pcf=ledger');
    expect(session.platformMarketroomHref).toContain('pcf=showcase');
  });
});

describe('supplier-procurement-workspace', () => {
  it('summarizes bom fill pct', () => {
    const summary = summarizeSupplierProcurementBom([
      { materialName: 'Silk', quantity: 1 },
      { materialName: 'Lining', quantity: 0 },
    ]);
    expect(summary.filled).toBe(1);
    expect(summary.pct).toBe(50);
  });
});

describe('brand-pricelist-version', () => {
  it('summarizes price list versions', () => {
    const summary = summarizeBrandPricelistVersions(getPriceLists());
    expect(summary.total).toBeGreaterThan(0);
  });
});

describe('brand-pack-rules-curve', () => {
  it('summarizes pack rule rows', () => {
    const rows = products.slice(0, 10).map(buildPackRuleRow);
    const summary = summarizeBrandPackRulesRows(rows);
    expect(summary.total).toBe(10);
  });

  it('builds rules curve shop-prepack and matrix cross-links', () => {
    const session = buildBrandPackRulesSession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.rulesHref).toContain('pcf=rules');
    expect(session.shopMatrixPrepackHref).toContain('pcf=prepack');
    expect(brandPackRulesFeatureHref('curve', 'SS27')).toContain('pcf=curve');
  });
});

describe('shop-wholesale-matrix-workspace', () => {
  it('builds matrix prepack and brand pack-rules hrefs', () => {
    const session = buildShopWholesaleMatrixSession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.prepackHref).toContain('pcf=prepack');
    expect(session.brandPackRulesCurveHref).toContain('/brand/merch/pack-rules');
    expect(shopWholesaleMatrixFeatureHref('matrix', 'SS27', 'INT-1')).toContain('pcf=matrix');
    expect(session.replenishmentHref).toContain('pcf=stock-atp');
    expect(session.workingOrderBulkHref).toContain('pcf=bulk');
    expect(session.orderCommsHref).toContain('pcf=tracking');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(session.inventoryOverviewHref).toContain('pcf=overview');
    expect(session.checkoutHref).toContain('/shop/b2b/checkout');
    expect(session.registryHref).toContain('/shop/b2b/orders');
  });
});

describe('shop-replenishment-workspace', () => {
  it('builds alerts stock-atp rules and matrix cross-links', () => {
    const session = buildShopReplenishmentSession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.alertsHref).toContain('pcf=alerts');
    expect(session.matrixHref).toContain('pcf=matrix');
    expect(session.prepackHref).toContain('pcf=prepack');
    expect(session.orderCommsHref).toContain('pcf=tracking');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(session.collaborativeApprovalsHref).toContain('pcf=approvals');
    expect(session.inventoryOverviewHref).toContain('pcf=overview');
    expect(shopReplenishmentFeatureHref('rules', 'SS27')).toContain('pcf=rules');
  });
});

describe('brand-agent-rep-oversight', () => {
  it('summarizes empty ledger', () => {
    const summary = summarizeBrandAgentRepLedger([]);
    expect(summary.total).toBe(0);
    expect(summary.commissionRub).toBe(0);
  });
});

describe('shop-working-order-session', () => {
  it('builds session hrefs with pcf tabs', () => {
    const session = buildShopWorkingOrderSession({
      wholesaleOrderId: 'INT-1',
      collectionId: 'SS27',
    });
    expect(session.versionsHref).toContain('pcf=versions');
    expect(session.matrixHref).toContain('pcf=matrix');
    expect(session.prepackHref).toContain('pcf=prepack');
    expect(session.orderCommsHref).toContain('pcf=tracking');
    expect(session.landedMarginHref).toContain('pcf=rollup');
    expect(session.brandOrderChatHref).toContain('pcf=chat');
    expect(session.brandLandedMarginHref).toContain('pcf=simulator');
    expect(session.inventoryOverviewHref).toContain('pcf=overview');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(session.checkoutHref).toContain('/shop/b2b/checkout');
    expect(session.checkoutHref).toContain('order=INT-1');
    expect(shopWorkingOrderFeatureHref('INT-2', 'bulk', 'SS27')).toContain('pcf=bulk');
  });
});

describe('brand-wssi-plan', () => {
  it('summarizes mix and capacity rows', () => {
    const mix = buildBrandWssiMixRows(products.slice(0, 20));
    const summary = summarizeBrandWssiMix(mix);
    expect(summary.categories).toBeGreaterThan(0);
    const capacity = buildBrandWssiCapacityRows({ collectionId: 'SS27' });
    expect(capacity.length).toBe(2);
    expect(capacity[0].utilizationPct).toBeGreaterThan(0);
  });

  it('golden path hrefs chain otb → shop showroom', () => {
    expect(brandWssiFeatureHref('otb', 'SS27')).toContain('pcf=otb');
    expect(brandWssiFeatureHref('mix', 'SS27')).toContain('pcf=mix');
    expect(brandWssiShopMatrixHref('SS27')).toContain('/shop/b2b/matrix');
    expect(brandWssiShowroomHref('SS27')).toContain('/shop/b2b/showroom');
  });
});

describe('shop-showroom-buy', () => {
  it('builds pcf hrefs for showroom tabs', () => {
    const session = buildShopShowroomBuySession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.showroomHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=showroom`);
    expect(session.buyHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=buy`);
    expect(session.matrixHref).toContain('pcf=matrix');
    expect(session.prepackHref).toContain('pcf=prepack');
    expect(session.orderCommsHref).toContain('pcf=tracking');
    expect(session.brandOrderChatHref).toContain('pcf=chat');
    expect(session.registryHref).toContain('/shop/b2b/orders');
    expect(session.trackingHref).toContain('pcf=tracking');
    expect(session.stream3dHref).toContain('pcf=3d-stream');
    expect(shopShowroomBuyFeatureHref('SS27', 'linesheet')).toContain('collection=SS27');
  });
});

describe('brand-showroom-buy', () => {
  it('links brand preview to shop showroom', () => {
    const session = buildBrandShowroomBuySession({ collectionId: 'SS27' });
    expect(session.previewHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=preview`);
    expect(session.shopShowroomHref).toContain('/shop/b2b/showroom');
    expect(session.shopMatrixHref).toContain('pcf=matrix');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
  });
});

describe('brand-production-handoff', () => {
  it('builds factory queue and ops tab hrefs', () => {
    const session = buildBrandProductionHandoffSession({ orderId: 'INT-1', collectionId: 'SS27' });
    expect(session.factoryQueueHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=handoff`);
    expect(session.handoffTabHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=handoff`);
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(session.manufacturerOrderCommsHref).toContain('INT-1');
    expect(session.brandOrderCommsHandoffHref).toContain('pcf=handoff');
    expect(session.shopCollaborativeApprovalsHref).toContain('pcf=approvals');
    expect(session.shopReplenishmentAtpHref).toContain('pcf=stock-atp');
    expect(brandProductionOpsFeatureHref('INT-1', 'cut-ticket')).toContain('INT-1');
  });
});

describe('brand-linesheet-syndication', () => {
  it('links syndication to showroom publish tab', () => {
    const session = buildBrandLinesheetSyndicationSession({ collectionId: 'SS27' });
    expect(session.showroomPublishHref).toContain(
      `${PILLAR_CAPABILITY_FEATURE_PARAM}=showroom-publish`
    );
    expect(session.shopShowroomHref).toContain('/shop/b2b/showroom');
  });
});

describe('manufacturer-handoff-queue', () => {
  it('builds pcf handoff href without hash', () => {
    const session = buildManufacturerHandoffQueueSession({
      factoryId: 'fact-1',
      orderId: 'INT-1',
      collectionId: 'SS27',
    });
    expect(session.handoffHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=handoff`);
    expect(session.handoffHref).toContain('#handoff-queue');
    expect(manufacturerHandoffFeatureHref('handoff', { orderId: 'INT-1' })).toContain('INT-1');
    expect(manufacturerHandoffFeatureHref('qc-gate', { orderId: 'INT-1' })).toContain(
      'pcf=qc-gate'
    );
    expect(manufacturerHandoffFeatureHref('techpack-ack', { orderId: 'INT-1' })).toContain(
      'pcf=techpack-ack'
    );
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(session.brandOrderChatHref).toContain('pcf=chat');
    expect(session.productionOpsCutTicketHref).toContain('pcf=cut-ticket');
  });
});

describe('manufacturer-comms-entity-threads', () => {
  it('builds four manufacturer entity rows', () => {
    const rows = buildManufacturerCommsEntityThreads({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(rows.length).toBe(4);
    expect(rows.find((r) => r.id === 'handoff')?.contextHref).toContain('pcf=handoff');
    expect(rows.find((r) => r.id === 'dossier')?.attachTzSupported).toBe(true);
    expect(rows.find((r) => r.id === 'handoff')?.attachTzSupported).toBe(false);
  });
});

describe('supplier-comms-entity-threads', () => {
  it('builds supplier entity thread hrefs', () => {
    const rows = buildSupplierCommsEntityThreads({ collectionId: 'SS27' });
    expect(rows.length).toBe(4);
    expect(supplierCommsEntitiesHref('SS27')).toContain('pcf=entities');
    expect(rows.find((r) => r.id === 'bom')?.attachTzSupported).toBe(true);
    expect(rows.find((r) => r.id === 'qc')?.attachTzSupported).toBe(false);
  });
});

describe('manufacturer-qc-gate', () => {
  it('links brand and factory qc tabs', () => {
    const session = buildManufacturerQcGateSession({ orderId: 'INT-1', collectionId: 'SS27' });
    expect(session.brandQcTabHref).toContain('pcf=qc-gate');
    expect(session.qcTabHref).toContain('pcf=qc-gate');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(session.shopLandedMarginHref).toContain('pcf=rollup');
  });
});

describe('shop-inventory-ops', () => {
  it('builds overview and reconcile hrefs with collection', () => {
    const session = buildShopInventoryOpsSession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.overviewHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=overview`);
    expect(session.reconcileHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=reconcile`);
    expect(session.landedMarginHref).toContain('pcf=rollup');
    expect(session.orderCommsHref).toContain('pcf=tracking');
    expect(shopInventoryFeatureHref('reconcile', 'SS27')).toContain('collection=SS27');
  });
});

describe('shop-order-comms', () => {
  it('builds tracking chat calendar tabs for order', () => {
    const session = buildShopOrderCommsSession({ orderId: 'INT-1', collectionId: 'SS27' });
    expect(session.trackingHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=tracking`);
    expect(session.chatHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=chat`);
    expect(session.matrixHref).toContain('pcf=matrix');
    expect(session.landedMarginHref).toContain('pcf=rollup');
    expect(session.brandOrderChatHref).toContain('pcf=chat');
    expect(session.brandLandedMarginHref).toContain('pcf=simulator');
    expect(session.inventoryOverviewHref).toContain('pcf=overview');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(shopOrderCommsFeatureHref('INT-1', 'calendar', 'SS27')).toContain('pcf=calendar');
  });
});

describe('brand-order-comms', () => {
  it('builds detail chat handoff tabs on brand order card', () => {
    const session = buildBrandOrderCommsSession({ orderId: 'INT-1', collectionId: 'SS27' });
    expect(session.detailHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=detail`);
    expect(session.chatHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=chat`);
    expect(session.productionOpsHref).toContain('pcf=handoff');
    expect(session.shopTrackingHref).toContain('pcf=tracking');
    expect(session.shopLandedMarginHref).toContain('pcf=rollup');
    expect(session.brandLandedMarginHref).toContain('pcf=simulator');
    expect(session.replenishmentAtpHref).toContain('pcf=stock-atp');
    expect(session.inventoryOverviewHref).toContain('pcf=overview');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(session.platformHubHref).toContain('pcf=hub');
    expect(brandOrderCommsFeatureHref('INT-1', 'handoff', 'SS27')).toContain('pcf=handoff');
  });
});

describe('supplier-mrp-supply', () => {
  it('builds supply tab and materials bridge hrefs', () => {
    const session = buildSupplierMrpSupplySession({
      collectionId: 'SS27',
      articleId: 'art-1',
      orderId: 'INT-1',
    });
    expect(session.supplyTabHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=supply`);
    expect(session.materialsHref).toContain('view=procurement');
    expect(session.shopMatrixHref).toContain('pcf=matrix');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(session.manufacturerOrderCommsHref).toContain('pcf=order');
    expect(supplierMrpSupplyFeatureHref('SS27', 'art-1')).toContain('pcf=supply');
  });
});

describe('brand-inventory-ops', () => {
  it('builds overview balance count network tabs with shop bridges', () => {
    const session = buildBrandInventoryOpsSession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.overviewHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=overview`);
    expect(session.countHref).toContain('pcf=count');
    expect(session.networkHref).toContain('pcf=network');
    expect(session.shopInventoryReconcileHref).toContain('pcf=reconcile');
    expect(session.shopLandedMarginHref).toContain('pcf=rollup');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(brandInventoryFeatureHref('balance', 'SS27')).toContain('pcf=balance');
  });
});

describe('brand-pricelist-workspace', () => {
  it('builds versions tiers shop-sync with cross-role hrefs', () => {
    const session = buildBrandPricelistSession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.versionsHref).toContain('pcf=versions');
    expect(session.shopMarginPricelistHref).toContain('pcf=pricelist');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(session.platformPartnersHref).toContain('pcf=directory');
    expect(brandPricelistFeatureHref('tiers', 'SS27')).toContain('pcf=tiers');
  });
});

describe('platform-b2b-hub', () => {
  it('builds hub marketroom partners entry hrefs', () => {
    const session = buildPlatformB2bHubSession({ collectionId: 'SS27' });
    expect(session.hubHref).toContain('pcf=hub');
    expect(session.marketroomShowcaseHref).toContain('/platform/b2b/marketroom');
    expect(session.shopMatrixHref).toContain('pcf=matrix');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(platformB2bHubFeatureHref('partners', 'SS27')).toContain('pcf=partners');
  });
});

describe('brand-landed-margin', () => {
  it('builds simulator pricelist shop-rollup hrefs', () => {
    const session = buildBrandLandedMarginSession({ collectionId: 'SS27', orderId: 'INT-1' });
    expect(session.simulatorHref).toContain('pcf=simulator');
    expect(session.shopRollupHref).toContain('pcf=shop-rollup');
    expect(session.shopMarginRollupHref).toContain('pcf=rollup');
    expect(session.brandOrderCommsChatHref).toContain('pcf=chat');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(brandLandedMarginFeatureHref('pricelist', 'SS27')).toContain('pcf=pricelist');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(session.shopShowroomHref).toContain('pcf=showroom');
  });
});

describe('platform-b2b-marketroom', () => {
  it('builds showcase discover buy-path tabs with shop and brand bridges', () => {
    const session = buildPlatformB2bMarketroomSession({ collectionId: 'SS27' });
    expect(session.showcaseHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase`);
    expect(session.discoverHref).toContain('pcf=discover');
    expect(session.shopShowroomHref).toContain('pcf=showroom');
    expect(session.partnersHref).toContain('pcf=directory');
    expect(session.collaborativeHref).toContain('pcf=session');
    expect(session.shopPrepackHref).toContain('pcf=prepack');
    expect(session.shopLandedMarginHref).toContain('pcf=rollup');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(platformB2bMarketroomFeatureHref('buy-path', 'SS27')).toContain('pcf=buy-path');
  });
});

describe('shop-b2b-partners-workspace', () => {
  it('builds roster discover rep hrefs with platform bridges', () => {
    const session = buildShopB2bPartnersSession({ collectionId: 'SS27' });
    expect(session.rosterHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=roster`);
    expect(session.discoverPageHref).toContain('/shop/b2b/partners/discover');
    expect(session.salesRepPortalHref).toContain('pcf=portal');
    expect(session.orderCommsHref).toContain('pcf=tracking');
    expect(session.shopMatrixHref).toContain('pcf=matrix');
    expect(session.platformHubHref).toContain('pcf=hub');
    expect(session.brandOrderHandoffHref).toContain('pcf=handoff');
    expect(shopB2bPartnersFeatureHref('rep', 'SS27')).toContain('pcf=rep');
  });
});

describe('platform-b2b-partners', () => {
  it('builds directory shop-roster marketroom tabs', () => {
    const session = buildPlatformB2bPartnersSession({ collectionId: 'SS27' });
    expect(session.directoryHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=directory`);
    expect(session.shopRosterHref).toContain('pcf=roster');
    expect(platformB2bPartnersFeatureHref('marketroom', 'SS27')).toContain('pcf=showcase');
    expect(session.buyPathHref).toContain('pcf=buy-path');
    expect(session.orderCommsHref).toContain('pcf=tracking');
    expect(session.platformHubHref).toContain('pcf=hub');
  });
});

describe('manufacturer-production-ops', () => {
  it('builds orders wip cut-ticket factory hrefs', () => {
    const session = buildManufacturerProductionOpsSession({
      collectionId: 'SS27',
      orderId: 'INT-1',
    });
    expect(session.ordersHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=orders`);
    expect(session.brandCutTicketHref).toContain('pcf=cut-ticket');
    expect(session.brandOrderHandoffHref).toContain('pcf=handoff');
    expect(session.shopLandedMarginHref).toContain('pcf=rollup');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(manufacturerProductionOpsFeatureHref('wip', { collectionId: 'SS27' })).toContain(
      'pcf=wip'
    );
  });
});

describe('manufacturer-order-comms', () => {
  it('builds order tab with factory messages and brand bridges', () => {
    const session = buildManufacturerOrderCommsSession({ orderId: 'INT-1', collectionId: 'SS27' });
    expect(session.orderTabHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=order`);
    expect(session.shopTrackingHref).toContain('pcf=tracking');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(session.shopLandedMarginHref).toContain('pcf=rollup');
    expect(session.productionOpsCutTicketHref).toContain('pcf=cut-ticket');
    expect(session.brandOrderHandoffHref).toContain('pcf=handoff');
    expect(manufacturerOrderCommsFeatureHref('INT-1', 'SS27')).toContain('pcf=order');
  });
});

describe('manufacturer-comms-workspace', () => {
  it('builds inbox entities order handoff shop tracking golden path', () => {
    const session = buildManufacturerCommsWorkspaceSession({
      orderId: 'INT-1',
      collectionId: 'SS27',
      factoryId: 'FW27',
    });
    expect(session.inboxHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=inbox`);
    expect(session.entitiesHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=entities`);
    expect(session.orderTabHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=order`);
    expect(session.handoffHref).toContain('pcf=handoff');
    expect(session.shopTrackingHref).toContain('pcf=tracking');
    expect(manufacturerCommsWorkspaceFeatureHref('entities', { collectionId: 'SS27' })).toContain(
      'pcf=entities'
    );
  });
});

describe('supplier-order-comms', () => {
  it('builds order tab with supplier messages and procurement bridges', () => {
    const session = buildSupplierOrderCommsSession({
      orderId: 'INT-1',
      collectionId: 'SS27',
      articleId: 'art-1',
    });
    expect(session.orderTabHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=order`);
    expect(session.supplyTabHref).toContain('pcf=supply');
    expect(session.shopLandedMarginHref).toContain('pcf=rollup');
    expect(session.shopOrderCommsHref).toContain('pcf=tracking');
    expect(session.brandOrderHandoffHref).toContain('pcf=handoff');
    expect(session.manufacturerOrderHref).toContain('pcf=order');
    expect(session.replenishmentAtpHref).toContain('pcf=stock-atp');
    expect(session.inventoryOverviewHref).toContain('pcf=overview');
    expect(supplierOrderCommsFeatureHref('INT-1', 'SS27', 'art-1')).toContain('pcf=order');
  });
});

describe('brand-crm-segmentation', () => {
  it('builds segments pricelist showroom tabs', () => {
    const session = buildBrandCrmSegmentationSession({ collectionId: 'SS27' });
    expect(session.segmentsHref).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=segments`);
    expect(session.brandShowroomPreviewHref).toContain('pcf=preview');
    expect(session.shopMarginPricelistHref).toContain('pcf=pricelist');
    expect(session.platformMarketroomHref).toContain('/platform/b2b/marketroom');
    expect(session.platformPartnersHref).toContain('pcf=directory');
    expect(session.orderCommsHref).toContain('pcf=tracking');
    expect(brandCrmSegmentationFeatureHref('showroom', 'SS27')).toContain('pcf=showroom');
  });
});
