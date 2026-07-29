import {
  lifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';
import {
  getSelection,
  selectionId,
  type SelectionRepository,
  type ShowroomAccessGrant,
} from '@/modules/selection';

import {
  createOrderDraft,
  orderId,
  orderLineId,
  setOrderLineCommercialTerms,
  setOrderLineQuantity,
  submitOrder,
  submittedOrderSnapshotId,
  type CommercialOrder,
  type OrderLineId,
  type SubmittedOrderSnapshot,
} from '../domain/order';
import type {
  OrderAuditAction,
  OrderAuditRecord,
  OrderEventName,
  OrderOutboxEvent,
  OrderRepository,
} from './order-repository';

export interface OrderClock {
  now(): Date;
}

export interface OrderIdGenerator {
  next(prefix: string): string;
}

export class OrderNotFound extends Error {
  constructor(id: string) {
    super(`Order ${id} was not found`);
    this.name = 'OrderNotFound';
  }
}

export class OrderAlreadyExists extends Error {
  constructor(selectionIdValue: string) {
    super(`Order already exists for Selection ${selectionIdValue}`);
    this.name = 'OrderAlreadyExists';
  }
}

export class OrderVersionConflict extends Error {
  constructor(id: string) {
    super(`Order ${id} was modified by another operation`);
    this.name = 'OrderVersionConflict';
  }
}

export class OrderSelectionNotReady extends Error {
  constructor(id: string) {
    super(`Selection ${id} must be READY before an Order Draft can be created`);
    this.name = 'OrderSelectionNotReady';
  }
}

export class OrderSelectionAccessRevoked extends Error {
  constructor(grantId: string) {
    super(`Showroom access grant ${grantId} is revoked`);
    this.name = 'OrderSelectionAccessRevoked';
  }
}

export class SubmittedOrderSnapshotNotFound extends Error {
  constructor(id: string) {
    super(`Submitted Order snapshot ${id} was not found`);
    this.name = 'SubmittedOrderSnapshotNotFound';
  }
}

function audit(input: {
  readonly ids: OrderIdGenerator;
  readonly order: CommercialOrder;
  readonly action: OrderAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly resultingVersion: number;
  readonly occurredAt: Date;
}): OrderAuditRecord {
  return Object.freeze({
    id: input.ids.next('order-audit'),
    buyerOrganisationId: input.order.buyerOrganisationId,
    sellerOrganisationId: input.order.sellerOrganisationId,
    selectionId: input.order.selectionId,
    showroomAccessGrantId: input.order.showroomAccessGrantId,
    showroomSnapshotId: input.order.showroomSnapshotId,
    orderId: input.order.id,
    action: input.action,
    actorCredentialId: input.actorCredentialId.trim(),
    expectedVersion: input.expectedVersion,
    resultingVersion: input.resultingVersion,
    occurredAt: input.occurredAt.toISOString(),
  });
}

function event(input: {
  readonly ids: OrderIdGenerator;
  readonly order: CommercialOrder;
  readonly eventName: OrderEventName;
  readonly payload?: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: Date;
}): OrderOutboxEvent {
  return Object.freeze({
    id: input.ids.next('order-event'),
    buyerOrganisationId: input.order.buyerOrganisationId,
    sellerOrganisationId: input.order.sellerOrganisationId,
    aggregateId: input.order.id,
    aggregateVersion: input.order.version,
    eventName: input.eventName,
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    occurredAt: input.occurredAt.toISOString(),
  });
}

async function requireActiveGrant(input: {
  readonly selectionRepository: SelectionRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly grantId: string;
}): Promise<ShowroomAccessGrant> {
  const grant = await input.selectionRepository.findGrantForBuyer(
    input.buyerOrganisationId,
    input.grantId as ShowroomAccessGrant['id'],
  );
  if (!grant || grant.status !== 'ACTIVE') {
    throw new OrderSelectionAccessRevoked(input.grantId);
  }
  return grant;
}

export async function createOrderDraftUseCase(input: {
  readonly repository: OrderRepository;
  readonly selectionRepository: SelectionRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly selectionId: string;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<CommercialOrder>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.buyerOrganisationId,
    commandName: 'CREATE_ORDER_DRAFT',
    idempotencyKey: input.idempotencyKey,
    payload: { selectionId: input.selectionId.trim() },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });
  const replay = await input.repository.findCreateReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  const selection = await getSelection({
    repository: input.selectionRepository,
    buyerOrganisationId: input.buyerOrganisationId,
    selectionId: input.selectionId,
  });
  if (selection.status !== 'READY') {
    throw new OrderSelectionNotReady(selection.id);
  }
  await requireActiveGrant({
    selectionRepository: input.selectionRepository,
    buyerOrganisationId: input.buyerOrganisationId,
    grantId: selection.showroomAccessGrantId,
  });
  const existing = await input.repository.findOrderBySelection(
    input.buyerOrganisationId,
    selection.id,
  );
  if (existing) throw new OrderAlreadyExists(selection.id);

  const order = createOrderDraft({
    id: input.ids.next('order'),
    selection,
    lineIds: selection.items.map(() => input.ids.next('order-line')),
    ownerCredentialId: input.actorCredentialId,
    now,
  });
  return input.repository.createOrder(
    order,
    audit({
      ids: input.ids,
      order,
      action: 'DRAFT_CREATED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: null,
      resultingVersion: order.version,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      order,
      eventName: 'ORDER_DRAFT_CREATED',
      payload: {
        selectionId: order.selectionId,
        showroomSnapshotId: order.showroomSnapshotId,
      },
      occurredAt: now,
    }),
    command,
  );
}

export async function getBuyerOrder(input: {
  readonly repository: OrderRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly orderId: string;
}): Promise<CommercialOrder> {
  const order = await input.repository.findOrder(
    input.buyerOrganisationId,
    orderId(input.orderId),
  );
  if (!order) throw new OrderNotFound(input.orderId);
  return order;
}

export async function listBuyerOrders(input: {
  readonly repository: OrderRepository;
  readonly buyerOrganisationId: OrganisationId;
}): Promise<readonly CommercialOrder[]> {
  return input.repository.listBuyerOrders(input.buyerOrganisationId);
}

async function loadMutableOrder(input: {
  readonly repository: OrderRepository;
  readonly selectionRepository: SelectionRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly orderId: string;
  readonly expectedVersion: number;
}): Promise<CommercialOrder> {
  const order = await getBuyerOrder(input);
  if (order.version !== input.expectedVersion) {
    throw new OrderVersionConflict(input.orderId);
  }
  await requireActiveGrant({
    selectionRepository: input.selectionRepository,
    buyerOrganisationId: input.buyerOrganisationId,
    grantId: order.showroomAccessGrantId,
  });
  return order;
}

async function persistOrderChange(input: {
  readonly repository: OrderRepository;
  readonly ids: OrderIdGenerator;
  readonly current: CommercialOrder;
  readonly changed: CommercialOrder;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly action: OrderAuditAction;
  readonly eventName: OrderEventName;
  readonly payload?: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: Date;
}): Promise<CommercialOrder> {
  const updated = await input.repository.updateOrder(
    input.changed,
    input.expectedVersion,
    audit({
      ids: input.ids,
      order: input.changed,
      action: input.action,
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      resultingVersion: input.changed.version,
      occurredAt: input.occurredAt,
    }),
    event({
      ids: input.ids,
      order: input.changed,
      eventName: input.eventName,
      payload: input.payload,
      occurredAt: input.occurredAt,
    }),
  );
  if (!updated) throw new OrderVersionConflict(input.current.id);
  return input.changed;
}

export async function setOrderLineQuantityUseCase(input: {
  readonly repository: OrderRepository;
  readonly selectionRepository: SelectionRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly orderId: string;
  readonly expectedVersion: number;
  readonly lineId: string;
  readonly size: string;
  readonly quantity: number;
  readonly actorCredentialId: string;
}): Promise<CommercialOrder> {
  const current = await loadMutableOrder(input);
  const now = input.clock.now();
  const changed = setOrderLineQuantity(current, {
    lineId: orderLineId(input.lineId),
    size: input.size,
    quantity: input.quantity,
    now,
  });
  return persistOrderChange({
    repository: input.repository,
    ids: input.ids,
    current,
    changed,
    expectedVersion: input.expectedVersion,
    actorCredentialId: input.actorCredentialId,
    action: 'LINE_QUANTITY_CHANGED',
    eventName: 'ORDER_LINE_QUANTITY_CHANGED',
    payload: {
      lineId: input.lineId,
      size: input.size.trim().toUpperCase(),
      quantity: input.quantity,
    },
    occurredAt: now,
  });
}

export async function setOrderLineCommercialTermsUseCase(input: {
  readonly repository: OrderRepository;
  readonly selectionRepository: SelectionRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly orderId: string;
  readonly expectedVersion: number;
  readonly lineId: string;
  readonly unitPriceMinor: number;
  readonly discountBasisPoints: number;
  readonly taxBasisPoints: number;
  readonly actorCredentialId: string;
}): Promise<CommercialOrder> {
  const current = await loadMutableOrder(input);
  const now = input.clock.now();
  const changed = setOrderLineCommercialTerms(current, {
    lineId: orderLineId(input.lineId),
    unitPriceMinor: input.unitPriceMinor,
    discountBasisPoints: input.discountBasisPoints,
    taxBasisPoints: input.taxBasisPoints,
    now,
  });
  return persistOrderChange({
    repository: input.repository,
    ids: input.ids,
    current,
    changed,
    expectedVersion: input.expectedVersion,
    actorCredentialId: input.actorCredentialId,
    action: 'LINE_TERMS_CHANGED',
    eventName: 'ORDER_LINE_TERMS_CHANGED',
    payload: {
      lineId: input.lineId,
      unitPriceMinor: input.unitPriceMinor,
      discountBasisPoints: input.discountBasisPoints,
      taxBasisPoints: input.taxBasisPoints,
    },
    occurredAt: now,
  });
}

export async function submitOrderUseCase(input: {
  readonly repository: OrderRepository;
  readonly selectionRepository: SelectionRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly orderId: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<SubmittedOrderSnapshot>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.buyerOrganisationId,
    commandName: 'SUBMIT_ORDER',
    idempotencyKey: input.idempotencyKey,
    payload: {
      orderId: input.orderId.trim(),
      expectedVersion: input.expectedVersion,
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });
  const replay = await input.repository.findSubmitReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  const current = await loadMutableOrder(input);
  const submitted = submitOrder(current, {
    snapshotId: input.ids.next('submitted-order-snapshot'),
    actorCredentialId: input.actorCredentialId,
    now,
  });
  return input.repository.submitOrder(
    submitted.order,
    submitted.snapshot,
    input.expectedVersion,
    audit({
      ids: input.ids,
      order: submitted.order,
      action: 'ORDER_SUBMITTED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      resultingVersion: submitted.order.version,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      order: submitted.order,
      eventName: 'ORDER_SUBMITTED',
      payload: {
        submittedOrderSnapshotId: submitted.snapshot.id,
        totalMinor: submitted.snapshot.totals.totalMinor,
        currency: submitted.snapshot.currency,
      },
      occurredAt: now,
    }),
    command,
  );
}

export async function getSubmittedOrderForBuyer(input: {
  readonly repository: OrderRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly snapshotId: string;
}): Promise<SubmittedOrderSnapshot> {
  const snapshot = await input.repository.findSubmittedSnapshotForBuyer(
    input.buyerOrganisationId,
    submittedOrderSnapshotId(input.snapshotId),
  );
  if (!snapshot) throw new SubmittedOrderSnapshotNotFound(input.snapshotId);
  return snapshot;
}

export async function getSubmittedOrderForSeller(input: {
  readonly repository: OrderRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly snapshotId: string;
}): Promise<SubmittedOrderSnapshot> {
  const snapshot = await input.repository.findSubmittedSnapshotForSeller(
    input.sellerOrganisationId,
    submittedOrderSnapshotId(input.snapshotId),
  );
  if (!snapshot) throw new SubmittedOrderSnapshotNotFound(input.snapshotId);
  return snapshot;
}

export async function listSubmittedOrdersForBuyer(input: {
  readonly repository: OrderRepository;
  readonly buyerOrganisationId: OrganisationId;
}): Promise<readonly SubmittedOrderSnapshot[]> {
  return input.repository.listSubmittedSnapshotsForBuyer(input.buyerOrganisationId);
}

export async function listSubmittedOrdersForSeller(input: {
  readonly repository: OrderRepository;
  readonly sellerOrganisationId: OrganisationId;
}): Promise<readonly SubmittedOrderSnapshot[]> {
  return input.repository.listSubmittedSnapshotsForSeller(input.sellerOrganisationId);
}
