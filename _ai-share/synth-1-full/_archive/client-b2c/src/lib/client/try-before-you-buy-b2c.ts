/**
 * Try Before You Buy (B2C) — примерка с холдированием средств. Не B2B matrix.
 * Связи: Заказы, клиент, возвраты. Инфра под API.
 */

export type TBYBStatus =
  | 'hold_placed'
  | 'shipped'
  | 'delivered'
  | 'purchased'
  | 'returned'
  | 'hold_released'
  | 'cancelled';

export interface TBYBOrder {
  id: string;
  orderId: string;
  customerId: string;
  status: TBYBStatus;
  /** Захолдированная сумма */
  holdAmountRub: number;
  /** Товары на примерку */
  items: { sku: string; name: string; qty: number }[];
  shippedAt?: string;
  returnByDate?: string;
  createdAt: string;
}

export const TRY_BEFORE_YOU_BUY_B2C_API = {
  create: '/api/v1/client/tbyb/orders',
  list: '/api/v1/client/tbyb/orders',
  confirmPurchase: '/api/v1/client/tbyb/orders/:id/confirm',
  returnAll: '/api/v1/client/tbyb/orders/:id/return',
  getHoldStatus: '/api/v1/client/tbyb/orders/:id/hold',
} as const;
