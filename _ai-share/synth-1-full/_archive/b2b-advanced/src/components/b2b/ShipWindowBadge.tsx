'use client';

import { Badge } from '@/components/ui/badge';
import { SHIP_WINDOWS } from '@/lib/b2b-features';
import type { ShipWindowType } from '@/lib/b2b-features';

/** B2BOrder.orderMode → buy_now≈at_once, reorder≈re_order, pre_order≈pre_order */
const ORDER_MODE_TO_SHIP: Record<string, ShipWindowType> = {
  buy_now: 'at_once',
  reorder: 're_order',
  pre_order: 'pre_order',
};

interface ShipWindowBadgeProps {
  orderMode?: string;
  shipWindowType?: ShipWindowType;
  className?: string;
}

/** Badge для отображения ship window (Pre-order / At-Once / Re-order). */
export function ShipWindowBadge({ orderMode, shipWindowType, className }: ShipWindowBadgeProps) {
  const type: ShipWindowType | undefined =
    shipWindowType ?? (orderMode ? ORDER_MODE_TO_SHIP[orderMode] : undefined);
  if (!type || !SHIP_WINDOWS[type]) return null;
  const config = SHIP_WINDOWS[type];
  return (
    <Badge variant="outline" className={className}>
      {config.label}
    </Badge>
  );
}
