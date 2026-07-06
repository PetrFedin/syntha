import 'server-only';

import { getWorkshop2B2bOrder } from '@/lib/platform-core-ports/b2b-orders';
import {
  getWorkshop2ServerDossierRecord,
  getWorkshop2ServerDossierStoreMode,
} from '@/lib/platform-core-ports/dossier-store';
import { getPlatformCoreDocumentsForArticle } from '@/lib/platform-core-gateways/documents-gateway';
import { getPlatformCoreDppForArticle } from '@/lib/platform-core-gateways/dpp-gateway';
import { getPlatformCoreQcForArticle } from '@/lib/platform-core-gateways/qc-gateway';

export type PlatformCoreShipmentOrderStatus =
  | 'draft'
  | 'submitted'
  | 'confirmed'
  | 'allocated'
  | 'shipped'
  | 'cancelled'
  | string;

export type PlatformCoreShipmentGatewaySource =
  | 'workshop2_b2b_order'
  | 'workshop2_dossier_mirror';

export type PlatformCoreAdapterIssue = {
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
};

export type PlatformCoreShipmentLogisticsSnapshot = {
  shipmentCount?: number;
  linkedToSampleOrder?: boolean;
  currentStep?: string;
  status?: string;
  logisticsMode?: 'journal_only' | 'tms_live' | string;
  serverWorkflowEnabled?: boolean;
  blockerHandoff?: boolean;
  hintRu?: string;
  carrier?: string;
  trackingNumber?: string;
  shipDate?: string;
  eta?: string;
};

export type PlatformCoreShipmentSnapshot = {
  orderId: string;
  shipmentId: string;
  collectionId?: string;
  articleId?: string;
  buyerId?: string;
  orderStatus?: PlatformCoreShipmentOrderStatus;
  requestedDeliveryDate?: string;
  version?: number;
  updatedAt: string;
  source: PlatformCoreShipmentGatewaySource;
  qcPassed: boolean;
  qcShipmentBlocked: boolean;
  documentPacketReady: boolean;
  dppReady: boolean;
  presentDocumentKinds: string[];
  missingDocumentKinds: string[];
  logistics?: PlatformCoreShipmentLogisticsSnapshot;
  carrier?: string;
  trackingNumber?: string;
  eta?: string;
  canShip: boolean;
  shipmentBlocked: boolean;
};

export type PlatformCoreShipmentEvaluation = {
  status: 'core_ready' | 'warning' | 'blocked';
  eventCreated: string;
  nextOwnerLabel: string;
  issues: PlatformCoreAdapterIssue[];
  completenessPct: number;
};

export type PlatformCoreShipmentOrderResult =
  | {
      ok: true;
      orderId: string;
      collectionId?: string;
      articleId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
      version?: number;
      updatedAt: string;
      shipment: PlatformCoreShipmentSnapshot;
      evaluation: PlatformCoreShipmentEvaluation;
    }
  | {
      ok: false;
      reason: 'invalid_path' | 'not_found';
      orderId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
    };

type OrderShape = {
  id: string;
  collectionId?: string;
  articleId?: string;
  buyerId?: string;
  status?: PlatformCoreShipmentOrderStatus;
  requestedDeliveryDate?: string;
  lines: readonly {
    articleId?: string;
    collectionId?: string;
    deliveryDate?: string;
  }[];
  updatedAt: string;
};

type DossierShipmentShape = {
  logisticsShipmentMirror?: PlatformCoreShipmentLogisticsSnapshot;
};

function cleanString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t || undefined;
}

function adapterStatus(issues: PlatformCoreAdapterIssue[]): PlatformCoreShipmentEvaluation['status'] {
  if (issues.some((i) => i.severity === 'blocker')) return 'blocked';
  if (issues.some((i) => i.severity === 'warning')) return 'warning';
  return 'core_ready';
}

function firstLineArticle(order: OrderShape): { collectionId?: string; articleId?: string } {
  const line = order.lines.find((item) => item.articleId || item.collectionId);
  return {
    collectionId: cleanString(order.collectionId) ?? cleanString(line?.collectionId),
    articleId: cleanString(order.articleId) ?? cleanString(line?.articleId),
  };
}

function logisticsSnapshot(dossier?: DossierShipmentShape | null): PlatformCoreShipmentLogisticsSnapshot | undefined {
  const mirror = dossier?.logisticsShipmentMirror;
  if (!mirror) return undefined;
  return {
    shipmentCount: mirror.shipmentCount,
    linkedToSampleOrder: mirror.linkedToSampleOrder,
    currentStep: cleanString(mirror.currentStep),
    status: cleanString(mirror.status),
    logisticsMode: cleanString(mirror.logisticsMode),
    serverWorkflowEnabled: mirror.serverWorkflowEnabled,
    blockerHandoff: mirror.blockerHandoff,
    hintRu: cleanString(mirror.hintRu),
    carrier: cleanString(mirror.carrier),
    trackingNumber: cleanString(mirror.trackingNumber),
    shipDate: cleanString(mirror.shipDate),
    eta: cleanString(mirror.eta),
  };
}

function orderReadyForShipment(status?: PlatformCoreShipmentOrderStatus): boolean {
  return status === undefined || status === 'allocated' || status === 'shipped';
}

function evaluateShipment(input: {
  snapshot: PlatformCoreShipmentSnapshot;
  hasQc: boolean;
  hasDocuments: boolean;
  hasDpp: boolean;
  dppValidationBlocked?: string;
}): PlatformCoreShipmentEvaluation {
  const issues: PlatformCoreAdapterIssue[] = [];
  const { snapshot } = input;

  if (!input.hasQc) {
    issues.push({
      id: 'shipment.qc.missing',
      severity: 'blocker',
      message: 'Нет QC snapshot: shipment не должен принимать решение без QC.',
    });
  } else if (!snapshot.qcPassed) {
    issues.push({
      id: 'shipment.qc.blocked',
      severity: 'blocker',
      message: 'Нельзя отгружать без пройденного QC.',
    });
  }
  if (!input.hasDocuments) {
    issues.push({
      id: 'shipment.documents.missing',
      severity: 'blocker',
      message: 'Нет document packet snapshot.',
    });
  } else if (!snapshot.documentPacketReady) {
    issues.push({
      id: 'shipment.docs.blocked',
      severity: 'blocker',
      message: 'Нельзя отгружать без пакета документов.',
    });
  }
  if (!input.hasDpp) {
    issues.push({
      id: 'shipment.dpp.missing',
      severity: 'warning',
      message: 'Нет DPP snapshot: отгрузка возможна только с warning.',
    });
  } else if (!snapshot.dppReady) {
    issues.push({
      id: 'shipment.dpp.warning',
      severity: 'warning',
      message: 'DPP/passport не готов полностью.',
    });
  }
  if (input.dppValidationBlocked) {
    issues.push({
      id: 'shipment.dpp.validation_blocked',
      severity: 'warning',
      message: input.dppValidationBlocked,
    });
  }
  if (!orderReadyForShipment(snapshot.orderStatus)) {
    issues.push({
      id: 'shipment.order_status.blocked',
      severity: 'blocker',
      message: 'Заказ ещё не в статусе allocated/shipped.',
    });
  }
  if (snapshot.logistics?.blockerHandoff) {
    issues.push({
      id: 'shipment.logistics.blocked',
      severity: 'blocker',
      message: snapshot.logistics.hintRu ?? 'Логистика блокирует отгрузку.',
    });
  }
  if (!snapshot.carrier) {
    issues.push({
      id: 'shipment.carrier.missing',
      severity: 'warning',
      message: 'Перевозчик не указан.',
    });
  }
  if (!snapshot.trackingNumber) {
    issues.push({
      id: 'shipment.tracking.missing',
      severity: 'warning',
      message: 'Трек-номер не указан.',
    });
  }
  if (!snapshot.eta) {
    issues.push({
      id: 'shipment.eta.missing',
      severity: 'warning',
      message: 'ETA не указан.',
    });
  }

  const orderReady = orderReadyForShipment(snapshot.orderStatus);
  const logisticsReady = !snapshot.logistics?.blockerHandoff;
  snapshot.shipmentBlocked = !snapshot.canShip || !orderReady || !logisticsReady;

  const checks = [
    orderReady,
    snapshot.qcPassed,
    snapshot.documentPacketReady,
    snapshot.dppReady,
    logisticsReady,
    Boolean(snapshot.eta),
  ];
  const completenessPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    status: adapterStatus(issues),
    eventCreated: 'shipment.confirmed',
    nextOwnerLabel: 'Магазин',
    issues,
    completenessPct,
  };
}

export async function getPlatformCoreShipmentForOrder(input: {
  orderId: string;
  organizationId?: string;
}): Promise<PlatformCoreShipmentOrderResult> {
  const orderId = input.orderId?.trim();
  const storeMode = getWorkshop2ServerDossierStoreMode();

  if (!orderId) {
    return { ok: false, reason: 'invalid_path', orderId, storeMode };
  }

  const order = (await getWorkshop2B2bOrder(orderId)) as OrderShape | null;
  if (!order) {
    return { ok: false, reason: 'not_found', orderId, storeMode };
  }

  const entity = firstLineArticle(order);
  const hasEntity = Boolean(entity.collectionId && entity.articleId);

  const [record, qcResult, documentsResult, dppResult] = await Promise.all([
    hasEntity
      ? getWorkshop2ServerDossierRecord(entity.collectionId!, entity.articleId!)
      : Promise.resolve(null),
    hasEntity
      ? getPlatformCoreQcForArticle({
          collectionId: entity.collectionId!,
          articleId: entity.articleId!,
          organizationId: input.organizationId,
        })
      : Promise.resolve(null),
    hasEntity
      ? getPlatformCoreDocumentsForArticle({
          collectionId: entity.collectionId!,
          articleId: entity.articleId!,
          stage: 'shipment',
          orderId,
        })
      : Promise.resolve(null),
    hasEntity
      ? getPlatformCoreDppForArticle({
          collectionId: entity.collectionId!,
          articleId: entity.articleId!,
        })
      : Promise.resolve(null),
  ]);

  const dossier = record?.dossier as DossierShipmentShape | undefined;
  const logistics = logisticsSnapshot(dossier);
  const qcPassed = Boolean(qcResult?.ok && qcResult.evaluation.passed && !qcResult.evaluation.shipmentBlocked);
  const documentPacketReady = Boolean(documentsResult?.ok && documentsResult.evaluation.readyForExport);
  const dppReady = Boolean(dppResult?.ok && dppResult.evaluation.ready);
  const carrier = logistics?.carrier;
  const trackingNumber = logistics?.trackingNumber;
  const eta =
    logistics?.eta ??
    cleanString(order.requestedDeliveryDate) ??
    cleanString(order.lines.find((line) => line.deliveryDate)?.deliveryDate);

  const canShip = qcPassed && documentPacketReady && !logistics?.blockerHandoff;

  const shipment: PlatformCoreShipmentSnapshot = {
    orderId: order.id,
    shipmentId: `SHIP-${order.id}`,
    collectionId: entity.collectionId,
    articleId: entity.articleId,
    buyerId: cleanString(order.buyerId),
    orderStatus: order.status,
    requestedDeliveryDate: cleanString(order.requestedDeliveryDate),
    version: record?.version,
    updatedAt: record?.updatedAt ?? order.updatedAt,
    source: dossier ? 'workshop2_dossier_mirror' : 'workshop2_b2b_order',
    qcPassed,
    qcShipmentBlocked: Boolean(qcResult?.ok && qcResult.evaluation.shipmentBlocked),
    documentPacketReady,
    dppReady,
    presentDocumentKinds: documentsResult?.ok ? [...documentsResult.evaluation.presentKinds] : [],
    missingDocumentKinds: documentsResult?.ok ? [...documentsResult.evaluation.missingKinds] : [],
    logistics,
    carrier,
    trackingNumber,
    eta,
    canShip,
    shipmentBlocked: false,
  };

  const dppValidationBlocked = dppResult?.ok
    ? dppResult.evaluation.issues.find((i) => i.id === 'dpp.validation.blocked')?.message
    : undefined;

  return {
    ok: true,
    orderId,
    collectionId: entity.collectionId,
    articleId: entity.articleId,
    storeMode,
    version: record?.version,
    updatedAt: shipment.updatedAt,
    shipment,
    evaluation: evaluateShipment({
      snapshot: shipment,
      hasQc: Boolean(qcResult?.ok),
      hasDocuments: Boolean(documentsResult?.ok),
      hasDpp: Boolean(dppResult?.ok),
      dppValidationBlocked,
    }),
  };
}
