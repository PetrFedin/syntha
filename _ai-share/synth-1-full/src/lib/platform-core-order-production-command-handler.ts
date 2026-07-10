import {
  closePlatformCoreOrderProduction,
  dispatchPlatformCoreShipment,
  issuePlatformCorePacking,
  recordPlatformCoreShopAcceptance,
  updatePlatformCoreQcStatus,
  type PlatformCoreOrderProductionTail,
} from '@/lib/platform-core-order-production-tail';
import {
  assertPlatformCoreOrderProductionCommandRole,
  getPlatformCoreOrderProductionEventType,
  type PlatformCoreOrderProductionEvent,
  type PlatformCoreOrderProductionEventPort,
  type PlatformCoreOrderProductionMutationResult,
  type PlatformCoreOrderProductionPort,
  type PlatformCoreOrderProductionSnapshot,
  type PlatformCoreOrderProductionWriteCommand,
} from '@/lib/platform-core-order-production-port';

export type PlatformCoreOrderProductionTransactionPort = {
  run<T>(work: () => Promise<T>): Promise<T>;
};

export type PlatformCoreOrderProductionPersistencePort = {
  getByOrderId(orderId: string): Promise<PlatformCoreOrderProductionSnapshot | null>;
  save(snapshot: PlatformCoreOrderProductionSnapshot, expectedVersion?: number): Promise<void>;
  getByIdempotencyKey(
    idempotencyKey: string
  ): Promise<PlatformCoreOrderProductionMutationResult | null>;
  saveIdempotencyResult(
    idempotencyKey: string,
    result: PlatformCoreOrderProductionMutationResult
  ): Promise<void>;
};

export type PlatformCoreOrderProductionCommandHandlerDeps = {
  persistence: PlatformCoreOrderProductionPersistencePort;
  events: PlatformCoreOrderProductionEventPort;
  transaction: PlatformCoreOrderProductionTransactionPort;
  createEventId: () => string;
};

function applyOrderProductionCommand(
  current: PlatformCoreOrderProductionTail,
  command: PlatformCoreOrderProductionWriteCommand
): PlatformCoreOrderProductionTail {
  switch (command.type) {
    case 'set_qc_status':
      return updatePlatformCoreQcStatus(current, command.qcStatus);
    case 'set_packing_status':
      if (command.packingStatus === 'issued') return issuePlatformCorePacking(current);
      return { ...current, packingStatus: command.packingStatus };
    case 'set_shipment_status':
      if (command.shipmentStatus === 'dispatched') return dispatchPlatformCoreShipment(current);
      return { ...current, shipmentStatus: command.shipmentStatus };
    case 'record_shop_acceptance':
      return recordPlatformCoreShopAcceptance({
        tail: current,
        acceptanceStatus: command.acceptanceStatus,
      });
    case 'close_order_production':
      return closePlatformCoreOrderProduction(current);
  }
}

function createEvent(args: {
  command: PlatformCoreOrderProductionWriteCommand;
  previous: PlatformCoreOrderProductionTail;
  next: PlatformCoreOrderProductionTail;
  version: number;
  eventId: string;
}): PlatformCoreOrderProductionEvent {
  const opensClaim = !args.previous.hasOpenClaim && args.next.hasOpenClaim;
  return {
    eventId: args.eventId,
    orderId: args.command.orderId,
    type: getPlatformCoreOrderProductionEventType(args.command, opensClaim),
    actor: args.command.meta.actor,
    occurredAt: args.command.meta.occurredAt,
    version: args.version,
    payload: {
      commandType: args.command.type,
      qcStatus: args.next.qcStatus,
      packingStatus: args.next.packingStatus,
      shipmentStatus: args.next.shipmentStatus,
      acceptanceStatus: args.next.acceptanceStatus,
      closeoutStatus: args.next.closeoutStatus,
      hasOpenClaim: args.next.hasOpenClaim,
    },
  };
}

export function createPlatformCoreOrderProductionCommandHandler(
  deps: PlatformCoreOrderProductionCommandHandlerDeps
): PlatformCoreOrderProductionPort {
  return {
    getByOrderId(orderId) {
      return deps.persistence.getByOrderId(orderId);
    },

    execute(command) {
      assertPlatformCoreOrderProductionCommandRole(command);

      return deps.transaction.run(async () => {
        const replay = await deps.persistence.getByIdempotencyKey(command.meta.idempotencyKey);
        if (replay) return replay;

        const current = await deps.persistence.getByOrderId(command.orderId);
        if (!current) {
          throw new Error(`Order Production tail not found for order ${command.orderId}`);
        }

        if (
          command.meta.expectedVersion !== undefined &&
          command.meta.expectedVersion !== current.version
        ) {
          throw new Error(
            `Version conflict: expected ${command.meta.expectedVersion}, current ${current.version}`
          );
        }

        const nextTail = applyOrderProductionCommand(current.tail, command);
        const nextSnapshot: PlatformCoreOrderProductionSnapshot = {
          tail: nextTail,
          version: current.version + 1,
          updatedAt: command.meta.occurredAt,
        };
        const eventId = deps.createEventId();
        const result: PlatformCoreOrderProductionMutationResult = {
          snapshot: nextSnapshot,
          eventId,
        };

        await deps.persistence.save(nextSnapshot, current.version);
        await deps.events.append(
          createEvent({
            command,
            previous: current.tail,
            next: nextTail,
            version: nextSnapshot.version,
            eventId,
          })
        );
        await deps.persistence.saveIdempotencyResult(command.meta.idempotencyKey, result);

        return result;
      });
    },
  };
}
