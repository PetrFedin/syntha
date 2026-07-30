export const ORDER_STATUSES = [
  'draft',
  'submitted',
  'confirmed',
  'allocated',
  'in_production',
  'ready',
  'shipped',
  'delivered',
  'closed',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderStatusTransition {
  readonly from: OrderStatus;
  readonly to: OrderStatus;
  readonly occurredAt: string;
  readonly actorId: string;
  readonly reason?: string;
}

const ORDER_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['draft', 'confirmed', 'cancelled'],
  confirmed: ['allocated', 'cancelled'],
  allocated: ['in_production', 'ready', 'cancelled'],
  in_production: ['ready', 'cancelled'],
  ready: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['closed'],
  closed: [],
  cancelled: [],
};

export function getAllowedOrderTransitions(status: OrderStatus): readonly OrderStatus[] {
  return ORDER_TRANSITIONS[status];
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Order cannot transition from "${from}" to "${to}".`);
  }
}

export function createOrderTransition(
  from: OrderStatus,
  to: OrderStatus,
  actorId: string,
  reason?: string,
  occurredAt = new Date().toISOString(),
): OrderStatusTransition {
  assertOrderTransition(from, to);

  const transition: OrderStatusTransition = {
    from,
    to,
    occurredAt,
    actorId,
    ...(reason ? { reason } : {}),
  };

  return transition;
}
