'use client';

import { Badge } from '@/components/ui/badge';
import { useOperationalOrderBrandStatusMirror } from '@/hooks/use-operational-order-brand-status-mirror';
import { mapOperationalStatusLabelRu } from '@/lib/integrations/spine/integration-ui-utils';

type Props = {
  orderId: string;
};

/** Shop registry row: зеркало PATCH v1 статуса бренда. */
export function ShopCoRegistryBrandStatusMirrorBadge({ orderId }: Props) {
  const status = useOperationalOrderBrandStatusMirror(orderId, Boolean(orderId.trim()));
  if (!status) return null;

  return (
    <Badge
      variant="outline"
      className="ml-1 border-sky-200 bg-sky-50 text-[9px] text-sky-900"
      data-testid="shop-co-registry-brand-status-mirror-badge"
    >
      Бренд · {mapOperationalStatusLabelRu(status)}
    </Badge>
  );
}
