import 'server-only';

import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';
import { getWorkshop2DevelopmentStatus } from '@/lib/server/workshop2-development-status';
import { listWorkshop2FactorySampleQueue } from '@/lib/production/workshop2-factory-sample-queue';
import type {
  CommsPillarSnapshot,
  OrderProductionHandoffItem,
  PlatformCorePillarSnapshotPayload,
  SupplierProcurementBomLine,
  SupplierProcurementPillarSnapshot,
} from '@/lib/platform-core-pillar-snapshot.types';

type PillarStep = { id: string; labelRu: string; done: boolean };

const DEMO_BOM_LINES: SupplierProcurementBomLine[] = [
  { materialName: 'Хлопок 180 г/м²', quantity: 1.2, unit: 'м', consumption: 1.2 },
  { materialName: 'Подкладка вискоза', quantity: 0.8, unit: 'м', consumption: 0.8 },
  { materialName: 'Фурнитура комплект', quantity: 1, unit: 'шт', consumption: 1 },
];

function demoChainSteps(): PillarStep[] {
  return [
    { id: 'handed_off', labelRu: 'Передано в производство', done: true },
    { id: 'materials_supplied', labelRu: 'Материалы поставлены', done: false },
    { id: 'in_production', labelRu: 'В производстве', done: false },
    { id: 'shipped', labelRu: 'Отгрузка', done: false },
  ];
}

function demoHandoffItems(
  orderId: string,
  collectionId: string,
  articleId: string
): OrderProductionHandoffItem[] {
  return [
    {
      b2bOrderId: orderId,
      productionOrderId: `PO-DEMO-${orderId.slice(-6)}`,
      articleId,
      collectionId,
      status: 'pending_ack',
      wipStatus: 'queued',
    },
  ];
}

function buildSupplierProcurementOffline(
  collectionId: string,
  _factoryId: string,
  _articleId: string,
  orderId: string
): SupplierProcurementPillarSnapshot {
  return {
    orderId,
    productionOrderId: `PO-DEMO-${orderId.slice(-6)}`,
    poReady: true,
    poQty: 120,
    bomLines: DEMO_BOM_LINES,
    chainSteps: demoChainSteps(),
    handoffQueueCount: 1,
    procurementSpine: {
      b2bOrderId: orderId,
      isSpineImported: false,
      poId: `PO-DEMO-${orderId.slice(-6)}`,
      chainHandedOff: true,
      chainMaterialsSupplied: false,
    },
  };
}

function buildCommsOffline(orderId: string): CommsPillarSnapshot {
  return {
    orderId,
    commsThreadCount: 2,
    calendarEventCount: 3,
    deliveryWindowCount: 1,
  };
}

/** Тихий demo/file snapshot когда PG URL задан, но :5433 недоступен. */
export async function buildPlatformCorePillarSnapshotOffline(input: {
  collectionId: string;
  pillarId: CoreHubPillarId;
  roleId?: CoreChainRoleId;
  factoryId?: string;
  wholesaleOrderId?: string;
  articleId?: string;
  pillarVariant?: 'brand' | 'shop' | 'manufacturer';
}): Promise<PlatformCorePillarSnapshotPayload> {
  const cid = input.collectionId.trim();
  const demo = getPlatformCoreDemo(cid);
  const factoryId = input.factoryId?.trim() || demo.factoryId;
  const articleId = input.articleId?.trim() || demo.demoArticleId;
  const orderId =
    input.wholesaleOrderId?.trim() ||
    (demo.demoOrderId.startsWith('__') ? '' : demo.demoOrderId);

  if (input.pillarId === 'development') {
    const status = await getWorkshop2DevelopmentStatus(cid, factoryId, { skipRangePlanner: true });
    const queue = await listWorkshop2FactorySampleQueue({ factoryId });
    const items = queue.items.filter((i) => i.collectionId === cid);
    const hitIndex = items.findIndex((i) => i.articleId === articleId);
    return {
      pillarId: 'development',
      development: {
        status,
        bomLineCount: DEMO_BOM_LINES.length,
        bomMaterialPreviews: DEMO_BOM_LINES.map((l) => ({
          name: l.materialName ?? 'Материал',
          unitLabelRu: l.unit ?? 'шт',
          consumptionLabel: l.consumption != null ? String(l.consumption) : undefined,
        })),
        sampleStatus: items[hitIndex]?.status ?? null,
        sampleQueuePosition: hitIndex >= 0 ? hitIndex + 1 : null,
        sampleQueueTotal: items.length > 0 ? items.length : null,
      },
    };
  }

  if (input.pillarId === 'order_production') {
    if (input.roleId === 'supplier') {
      return {
        pillarId: 'order_production',
        supplierProcurement: buildSupplierProcurementOffline(cid, factoryId, articleId, orderId),
      };
    }
    return {
      pillarId: 'order_production',
      orderProduction: {
        orderId,
        chainSteps: demoChainSteps(),
        productionOrderId: orderId ? `PO-DEMO-${orderId.slice(-6)}` : null,
        handoffItems: orderId ? demoHandoffItems(orderId, cid, articleId) : [],
        bomLineCount: DEMO_BOM_LINES.length,
        bomPreviewLines: DEMO_BOM_LINES.map((l) => ({ materialName: l.materialName })),
        trackingPreview: null,
      },
    };
  }

  if (input.pillarId === 'comms') {
    return {
      pillarId: 'comms',
      comms: buildCommsOffline(orderId),
    };
  }

  if (input.pillarId === 'sample_collection') {
    return {
      pillarId: 'sample_collection',
      sampleCollection: {
        status: {
          collectionId: cid,
          publishedCount: 0,
          readyForBuyers: false,
          steps: demoChainSteps(),
          showroomHref: `/brand/showroom?collection=${encodeURIComponent(cid)}`,
          linesheetHref: `/brand/linesheets?collection=${encodeURIComponent(cid)}`,
          workshop2Href: `/brand/production/workshop2?w2col=${encodeURIComponent(cid)}`,
          shopShowroomHref: `/shop/showroom?collection=${encodeURIComponent(cid)}`,
          shopMatrixHref: `/shop/b2b/matrix?collection=${encodeURIComponent(cid)}`,
        },
      },
    };
  }

  if (input.pillarId === 'collection_order' && orderId) {
    return {
      pillarId: 'collection_order',
      collectionOrder: {
        orderId,
        chainSteps: demoChainSteps(),
        orderQty: 120,
        orderTotalRub: 480_000,
        exportReady: false,
        trackingNumber: null,
      },
    };
  }

  return { pillarId: input.pillarId, unsupported: true };
}
