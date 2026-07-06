'use client';

import { Badge } from '@/components/ui/badge';
import { formatWaveWiSupBackorderBadgeRu } from '@/lib/platform/wave-wi-supplier-partial-ship';

type Props = {
  active?: boolean;
  partialShipQty?: number;
  requestedQty?: number;
};

/** Backorder badge после частичной отгрузки (Wave WI). */
export function SupplierBackorderBadge({ active = false, partialShipQty, requestedQty }: Props) {
  if (!active) return null;

  return (
    <Badge
      variant="outline"
      className="border-amber-300 bg-amber-50 text-[9px] text-amber-900"
      data-testid="sup-op-backorder-badge"
    >
      {formatWaveWiSupBackorderBadgeRu(partialShipQty, requestedQty)}
    </Badge>
  );
}
