import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';

type PillarStep = { id: string; labelRu: string; done: boolean };

export type DevelopmentPillarSnapshot = {
  status: {
    collectionId: string;
    articleCount: number;
    sampleQueueCount: number;
    factoryId: string;
    steps: PillarStep[];
    workshop2Href: string;
    factorySampleHref: string;
    factoryDossierHref: string;
    supplierBomHref: string;
    linesheetHref: string;
    demoArticleId: string;
  };
  bomLineCount: number | null;
  bomMaterialPreviews: Array<{
    name: string;
    unitLabelRu: string;
    consumptionLabel?: string;
  }>;
  sampleStatus: string | null;
  sampleQueuePosition: number | null;
  sampleQueueTotal: number | null;
};

export type SampleCollectionPillarSnapshot = {
  status: {
    collectionId: string;
    articleCount?: number;
    publishedCount: number;
    readyForBuyers: boolean;
    steps: PillarStep[];
    showroomHref: string;
    linesheetHref: string;
    linesheetPdfHref?: string | null;
    workshop2Href: string;
    shopShowroomHref: string;
    shopMatrixHref: string;
  };
};

export type CollectionOrderPillarSnapshot = {
  orderId: string;
  chainSteps: PillarStep[];
  orderQty: number | null;
  orderTotalRub: number | null;
  exportReady: boolean;
  trackingNumber: string | null;
};

/** Manufacturer × collection_order empty-cell — handoff queue + chain (BFF). */
export type ManufacturerCollectionOrderInsightSnapshot = {
  orderId: string;
  orderStatusLabel: string | null;
  productionOrderId: string | null;
  queueHit: boolean;
  chainSteps: PillarStep[];
};

export type SupplierCollectionOrderForecastRow = {
  articleId: string;
  orderQty: number;
  materials: Array<{ name: string; unitLabelRu: string; consumptionLabel?: string }>;
  supplierConfirmed: boolean;
};

/** Supplier × collection_order empty-cell — order lines × BOM forecast (BFF). */
export type SupplierCollectionOrderForecastSnapshot = {
  orderId: string;
  orderStatusLabel: string | null;
  totalUnits: number;
  rows: SupplierCollectionOrderForecastRow[];
  /** Handoff queue PG · read-only expected PO date for supplier empty CO. */
  productionOrderId?: string | null;
  expectedHandoffAt?: string | null;
};

export type OrderProductionHandoffItem = {
  b2bOrderId: string;
  productionOrderId: string;
  articleId?: string;
  collectionId?: string;
  status?: string;
  wipStatus?: string;
};

export type OrderProductionPillarSnapshot = {
  orderId: string;
  chainSteps: PillarStep[];
  productionOrderId: string | null;
  handoffItems: OrderProductionHandoffItem[];
  bomLineCount: number | null;
  bomPreviewLines: Array<{ materialName?: string }>;
  /** Shop INT-* · из PG spine (без dup client fetch tracking API). */
  trackingPreview?: {
    trackingNumber?: string;
    carrier?: string;
    status?: string;
    wipLabelRu?: string;
    deliveryLabel?: string;
  } | null;
};

export type CommsPillarSnapshot = {
  orderId: string;
  commsThreadCount: number;
  calendarEventCount: number;
  deliveryWindowCount: number;
};

export type SupplierProcurementBomLine = {
  materialName?: string;
  quantity?: number;
  yieldPerUnit?: number;
  consumption?: number;
  unit?: string;
};

/** Spine overlay для INT-* (из getSpineProcurementContext, без client fetch). */
export type SupplierProcurementSpineSnapshot = {
  b2bOrderId: string;
  isSpineImported: boolean;
  poId?: string;
  chainHandedOff?: boolean;
  chainMaterialsSupplied?: boolean;
  deliveryLabel?: string;
  centricRfq?: {
    rfqId: string;
    status: string;
    lines: Array<{ materialName: string; qty: number; unit?: string }>;
  };
  vendorPo?: {
    vendorPoId: string;
    status: string;
    lines: Array<{
      materialName: string;
      qty: number;
      unit?: string;
      ackQty?: number;
      ackDate?: string;
    }>;
  };
};

/** Supplier × order_production — один server snapshot вместо 4+ client fetch. */
export type SupplierProcurementPillarSnapshot = {
  orderId: string;
  productionOrderId: string | null;
  poReady: boolean;
  poQty: number;
  bomLines: SupplierProcurementBomLine[];
  chainSteps: PillarStep[];
  handoffQueueCount: number;
  procurementSpine: SupplierProcurementSpineSnapshot | null;
};

export type PlatformCorePillarSnapshotPayload =
  | { pillarId: 'development'; development: DevelopmentPillarSnapshot }
  | { pillarId: 'sample_collection'; sampleCollection: SampleCollectionPillarSnapshot }
  | { pillarId: 'collection_order'; collectionOrder: CollectionOrderPillarSnapshot }
  | {
      pillarId: 'collection_order';
      manufacturerCollectionOrder: ManufacturerCollectionOrderInsightSnapshot;
    }
  | {
      pillarId: 'collection_order';
      supplierCollectionOrderForecast: SupplierCollectionOrderForecastSnapshot;
    }
  | { pillarId: 'order_production'; orderProduction: OrderProductionPillarSnapshot }
  | { pillarId: 'order_production'; supplierProcurement: SupplierProcurementPillarSnapshot }
  | { pillarId: 'comms'; comms: CommsPillarSnapshot }
  | { pillarId: CoreHubPillarId; unsupported: true };

export function pickCollectionOrderSnapshot(
  snap: PlatformCorePillarSnapshotPayload | null | undefined
): CollectionOrderPillarSnapshot | null {
  if (snap?.pillarId === 'collection_order' && 'collectionOrder' in snap) {
    return snap.collectionOrder;
  }
  return null;
}

export function pickOrderProductionSnapshot(
  snap: PlatformCorePillarSnapshotPayload | null | undefined
): OrderProductionPillarSnapshot | null {
  if (snap?.pillarId === 'order_production' && 'orderProduction' in snap) {
    return snap.orderProduction;
  }
  return null;
}

export function pickCommsSnapshot(
  snap: PlatformCorePillarSnapshotPayload | null | undefined
): CommsPillarSnapshot | null {
  if (snap?.pillarId === 'comms' && 'comms' in snap) {
    return snap.comms;
  }
  return null;
}

export function pickSampleCollectionStatus(
  snap: PlatformCorePillarSnapshotPayload | null | undefined
): SampleCollectionPillarSnapshot['status'] | null {
  if (snap?.pillarId === 'sample_collection' && 'sampleCollection' in snap) {
    return snap.sampleCollection.status;
  }
  return null;
}
