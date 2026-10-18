import {
  createOrderTransition,
  type OrderStatus,
  type OrderStatusTransition,
} from './order-workflow';

export type CurrencyCode = 'RUB' | 'EUR' | 'USD' | 'GBP' | 'CNY';

export interface Money {
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
}

export interface OrderLine {
  readonly id: string;
  readonly skuId: string;
  readonly quantity: number;
  readonly unitPrice: Money;
}

export interface CommercialOrder {
  readonly id: string;
  readonly organizationId: string;
  readonly buyerId: string;
  readonly brandId: string;
  readonly campaignId?: string;
  readonly collectionId?: string;
  readonly status: OrderStatus;
  readonly lines: readonly OrderLine[];
  readonly transitions: readonly OrderStatusTransition[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function calculateOrderTotal(order: Pick<CommercialOrder, 'lines'>): Money | null {
  const firstLine = order.lines[0];

  if (!firstLine) {
    return null;
  }

  const currency = firstLine.unitPrice.currency;
  let amountMinor = 0;

  for (const line of order.lines) {
    if (line.quantity <= 0 || !Number.isInteger(line.quantity)) {
      throw new Error(`Order line "${line.id}" must have a positive integer quantity.`);
    }

    if (line.unitPrice.currency !== currency) {
      throw new Error('All order lines must use the same currency.');
    }

    amountMinor += line.quantity * line.unitPrice.amountMinor;
  }

  return { amountMinor, currency };
}

export function transitionOrder(
  order: CommercialOrder,
  nextStatus: OrderStatus,
  actorId: string,
  reason?: string,
  occurredAt = new Date().toISOString(),
): CommercialOrder {
  const transition = createOrderTransition(
    order.status,
    nextStatus,
    actorId,
    reason,
    occurredAt,
  );

  return {
    ...order,
    status: nextStatus,
    transitions: [...order.transitions, transition],
    updatedAt: occurredAt,
  };
}
