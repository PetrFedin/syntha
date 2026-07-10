import type {
  PlatformCoreAcceptanceStatus,
  PlatformCoreOrderProductionTail,
  PlatformCorePackingStatus,
  PlatformCoreQcStatus,
  PlatformCoreShipmentStatus,
} from '@/lib/platform-core-order-production-tail';

export type PlatformCoreOrderProductionMutationActor = {
  role: 'brand' | 'shop';
  actorId: string;
};

export type PlatformCoreOrderProductionMutationMeta = {
  actor: PlatformCoreOrderProductionMutationActor;
  occurredAt: string;
  idempotencyKey: string;
  expectedVersion?: number;
};

export type PlatformCoreOrderProductionSnapshot = {
  tail: PlatformCoreOrderProductionTail;
  version: number;
  updatedAt: string;
};

export type PlatformCoreOrderProductionMutationResult = {
  snapshot: PlatformCoreOrderProductionSnapshot;
  eventId: string;
};

export type PlatformCoreOrderProductionWriteCommand =
  | {
      type: 'set_qc_status';
      orderId: string;
      qcStatus: PlatformCoreQcStatus;
      meta: PlatformCoreOrderProductionMutationMeta;
    }
  | {
      type: 'set_packing_status';
      orderId: string;
      packingStatus: PlatformCorePackingStatus;
      meta: PlatformCoreOrderProductionMutationMeta;
    }
  | {
      type: 'set_shipment_status';
      orderId: string;
      shipmentStatus: PlatformCoreShipmentStatus;
      meta: PlatformCoreOrderProductionMutationMeta;
    }
  | {
      type: 'record_shop_acceptance';
      orderId: string;
      acceptanceStatus: Exclude<PlatformCoreAcceptanceStatus, 'pending'>;
      meta: PlatformCoreOrderProductionMutationMeta;
    }
  | {
      type: 'close_order_production';
      orderId: string;
      meta: PlatformCoreOrderProductionMutationMeta;
    };

/**
 * Canonical persistence boundary for the Order Production tail.
 *
 * UI and BFF code must depend on this port instead of writing directly to
 * demo state, local stores or PostgreSQL. The W2 PG adapter is responsible for
 * transactions, optimistic locking, idempotency and event persistence.
 */
export interface PlatformCoreOrderProductionPort {
  getByOrderId(orderId: string): Promise<PlatformCoreOrderProductionSnapshot | null>;
  execute(command: PlatformCoreOrderProductionWriteCommand): Promise<PlatformCoreOrderProductionMutationResult>;
}

export type PlatformCoreOrderProductionEventType =
  | 'order_production_created'
  | 'qc_status_changed'
  | 'packing_status_changed'
  | 'shipment_status_changed'
  | 'shop_acceptance_recorded'
  | 'claim_opened'
  | 'order_production_closed';

export type PlatformCoreOrderProductionEvent = {
  eventId: string;
  orderId: string;
  type: PlatformCoreOrderProductionEventType;
  actor: PlatformCoreOrderProductionMutationActor;
  occurredAt: string;
  version: number;
  payload: Readonly<Record<string, string | number | boolean | null>>;
};

export type PlatformCoreOrderProductionEventPort = {
  append(event: PlatformCoreOrderProductionEvent): Promise<void>;
  listByOrderId(orderId: string): Promise<readonly PlatformCoreOrderProductionEvent[]>;
};

export function assertPlatformCoreOrderProductionCommandRole(
  command: PlatformCoreOrderProductionWriteCommand
): void {
  const role = command.meta.actor.role;

  if (command.type === 'record_shop_acceptance' && role !== 'shop') {
    throw new Error('Only Shop can record delivery acceptance');
  }

  if (
    ['set_qc_status', 'set_packing_status', 'set_shipment_status', 'close_order_production'].includes(
      command.type
    ) &&
    role !== 'brand'
  ) {
    throw new Error(`Only Brand can execute ${command.type}`);
  }

  if (!command.meta.idempotencyKey.trim()) {
    throw new Error('idempotencyKey is required');
  }
}

export function getPlatformCoreOrderProductionEventType(
  command: PlatformCoreOrderProductionWriteCommand,
  opensClaim = false
): PlatformCoreOrderProductionEventType {
  if (opensClaim) return 'claim_opened';

  switch (command.type) {
    case 'set_qc_status':
      return 'qc_status_changed';
    case 'set_packing_status':
      return 'packing_status_changed';
    case 'set_shipment_status':
      return 'shipment_status_changed';
    case 'record_shop_acceptance':
      return 'shop_acceptance_recorded';
    case 'close_order_production':
      return 'order_production_closed';
  }
}
