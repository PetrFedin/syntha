import type { PlatformCoreDocument } from '@/lib/platform-core-document-engine';
import { canPlatformCoreAdvanceDocumentStage } from '@/lib/platform-core-document-engine';

export type PlatformCoreQcStatus =
  | 'not_started'
  | 'in_progress'
  | 'passed'
  | 'failed'
  | 'waived';

export type PlatformCorePackingStatus =
  | 'not_started'
  | 'in_progress'
  | 'ready'
  | 'issued';

export type PlatformCoreShipmentStatus =
  | 'not_ready'
  | 'ready_to_dispatch'
  | 'dispatched'
  | 'partially_delivered'
  | 'delivered';

export type PlatformCoreAcceptanceStatus =
  | 'pending'
  | 'accepted'
  | 'accepted_with_discrepancy'
  | 'rejected';

export type PlatformCoreCloseoutStatus =
  | 'open'
  | 'blocked'
  | 'ready_to_close'
  | 'closed';

export type PlatformCoreOrderProductionTail = {
  orderId: string;
  qcStatus: PlatformCoreQcStatus;
  packingStatus: PlatformCorePackingStatus;
  shipmentStatus: PlatformCoreShipmentStatus;
  acceptanceStatus: PlatformCoreAcceptanceStatus;
  closeoutStatus: PlatformCoreCloseoutStatus;
  hasOpenClaim: boolean;
  documents: readonly PlatformCoreDocument[];
};

export type PlatformCoreOrderProductionTailBlockerCode =
  | 'qc_not_passed'
  | 'packing_documents_missing'
  | 'shipment_not_delivered'
  | 'acceptance_pending'
  | 'acceptance_rejected'
  | 'open_claim';

export type PlatformCoreOrderProductionTailBlocker = {
  code: PlatformCoreOrderProductionTailBlockerCode;
  message: string;
};

export function createPlatformCoreOrderProductionTail(args: {
  orderId: string;
  documents?: readonly PlatformCoreDocument[];
}): PlatformCoreOrderProductionTail {
  if (!args.orderId.trim()) throw new Error('orderId is required');

  return {
    orderId: args.orderId,
    qcStatus: 'not_started',
    packingStatus: 'not_started',
    shipmentStatus: 'not_ready',
    acceptanceStatus: 'pending',
    closeoutStatus: 'open',
    hasOpenClaim: false,
    documents: args.documents ?? [],
  };
}

export function canPlatformCoreIssuePacking(
  tail: PlatformCoreOrderProductionTail
): boolean {
  const qcPassed = tail.qcStatus === 'passed' || tail.qcStatus === 'waived';
  const documentsReady = canPlatformCoreAdvanceDocumentStage({
    stage: 'shipment_ready',
    ownerId: tail.orderId,
    documents: tail.documents,
  });

  return qcPassed && documentsReady;
}

export function getPlatformCoreOrderProductionTailBlockers(
  tail: PlatformCoreOrderProductionTail
): PlatformCoreOrderProductionTailBlocker[] {
  const blockers: PlatformCoreOrderProductionTailBlocker[] = [];

  if (!(tail.qcStatus === 'passed' || tail.qcStatus === 'waived')) {
    blockers.push({ code: 'qc_not_passed', message: 'QC must pass before shipment preparation.' });
  }

  if (!canPlatformCoreAdvanceDocumentStage({
    stage: 'shipment_ready',
    ownerId: tail.orderId,
    documents: tail.documents,
  })) {
    blockers.push({
      code: 'packing_documents_missing',
      message: 'QC report, packing list and invoice are required before dispatch.',
    });
  }

  if (tail.shipmentStatus !== 'delivered') {
    blockers.push({
      code: 'shipment_not_delivered',
      message: 'Shipment must be delivered before order closeout.',
    });
  }

  if (tail.acceptanceStatus === 'pending') {
    blockers.push({ code: 'acceptance_pending', message: 'Shop acceptance is still pending.' });
  }

  if (tail.acceptanceStatus === 'rejected') {
    blockers.push({ code: 'acceptance_rejected', message: 'Rejected delivery must be resolved.' });
  }

  if (tail.hasOpenClaim) {
    blockers.push({ code: 'open_claim', message: 'Open claim blocks order closeout.' });
  }

  return blockers;
}

export function updatePlatformCoreQcStatus(
  tail: PlatformCoreOrderProductionTail,
  qcStatus: PlatformCoreQcStatus
): PlatformCoreOrderProductionTail {
  const next = { ...tail, qcStatus };
  return {
    ...next,
    packingStatus:
      qcStatus === 'passed' || qcStatus === 'waived'
        ? next.packingStatus
        : 'not_started',
    shipmentStatus:
      qcStatus === 'passed' || qcStatus === 'waived'
        ? next.shipmentStatus
        : 'not_ready',
  };
}

export function issuePlatformCorePacking(
  tail: PlatformCoreOrderProductionTail
): PlatformCoreOrderProductionTail {
  if (!canPlatformCoreIssuePacking(tail)) {
    throw new Error('Packing cannot be issued until QC and shipment documents are ready');
  }

  return {
    ...tail,
    packingStatus: 'issued',
    shipmentStatus: 'ready_to_dispatch',
  };
}

export function dispatchPlatformCoreShipment(
  tail: PlatformCoreOrderProductionTail
): PlatformCoreOrderProductionTail {
  if (tail.packingStatus !== 'issued' || tail.shipmentStatus !== 'ready_to_dispatch') {
    throw new Error('Shipment cannot be dispatched before packing is issued');
  }

  return { ...tail, shipmentStatus: 'dispatched' };
}

export function recordPlatformCoreShopAcceptance(args: {
  tail: PlatformCoreOrderProductionTail;
  acceptanceStatus: Exclude<PlatformCoreAcceptanceStatus, 'pending'>;
  hasOpenClaim?: boolean;
}): PlatformCoreOrderProductionTail {
  if (!['dispatched', 'partially_delivered', 'delivered'].includes(args.tail.shipmentStatus)) {
    throw new Error('Shop acceptance is available only after shipment dispatch');
  }

  const shipmentStatus: PlatformCoreShipmentStatus =
    args.acceptanceStatus === 'accepted' || args.acceptanceStatus === 'accepted_with_discrepancy'
      ? 'delivered'
      : args.tail.shipmentStatus;

  return {
    ...args.tail,
    shipmentStatus,
    acceptanceStatus: args.acceptanceStatus,
    hasOpenClaim:
      args.hasOpenClaim ?? args.acceptanceStatus === 'accepted_with_discrepancy',
  };
}

export function evaluatePlatformCoreCloseoutStatus(
  tail: PlatformCoreOrderProductionTail
): PlatformCoreCloseoutStatus {
  const blockers = getPlatformCoreOrderProductionTailBlockers(tail);
  if (tail.closeoutStatus === 'closed') return 'closed';
  return blockers.length === 0 ? 'ready_to_close' : 'blocked';
}

export function closePlatformCoreOrderProduction(
  tail: PlatformCoreOrderProductionTail
): PlatformCoreOrderProductionTail {
  const status = evaluatePlatformCoreCloseoutStatus(tail);
  if (status !== 'ready_to_close') {
    throw new Error(
      getPlatformCoreOrderProductionTailBlockers(tail)
        .map((blocker) => blocker.message)
        .join('; ')
    );
  }

  return { ...tail, closeoutStatus: 'closed' };
}

export type PlatformCoreShopTrackingSnapshot = {
  orderId: string;
  status:
    | 'in_execution'
    | 'preparing_shipment'
    | 'shipped'
    | 'acceptance_required'
    | 'closed';
  acceptanceActionAvailable: boolean;
  closeoutBlocked: boolean;
};

export function getPlatformCoreShopTrackingSnapshot(
  tail: PlatformCoreOrderProductionTail
): PlatformCoreShopTrackingSnapshot {
  if (tail.closeoutStatus === 'closed') {
    return {
      orderId: tail.orderId,
      status: 'closed',
      acceptanceActionAvailable: false,
      closeoutBlocked: false,
    };
  }

  if (tail.shipmentStatus === 'delivered' && tail.acceptanceStatus === 'pending') {
    return {
      orderId: tail.orderId,
      status: 'acceptance_required',
      acceptanceActionAvailable: true,
      closeoutBlocked: true,
    };
  }

  if (['dispatched', 'partially_delivered', 'delivered'].includes(tail.shipmentStatus)) {
    return {
      orderId: tail.orderId,
      status: 'shipped',
      acceptanceActionAvailable: tail.acceptanceStatus === 'pending',
      closeoutBlocked: evaluatePlatformCoreCloseoutStatus(tail) !== 'ready_to_close',
    };
  }

  if (tail.shipmentStatus === 'ready_to_dispatch') {
    return {
      orderId: tail.orderId,
      status: 'preparing_shipment',
      acceptanceActionAvailable: false,
      closeoutBlocked: true,
    };
  }

  return {
    orderId: tail.orderId,
    status: 'in_execution',
    acceptanceActionAvailable: false,
    closeoutBlocked: true,
  };
}
