'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SupCmLogisticsEtaMapOverlayStrip } from '@/components/factory/supplier/SupCmLogisticsEtaMapOverlayStrip';
import { shopB2bTrackingOrderHref } from '@/lib/routes';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import {
  SUP_CM_CALENDAR_LOGISTICS_PEER_STRIP_TESTID,
  supCmLogisticsDeliveryCommsRu,
  supCmLogisticsPeerBadgeRu,
} from '@/lib/fashion/supplier-logistics-wave-vo';

type Props = {
  collectionId: string;
  articleId: string;
  orderId: string;
};

/** Логистика peer — ETA/map overlay + трекинг магазина + чат по поставке. */
export function SupplierCalendarLogisticsPeerStrip({ collectionId, articleId, orderId }: Props) {
  const session = buildSupplierOrderCommsSession({ collectionId, articleId, orderId });

  return (
    <div className="space-y-2" data-testid={SUP_CM_CALENDAR_LOGISTICS_PEER_STRIP_TESTID}>
      <SupCmLogisticsEtaMapOverlayStrip orderId={orderId} />
      <div className="border-border-subtle bg-bg-surface2/60 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs">
        <Badge variant="outline" className="text-[9px] uppercase">
          {supCmLogisticsPeerBadgeRu()}
        </Badge>
        <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
          <Link
            href={shopB2bTrackingOrderHref(orderId)}
            data-testid="sup-cm-calendar-shop-tracking-link"
          >
            Трекинг магазина
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link href={session.messagesHref} data-testid="sup-cm-calendar-delivery-comms-link">
            {supCmLogisticsDeliveryCommsRu()}
          </Link>
        </Button>
      </div>
    </div>
  );
}
