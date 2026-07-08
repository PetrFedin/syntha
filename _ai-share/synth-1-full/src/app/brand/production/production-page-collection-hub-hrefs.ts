import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import type { CollectionChainDeepLinkHrefs } from '@/lib/production/collection-chain-hrefs';
import { ROUTES } from '@/lib/routes';

export function buildCollectionIdQuery(collectionIdFromQuery: string): string {
  return collectionIdFromQuery ? `?collectionId=${encodeURIComponent(collectionIdFromQuery)}` : '';
}

export type WorkshopFloorTabHrefs = {
  live: string;
  stages: string;
  workshop: string;
  plan: string;
  ops: string;
  nesting: string;
  launch: string;
  quality: string;
  receipt: string;
};

export type BrandProductionWorkshopHubHrefs = {
  suppliesFloorHref: string;
  sampleFloorHref: string;
  liveProcessHref: string;
  workshopFloorTabHrefs: WorkshopFloorTabHrefs;
  b2bLinesheetsHref: string;
  factoriesHref: string;
  warehouseHref: string;
  b2bShipmentsHref: string;
  esgHref: string;
  liveB2bHref: string;
  chainDeepLinkHrefs: CollectionChainDeepLinkHrefs;
};

/** Ссылки для `CollectionWorkshopStageChain` и смежного хаба — только от `collectionId` в query. */
export function buildBrandProductionWorkshopHubHrefs(
  collectionIdFromQuery: string
): BrandProductionWorkshopHubHrefs {
  const collectionQuery = buildCollectionIdQuery(collectionIdFromQuery);

  const suppliesFloorHref = collectionIdFromQuery
    ? `/brand/production?collectionId=${encodeURIComponent(collectionIdFromQuery)}&floorTab=supplies`
    : '/brand/production?floorTab=supplies';

  const sampleFloorHref = collectionIdFromQuery
    ? `/brand/production?collectionId=${encodeURIComponent(collectionIdFromQuery)}&floorTab=sample`
    : '/brand/production?floorTab=sample';

  const liveProcessHref = collectionIdFromQuery
    ? `${ROUTES.brand.processLiveProduction}?collectionId=${encodeURIComponent(collectionIdFromQuery)}`
    : ROUTES.brand.processLiveProduction;

  const tab = (id: string) =>
    collectionIdFromQuery
      ? `/brand/production?collectionId=${encodeURIComponent(collectionIdFromQuery)}&floorTab=${id}`
      : `/brand/production?floorTab=${id}`;

  const workshopFloorTabHrefs: WorkshopFloorTabHrefs = {
    live: tab('live'),
    stages: tab('stages'),
    workshop: tab('workshop'),
    plan: tab('plan'),
    ops: tab('ops'),
    nesting: tab('nesting'),
    launch: tab('launch'),
    quality: tab('quality'),
    receipt: tab('receipt'),
  };

  const b2bLinesheetsHref = collectionQuery
    ? `${ROUTES.brand.b2bLinesheets}${collectionQuery}`
    : ROUTES.brand.b2bLinesheets;

  const factoriesHref = collectionQuery
    ? `${ROUTES.brand.factories}${collectionQuery}`
    : ROUTES.brand.factories;

  const warehouseHref = collectionQuery
    ? `${ROUTES.brand.warehouse}${collectionQuery}`
    : ROUTES.brand.warehouse;

  const b2bShipmentsHref = collectionQuery
    ? `${LEGACY_ROUTES.brand.b2bShipments}${collectionQuery}`
    : LEGACY_ROUTES.brand.b2bShipments;

  const esgHref = collectionQuery ? `${ROUTES.brand.esg}${collectionQuery}` : ROUTES.brand.esg;

  const liveB2bHref = collectionIdFromQuery
    ? `${ROUTES.brand.processLiveB2b}?collectionId=${encodeURIComponent(collectionIdFromQuery)}`
    : ROUTES.brand.processLiveB2b;

  const withQ = (path: string) => (collectionQuery ? `${path}${collectionQuery}` : path);

  const chainDeepLinkHrefs: CollectionChainDeepLinkHrefs = {
    productionGantt: withQ(ROUTES.brand.productionGantt),
    productionOperations: withQ(ROUTES.brand.productionOperations),
    productionNesting: withQ(ROUTES.brand.productionNesting),
    productionQcApp: withQ(ROUTES.brand.productionQcApp),
    productionReadyMade: withQ(ROUTES.brand.productionReadyMade),
    logistics: withQ(ROUTES.brand.logistics),
    b2bOrders: withQ(ROUTES.brand.b2bOrders),
    vmi: withQ(ROUTES.brand.vmi),
    b2bLinesheetsCreate: withQ(ROUTES.brand.b2bLinesheetsCreate),
    productionGoldSample: withQ(ROUTES.brand.productionGoldSample),
    productionFitComments: withQ(ROUTES.brand.productionFitComments),
    liveLogistics: collectionIdFromQuery
      ? `${ROUTES.brand.processLiveLogistics}?collectionId=${encodeURIComponent(collectionIdFromQuery)}`
      : ROUTES.brand.processLiveLogistics,
    collections: withQ(ROUTES.brand.collections),
    collectionsNew: ROUTES.brand.collectionsNew,
    pricing: withQ(ROUTES.brand.pricing),
    suppliers: withQ(ROUTES.brand.suppliers),
    suppliersRfq: withQ(ROUTES.brand.suppliersRfq),
    materialsReservation: withQ(ROUTES.brand.materialsReservation),
    contentHub: withQ(ROUTES.brand.contentHub),
    integrationsErpPlm: withQ(ROUTES.brand.integrationsErpPlm),
    messages: withQ(ROUTES.brand.messages),
    calendar: withQ(ROUTES.brand.calendar),
    tasks: withQ(ROUTES.brand.tasks),
    teamTasks: ROUTES.brand.teamTasks,
    compliance: withQ(ROUTES.brand.compliance),
    circularHub: withQ(ROUTES.brand.circularHub),
    warehouse: withQ(ROUTES.brand.warehouse),
  };

  return {
    suppliesFloorHref,
    sampleFloorHref,
    liveProcessHref,
    workshopFloorTabHrefs,
    b2bLinesheetsHref,
    factoriesHref,
    warehouseHref,
    b2bShipmentsHref,
    esgHref,
    liveB2bHref,
    chainDeepLinkHrefs,
  };
}
