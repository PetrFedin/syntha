'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  brandOpCutTicketGetApiPath,
  brandOpCutTicketPgVerifyBadgeRu,
  BRAND_OP_CUT_TICKET_PG_VERIFY_BADGE_TESTID,
} from '@/lib/platform-core-ports/fashion/brand-op-wave-vq';

type Props = {
  productionOrderId?: string;
};

/** Wave VQ/UG: read-only mirror badge for workshop2_purchase_orders.cut_ticket PG verify. */
export function BrandOpCutTicketPgVerifyBadge({ productionOrderId }: Props) {
  const [verified, setVerified] = useState(false);
  const [ticketNo, setTicketNo] = useState<string | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const poId = productionOrderId?.trim();
    if (!poId) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    void fetch(brandOpCutTicketGetApiPath(poId), { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as {
          pgVerified?: boolean;
          cutTicket?: { ticketNo?: string };
        };
      })
      .then((json) => {
        if (cancelled) return;
        setVerified(json?.pgVerified === true);
        setTicketNo(json?.cutTicket?.ticketNo);
      })
      .catch(() => {
        if (!cancelled) setVerified(false);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [productionOrderId]);

  if (!productionOrderId?.trim() || !loaded) return null;

  return (
    <Badge
      variant="outline"
      data-testid={BRAND_OP_CUT_TICKET_PG_VERIFY_BADGE_TESTID}
      className={
        verified
          ? 'mt-1.5 border-emerald-200 bg-emerald-50 text-[9px] text-emerald-800'
          : 'mt-1.5 border-amber-200 bg-amber-50 text-[9px] text-amber-900'
      }
    >
      {brandOpCutTicketPgVerifyBadgeRu({ verified, ticketNo })}
    </Badge>
  );
}
