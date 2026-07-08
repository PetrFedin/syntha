import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
/**
 * Единый реестр возможностей (Onfinity + PLM/ERP/wholesale референсы) × 5 столпов × 4 роли.
 * SoT для cross-links и audit — не дублировать экраны, улучшать существующие маршруты.
 */
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  demoArticle,
  demoCollection,
  demoOrder,
  resolveCommsEntityThreadsHref,
  resolveCommsOrderContextHref,
  resolveCoAgentRepHref,
  resolveCoCollaborativeOrderHref,
  resolveCoLandedMarginHref,
  resolveCoPrepackCurveHref,
  resolveCoPricelistVersionHref,
  resolveCoReplenishmentHref,
  resolveCoWholesaleMatrixHref,
  resolveCoWorkingOrderHref,
  resolveDevMaterialPassportHref,
  resolveDevRfqSupplierHref,
  resolveDevSupplierModelBomHref,
  resolveOpCutTicketWipHref,
  resolveOpHandoffQueueHref,
  resolveOpFactoryTechpackAckHref,
  resolveOpInventoryAtpHref,
  resolveOpMrpSupplyHref,
  resolveOpPhysicalCountHref,
  resolveOpQcGateHref,
  resolveScShowroomBuyHref,
} from '@/lib/platform/pillar-capability-role-resolve';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import {
  ROUTES,
  shopB2bMatrixOrderContextHref,
  shopB2bTrackingOrderHref,
  shopB2bWorkingOrderOrderContextHref,
} from '@/lib/routes';

export type PillarCapabilityPhase = 'now' | 'next' | 'phase4';
export type PillarCapabilityStatus = 'live' | 'enhance' | 'planned';

export type PillarCapabilityContext = {
  collectionId?: string;
  orderId?: string;
  articleId?: string;
  /** Роль для role-aware resolveHref (cross-links, hub matrix). */
  role?: CoreChainRoleId;
  /** Platform Core hub (:3001) vs role cabinet — для platform-* workspaces. */
  surface?: 'platform' | 'cabinet';
  /** Текущий workspace для platform-aware resolveHref. */
  workspaceId?: string;
};

export type PillarCapabilityEntry = {
  id: string;
  titleRu: string;
  summaryRu: string;
  pillar: CoreHubPillarId;
  roles: readonly CoreChainRoleId[];
  externalRefs: readonly string[];
  status: PillarCapabilityStatus;
  phase: PillarCapabilityPhase;
  /** Существующий модуль, который усиливаем (без параллельного экрана). */
  improves?: string;
  resolveHref: (ctx: PillarCapabilityContext) => string;
  relatedIds: readonly string[];
};

export const PILLAR_CAPABILITY_REGISTRY: readonly PillarCapabilityEntry[] = [
  {
    id: 'dev-sample-lifecycle',
    titleRu: 'Раунды образца → утверждение',
    summaryRu: 'Centric/Lectra: sample 1→2→approved перед release.',
    pillar: 'development',
    roles: ['brand'],
    externalRefs: ['Centric PLM', 'Lectra Kubix'],
    status: 'enhance',
    phase: 'now',
    improves: 'Workshop 2 pipeline + publish gate + factory pack export sheets',
    resolveHref: (ctx) =>
      `${ROUTES.brand.productionWorkshop2}?collection=${encodeURIComponent(demoCollection(ctx))}&${PILLAR_CAPABILITY_FEATURE_PARAM}=rounds`,
    relatedIds: ['sc-release-gate', 'dev-size-chart-grade', 'op-handoff-queue'],
  },
  {
    id: 'dev-attribute-schema',
    titleRu: 'Схемы атрибутов и color/size',
    summaryRu: 'Onfinity Attribute Set по категории; не свободный ввод.',
    pillar: 'development',
    roles: ['brand'],
    externalRefs: ['Onfinity', 'Centric PLM'],
    status: 'enhance',
    phase: 'now',
    improves: 'category handbook + ProductVariantManager',
    resolveHref: () => ROUTES.brand.attributeHealth,
    relatedIds: [
      'dev-size-chart-grade',
      'sc-release-gate',
      'co-wholesale-matrix',
      'dev-sample-lifecycle',
    ],
  },
  {
    id: 'dev-size-chart-grade',
    titleRu: 'Размерная сетка и grade rules',
    summaryRu: 'Yunique/Gerber: size chart SoT для size schema.',
    pillar: 'development',
    roles: ['brand'],
    externalRefs: ['Yunique PLM', 'Gerber'],
    status: 'enhance',
    phase: 'now',
    improves: 'Workshop 2 basic params + brand-attribute-schema size-chart tab',
    resolveHref: (ctx) =>
      workshop2ArticleHref(demoCollection(ctx), demoArticle(ctx), { w2pane: 'tz', w2sec: 'size' }),
    relatedIds: ['dev-attribute-schema', 'co-prepack-curve'],
  },
  {
    id: 'dev-supplier-model-bom',
    titleRu: 'Supplier model · fabric · BOM',
    summaryRu: 'Onfinity + Apparel Magic: refs для цеха, не retail PIM.',
    pillar: 'development',
    roles: ['brand', 'supplier'],
    externalRefs: ['Onfinity', 'Apparel Magic'],
    status: 'enhance',
    phase: 'now',
    improves: 'Workshop 2 supply / BOM panel',
    resolveHref: resolveDevSupplierModelBomHref,
    relatedIds: ['dev-rfq-supplier', 'op-mrp-supply', 'op-cut-ticket-wip', 'dev-material-passport'],
  },
  {
    id: 'dev-rfq-supplier',
    titleRu: 'RFQ поставщику',
    summaryRu: 'Centric RFQ → quote → award в spine.',
    pillar: 'development',
    roles: ['brand', 'supplier'],
    externalRefs: ['Centric PLM', 'Lectra'],
    status: 'enhance',
    phase: 'now',
    improves: 'Centric page RFQ workspace + registry API',
    resolveHref: resolveDevRfqSupplierHref,
    relatedIds: ['dev-supplier-model-bom', 'comms-entity-threads', 'op-mrp-supply'],
  },
  {
    id: 'dev-material-passport',
    titleRu: 'Material passport · сертификаты',
    summaryRu: 'Material Exchange: composition + certs в release.',
    pillar: 'development',
    roles: ['brand', 'supplier'],
    externalRefs: ['Material Exchange'],
    status: 'enhance',
    phase: 'now',
    improves: 'fabric passport workspace: rollup · certs · release',
    resolveHref: resolveDevMaterialPassportHref,
    relatedIds: ['sc-release-gate', 'dev-supplier-model-bom'],
  },
  {
    id: 'sc-showroom-buy',
    titleRu: 'Витрина коллекции · buying tool',
    summaryRu: 'JOOR/NuOrder/Onfinity: заказ из коллекции с фото.',
    pillar: 'sample_collection',
    roles: ['shop', 'brand'],
    externalRefs: ['JOOR', 'NuOrder', 'Onfinity'],
    status: 'live',
    phase: 'now',
    improves: 'shop-showroom-buy workspace + inline qty + cover hero (dossier PG)',
    resolveHref: resolveScShowroomBuyHref,
    relatedIds: [
      'co-wholesale-matrix',
      'sc-linesheet-syndication',
      'co-replenishment-workspace',
      'sc-showroom-3d-stream',
    ],
  },
  {
    id: 'sc-showroom-3d-stream',
    titleRu: '3D virtual showroom',
    summaryRu: 'Embed stream · session SLA · contextual metrics в чат артикула.',
    pillar: 'sample_collection',
    roles: ['shop'],
    externalRefs: ['Matterport', 'NuOrder virtual'],
    status: 'live',
    phase: 'now',
    improves: 'B2b3dStreamPanel + stream-token / 3d-view / 3d-session API',
    resolveHref: (ctx) => {
      const collection = demoCollection(ctx);
      return `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collection)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=3d-stream`;
    },
    relatedIds: ['sc-showroom-buy', 'comms-order-context', 'co-wholesale-matrix'],
  },
  {
    id: 'sc-linesheet-syndication',
    titleRu: 'Лайншит · syndication feed',
    summaryRu: 'Colect/Fashion Cloud: outbound после release.',
    pillar: 'sample_collection',
    roles: ['brand'],
    externalRefs: ['Colect', 'Fashion Cloud'],
    status: 'enhance',
    phase: 'now',
    improves: 'syndication tab push + bulk showroom publish workspace tab',
    resolveHref: () =>
      `${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=showroom-publish`,
    relatedIds: ['sc-showroom-buy', 'sc-release-gate'],
  },
  {
    id: 'sc-release-gate',
    titleRu: 'Release gate коллекции',
    summaryRu: 'Centric: checklist перед B2B publish.',
    pillar: 'sample_collection',
    roles: ['brand'],
    externalRefs: ['Centric PLM', 'Onfinity'],
    status: 'enhance',
    phase: 'now',
    improves: 'launch-readiness + showroom publish + factory pack gate',
    resolveHref: () =>
      `${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=checklist`,
    relatedIds: ['dev-sample-lifecycle', 'dev-attribute-schema', 'sc-showroom-buy'],
  },
  {
    id: 'sc-wssi-plan',
    titleRu: 'Buy plan · WSSI vs capacity',
    summaryRu: 'Fast React: план закупки vs мощность цеха.',
    pillar: 'sample_collection',
    roles: ['brand'],
    externalRefs: ['Fast React'],
    status: 'enhance',
    phase: 'now',
    improves: 'assortment-mix-planner workspace: OTB · mix · capacity',
    resolveHref: () =>
      `${ROUTES.brand.assortmentMixPlanner}?${PILLAR_CAPABILITY_FEATURE_PARAM}=otb`,
    relatedIds: ['co-wholesale-matrix', 'op-mrp-supply', 'sc-showroom-buy', 'co-prepack-curve'],
  },
  {
    id: 'co-wholesale-matrix',
    titleRu: 'Оптовая матрица',
    summaryRu: 'JOOR/NuOrder: color×size, MOQ, delivery windows.',
    pillar: 'collection_order',
    roles: ['shop', 'brand'],
    externalRefs: ['JOOR', 'NuOrder'],
    status: 'live',
    phase: 'now',
    resolveHref: resolveCoWholesaleMatrixHref,
    relatedIds: ['co-working-order', 'co-replenishment-workspace', 'co-prepack-curve'],
  },
  {
    id: 'co-replenishment-workspace',
    titleRu: 'Replenishment workspace',
    summaryRu: 'Onfinity: ATP table, rules, filter slices → reorder.',
    pillar: 'collection_order',
    roles: ['shop'],
    externalRefs: ['Onfinity', 'RELEX'],
    status: 'enhance',
    phase: 'now',
    improves: 'SmartReplenishment + inventory ledger',
    resolveHref: resolveCoReplenishmentHref,
    relatedIds: [
      'co-wholesale-matrix',
      'co-working-order',
      'op-inventory-atp',
      'op-physical-count',
      'co-landed-margin',
      'co-intake-allocate',
    ],
  },
  {
    id: 'co-intake-allocate',
    titleRu: 'Intake allocation · B2B priority',
    summaryRu: 'Warehouse batch × demand → persisted allocation plan (PG).',
    pillar: 'collection_order',
    roles: ['brand', 'shop'],
    externalRefs: ['Onfinity', 'RELEX'],
    status: 'live',
    phase: 'now',
    improves: 'POST /api/b2b/intake/allocate + replenishment ATP tab',
    resolveHref: (ctx) =>
      `${LEGACY_ROUTES.shop.b2bReplenishment}?${PILLAR_CAPABILITY_FEATURE_PARAM}=stock-atp&collection=${encodeURIComponent(demoCollection(ctx))}`,
    relatedIds: ['co-replenishment-workspace', 'co-wholesale-matrix', 'op-inventory-atp'],
  },
  {
    id: 'co-prepack-curve',
    titleRu: 'Pre-pack · size curve',
    summaryRu: 'Aptos/Oracle Retail: кривая размеров в matrix.',
    pillar: 'collection_order',
    roles: ['shop', 'brand'],
    externalRefs: ['Aptos', 'Oracle Retail'],
    status: 'enhance',
    phase: 'now',
    improves: 'brand pack-rules workspace + matrix prepack + cart apply',
    resolveHref: resolveCoPrepackCurveHref,
    relatedIds: ['co-wholesale-matrix', 'dev-size-chart-grade', 'co-pricelist-version'],
  },
  {
    id: 'co-pricelist-version',
    titleRu: 'Pricelist version · tier',
    summaryRu: 'Onfinity: версия прайса по сезону/каналу.',
    pillar: 'collection_order',
    roles: ['brand', 'shop'],
    externalRefs: ['Onfinity', 'JOOR'],
    status: 'enhance',
    phase: 'now',
    improves: 'price lists workspace: versions · tiers · shop sync',
    resolveHref: resolveCoPricelistVersionHref,
    relatedIds: ['co-wholesale-matrix', 'co-landed-margin', 'co-agent-rep'],
  },
  {
    id: 'co-working-order',
    titleRu: 'Working Order (Excel)',
    summaryRu: 'NuOrder: bulk entry из replenishment/matrix.',
    pillar: 'collection_order',
    roles: ['shop'],
    externalRefs: ['NuOrder'],
    status: 'live',
    phase: 'now',
    improves: 'working-order workspace: versions · bulk · handoff + WMS reserve copy',
    resolveHref: resolveCoWorkingOrderHref,
    relatedIds: [
      'co-wholesale-matrix',
      'co-replenishment-workspace',
      'co-collaborative-order',
      'comms-order-context',
    ],
  },
  {
    id: 'co-landed-margin',
    titleRu: 'Landed cost · маржа',
    summaryRu: 'BlueCherry: margin roll-up для байера.',
    pillar: 'collection_order',
    roles: ['shop', 'brand'],
    externalRefs: ['BlueCherry', 'Onfinity'],
    status: 'live',
    phase: 'now',
    improves: 'brand-landed-margin workspace + shop-landed-margin tabs',
    resolveHref: resolveCoLandedMarginHref,
    relatedIds: ['co-pricelist-version', 'co-replenishment-workspace', 'co-collaborative-order'],
  },
  {
    id: 'co-agent-rep',
    titleRu: 'Agent / sales rep portal',
    summaryRu: 'RepSpark/Zedonk: rep + commission split.',
    pillar: 'collection_order',
    roles: ['shop', 'brand'],
    externalRefs: ['RepSpark', 'Zedonk'],
    status: 'enhance',
    phase: 'now',
    improves: 'shop-b2b-partners rep tab + shop-agent-rep + brand-agent-rep workspaces',
    resolveHref: resolveCoAgentRepHref,
    relatedIds: [
      'co-wholesale-matrix',
      'co-collaborative-order',
      'co-landed-margin',
      'co-pricelist-version',
    ],
  },
  {
    id: 'co-collaborative-order',
    titleRu: 'Collaborative order',
    summaryRu: 'NuOrder: co-edit matrix + approval.',
    pillar: 'collection_order',
    roles: ['shop'],
    externalRefs: ['NuOrder', 'Candid'],
    status: 'enhance',
    phase: 'now',
    improves: 'collaborative-order workspace (session · approvals · comms)',
    resolveHref: resolveCoCollaborativeOrderHref,
    relatedIds: ['co-wholesale-matrix', 'comms-order-context', 'co-replenishment-workspace'],
  },
  {
    id: 'op-handoff-queue',
    titleRu: 'Handoff → очередь цеха',
    summaryRu: 'W2: B2B PO → production order.',
    pillar: 'order_production',
    roles: ['brand', 'manufacturer'],
    externalRefs: ['Apparel Magic', 'WFX'],
    status: 'live',
    phase: 'now',
    improves: 'manufacturer-handoff-queue workspace (sample · handoff · orders · factory-ack)',
    resolveHref: resolveOpHandoffQueueHref,
    relatedIds: [
      'op-cut-ticket-wip',
      'dev-sample-lifecycle',
      'op-qc-gate',
      'op-factory-techpack-ack',
    ],
  },
  {
    id: 'op-factory-techpack-ack',
    titleRu: 'Factory-ack · tech pack',
    summaryRu: 'Приёмка ТЗ цехом → dossier handoff/factory-ack.',
    pillar: 'order_production',
    roles: ['manufacturer'],
    externalRefs: ['Apparel Magic', 'WFX'],
    status: 'live',
    phase: 'now',
    improves: 'manufacturer-handoff-queue techpack-ack tab + FactoryDossierTechPackAckPanel',
    resolveHref: resolveOpFactoryTechpackAckHref,
    relatedIds: ['op-handoff-queue', 'op-qc-gate', 'dev-sample-lifecycle'],
  },
  {
    id: 'op-cut-ticket-wip',
    titleRu: 'Cut ticket · WIP routing',
    summaryRu: 'Apparel Magic/WFX: cut→sew→finish + WIP %.',
    pillar: 'order_production',
    roles: ['manufacturer', 'brand'],
    externalRefs: ['Apparel Magic', 'WFX', 'DeSL'],
    status: 'enhance',
    phase: 'now',
    improves: 'manufacturer-production-ops + brand-production-ops cut-ticket tab',
    resolveHref: resolveOpCutTicketWipHref,
    relatedIds: ['op-handoff-queue', 'op-qc-gate', 'op-mrp-supply'],
  },
  {
    id: 'op-qc-gate',
    titleRu: 'QC gate перед отгрузкой',
    summaryRu: 'Inspectorio pattern: AQL checklist + evidence.',
    pillar: 'order_production',
    roles: ['brand', 'manufacturer'],
    externalRefs: ['Inspectorio', 'Onfinity QC'],
    status: 'enhance',
    phase: 'now',
    improves: 'brand production ops + manufacturer handoff qc tab',
    resolveHref: resolveOpQcGateHref,
    relatedIds: ['op-handoff-queue', 'op-cut-ticket-wip'],
  },
  {
    id: 'op-mrp-supply',
    titleRu: 'MRP · shortage → PO',
    summaryRu: 'Onfinity MRP: BOM × order qty → procurement.',
    pillar: 'order_production',
    roles: ['brand', 'supplier'],
    externalRefs: ['Onfinity', 'Centric'],
    status: 'enhance',
    phase: 'now',
    improves: 'supplier-procurement supply tab + W2 supply panel + replenishment suggest API',
    resolveHref: resolveOpMrpSupplyHref,
    relatedIds: ['dev-supplier-model-bom', 'co-replenishment-workspace', 'dev-rfq-supplier'],
  },
  {
    id: 'sup-collection-order-forecast',
    titleRu: 'Forecast · B2B × BOM',
    summaryRu: 'Поставщик: потребность сырья по строкам оптового заказа (peer collection_order).',
    pillar: 'collection_order',
    roles: ['supplier'],
    externalRefs: ['Onfinity MRP'],
    status: 'live',
    phase: 'now',
    improves: 'SupplierCollectionOrderForecast + supplier-procurement forecast tab',
    resolveHref: (ctx) =>
      `${EXTENDED_ROUTES.factory.supplierMessages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=forecast&collection=${encodeURIComponent(demoCollection(ctx))}`,
    relatedIds: [
      'co-wholesale-matrix',
      'dev-supplier-model-bom',
      'op-mrp-supply',
      'op-handoff-queue',
      'dev-rfq-supplier',
    ],
  },
  {
    id: 'op-inventory-atp',
    titleRu: 'ATP · ledger grains',
    summaryRu: 'Onfinity/SAP: on hand − reserved = ATP.',
    pillar: 'order_production',
    roles: ['shop', 'brand'],
    externalRefs: ['Onfinity', 'SAP Fashion'],
    status: 'enhance',
    phase: 'now',
    improves: 'shop-inventory-ops + brand-inventory-ops workspaces',
    resolveHref: resolveOpInventoryAtpHref,
    relatedIds: ['co-replenishment-workspace', 'op-physical-count'],
  },
  {
    id: 'op-physical-count',
    titleRu: 'Physical count · reconcile',
    summaryRu: 'Onfinity: cycle count → discrepancy → adjust ledger (журнал API).',
    pillar: 'order_production',
    roles: ['shop', 'brand'],
    externalRefs: ['Onfinity'],
    status: 'enhance',
    phase: 'now',
    improves: 'shop-inventory-ops reconcile + brand-inventory-ops count tab',
    resolveHref: resolveOpPhysicalCountHref,
    relatedIds: ['op-inventory-atp', 'co-replenishment-workspace'],
  },
  {
    id: 'comms-order-context',
    titleRu: 'Чат · календарь по заказу',
    summaryRu: 'Надстройка №3: контекст order/article в comms.',
    pillar: 'comms',
    roles: ['brand', 'shop', 'manufacturer', 'supplier'],
    externalRefs: ['NuOrder collab'],
    status: 'live',
    phase: 'now',
    improves:
      'shop-order-comms + brand-order-comms + manufacturer-comms + supplier-procurement order tab',
    resolveHref: resolveCommsOrderContextHref,
    relatedIds: [
      'co-wholesale-matrix',
      'co-collaborative-order',
      'op-handoff-queue',
      'op-mrp-supply',
    ],
  },
  {
    id: 'comms-entity-threads',
    titleRu: 'Threads на BOM/sample/QC',
    summaryRu: 'PLM: structured thread per entity line.',
    pillar: 'comms',
    roles: ['brand', 'manufacturer', 'supplier'],
    externalRefs: ['Centric PLM'],
    status: 'enhance',
    phase: 'now',
    improves: 'brand/manufacturer/supplier entity thread workspaces',
    resolveHref: resolveCommsEntityThreadsHref,
    relatedIds: ['dev-rfq-supplier', 'op-qc-gate'],
  },
  {
    id: 'crm-segmentation',
    titleRu: 'BP Segmentation · saved lists',
    summaryRu: 'Onfinity Phase 4: validate → run segments.',
    pillar: 'comms',
    roles: ['brand'],
    externalRefs: ['Onfinity CRM'],
    status: 'enhance',
    phase: 'now',
    improves: 'brand-crm-segmentation workspace on customer-groups',
    resolveHref: () => `${LEGACY_ROUTES.brand.customerGroups}?${PILLAR_CAPABILITY_FEATURE_PARAM}=segments`,
    relatedIds: ['sc-showroom-buy', 'co-wholesale-matrix', 'co-agent-rep'],
  },
] as const;

const REGISTRY_BY_ID = new Map(PILLAR_CAPABILITY_REGISTRY.map((e) => [e.id, e]));

export function getPillarCapabilityById(id: string): PillarCapabilityEntry | undefined {
  return REGISTRY_BY_ID.get(id);
}

export function listPillarCapabilities(filter?: {
  pillar?: CoreHubPillarId;
  role?: CoreChainRoleId;
  phase?: PillarCapabilityPhase;
}): PillarCapabilityEntry[] {
  return PILLAR_CAPABILITY_REGISTRY.filter((e) => {
    if (filter?.pillar && e.pillar !== filter.pillar) return false;
    if (filter?.role && !e.roles.includes(filter.role)) return false;
    if (filter?.phase && e.phase !== filter.phase) return false;
    return true;
  });
}
