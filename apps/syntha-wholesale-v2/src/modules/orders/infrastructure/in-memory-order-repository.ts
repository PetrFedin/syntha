import {
  InMemoryLifecycleIdempotencyRegistry,
  type LifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';
import type { SelectionId } from '@/modules/selection';

import type {
  OrderAuditRecord,
  OrderOutboxEvent,
  OrderRepository,
} from '../application/order-repository';
import type {
  CommercialOrder,
  OrderId,
  OrderLine,
  SubmittedOrderSnapshot,
  SubmittedOrderSnapshotId,
} from '../domain/order';

function copyLine(line: OrderLine): OrderLine {
  return Object.freeze({
    ...line,
    sizeQuantities: Object.freeze(
      line.sizeQuantities.map((entry) => Object.freeze({ ...entry })),
    ),
    totals: Object.freeze({ ...line.totals }),
  });
}

function copyOrder(order: CommercialOrder): CommercialOrder {
  return Object.freeze({
    ...order,
    lines: Object.freeze(order.lines.map(copyLine)),
    totals: Object.freeze({ ...order.totals }),
  });
}

function copySnapshot(snapshot: SubmittedOrderSnapshot): SubmittedOrderSnapshot {
  return Object.freeze({
    ...snapshot,
    lines: Object.freeze(snapshot.lines.map(copyLine)),
    totals: Object.freeze({ ...snapshot.totals }),
  });
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, CommercialOrder>();
  private readonly snapshots = new Map<string, SubmittedOrderSnapshot>();
  private readonly idempotency = new InMemoryLifecycleIdempotencyRegistry();
  readonly audits: OrderAuditRecord[] = [];
  readonly outbox: OrderOutboxEvent[] = [];

  private orderKey(buyerOrganisationId: OrganisationId, id: string): string {
    return `${buyerOrganisationId}:${id}`;
  }

  private snapshotKey(buyerOrganisationId: OrganisationId, id: string): string {
    return `${buyerOrganisationId}:${id}`;
  }

  private loadOrder(command: LifecycleCreateCommand, id: string): CommercialOrder | null {
    return this.orders.get(this.orderKey(command.organisationId, id)) ?? null;
  }

  private loadSnapshot(
    command: LifecycleCreateCommand,
    id: string,
  ): SubmittedOrderSnapshot | null {
    return this.snapshots.get(this.snapshotKey(command.organisationId, id)) ?? null;
  }

  async findOrder(
    buyerOrganisationId: OrganisationId,
    id: OrderId,
  ): Promise<CommercialOrder | null> {
    const order = this.orders.get(this.orderKey(buyerOrganisationId, id));
    return order ? copyOrder(order) : null;
  }

  async findOrderBySelection(
    buyerOrganisationId: OrganisationId,
    selectionId: SelectionId,
  ): Promise<CommercialOrder | null> {
    const order = [...this.orders.values()].find(
      (candidate) =>
        candidate.buyerOrganisationId === buyerOrganisationId &&
        candidate.selectionId === selectionId,
    );
    return order ? copyOrder(order) : null;
  }

  async listBuyerOrders(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly CommercialOrder[]> {
    return [...this.orders.values()]
      .filter((order) => order.buyerOrganisationId === buyerOrganisationId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(copyOrder);
  }

  async findCreateReplay(command: LifecycleCreateCommand): Promise<CommercialOrder | null> {
    return this.idempotency.findReplay({
      command,
      expectedEntityType: 'ORDER',
      loadEntity: (id) => this.loadOrder(command, id),
    });
  }

  async createOrder(
    order: CommercialOrder,
    audit: OrderAuditRecord,
    event: OrderOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<CommercialOrder>> {
    const replay = await this.findCreateReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    const stored = copyOrder(order);
    this.orders.set(this.orderKey(order.buyerOrganisationId, order.id), stored);
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }));
    await this.idempotency.complete({
      command,
      resultEntityType: 'ORDER',
      resultEntityId: order.id,
      entity: stored,
      loadEntity: (id) => this.loadOrder(command, id),
    });
    return Object.freeze({ entity: copyOrder(stored), replayed: false });
  }

  async updateOrder(
    order: CommercialOrder,
    expectedVersion: number,
    audit: OrderAuditRecord,
    event: OrderOutboxEvent,
  ): Promise<boolean> {
    const key = this.orderKey(order.buyerOrganisationId, order.id);
    const current = this.orders.get(key);
    if (!current || current.version !== expectedVersion) return false;
    this.orders.set(key, copyOrder(order));
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }));
    return true;
  }

  async findSubmitReplay(
    command: LifecycleCreateCommand,
  ): Promise<SubmittedOrderSnapshot | null> {
    return this.idempotency.findReplay({
      command,
      expectedEntityType: 'SUBMITTED_ORDER_SNAPSHOT',
      loadEntity: (id) => this.loadSnapshot(command, id),
    });
  }

  async submitOrder(
    order: CommercialOrder,
    snapshot: SubmittedOrderSnapshot,
    expectedVersion: number,
    audit: OrderAuditRecord,
    event: OrderOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<SubmittedOrderSnapshot>> {
    const replay = await this.findSubmitReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    const key = this.orderKey(order.buyerOrganisationId, order.id);
    const current = this.orders.get(key);
    if (!current || current.version !== expectedVersion) return Promise.reject(new Error('ORDER_VERSION_CONFLICT'));
    const storedOrder = copyOrder(order);
    const storedSnapshot = copySnapshot(snapshot);
    this.orders.set(key, storedOrder);
    this.snapshots.set(
      this.snapshotKey(snapshot.buyerOrganisationId, snapshot.id),
      storedSnapshot,
    );
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }));
    await this.idempotency.complete({
      command,
      resultEntityType: 'SUBMITTED_ORDER_SNAPSHOT',
      resultEntityId: snapshot.id,
      entity: storedSnapshot,
      loadEntity: (id) => this.loadSnapshot(command, id),
    });
    return Object.freeze({ entity: copySnapshot(storedSnapshot), replayed: false });
  }

  async findSubmittedSnapshotForBuyer(
    buyerOrganisationId: OrganisationId,
    id: SubmittedOrderSnapshotId,
  ): Promise<SubmittedOrderSnapshot | null> {
    const snapshot = this.snapshots.get(this.snapshotKey(buyerOrganisationId, id));
    return snapshot ? copySnapshot(snapshot) : null;
  }

  async findSubmittedSnapshotForSeller(
    sellerOrganisationId: OrganisationId,
    id: SubmittedOrderSnapshotId,
  ): Promise<SubmittedOrderSnapshot | null> {
    const snapshot = [...this.snapshots.values()].find(
      (candidate) => candidate.id === id && candidate.sellerOrganisationId === sellerOrganisationId,
    );
    return snapshot ? copySnapshot(snapshot) : null;
  }

  async listSubmittedSnapshotsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly SubmittedOrderSnapshot[]> {
    return [...this.snapshots.values()]
      .filter((snapshot) => snapshot.buyerOrganisationId === buyerOrganisationId)
      .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))
      .map(copySnapshot);
  }

  async listSubmittedSnapshotsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly SubmittedOrderSnapshot[]> {
    return [...this.snapshots.values()]
      .filter((snapshot) => snapshot.sellerOrganisationId === sellerOrganisationId)
      .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))
      .map(copySnapshot);
  }
}
