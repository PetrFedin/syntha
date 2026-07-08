'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { attachFactoryCommsEntityThreadTz } from '@/lib/fashion/factory-comms-entity-thread-attach-tz-store';
import {
  MFR_CM_CALENDAR_ATTACH_TZ_BW_BTN_TESTID,
  MFR_CM_CALENDAR_ATTACH_TZ_BW_ORDER_LINK_TESTID,
  MFR_CM_CALENDAR_ATTACH_TZ_BW_PEER_TESTID,
  mfrCmOrderAttachTzPeerHref,
} from '@/lib/platform/platform-core-mfr-comms-wy-gantt-bridge';
import { platformCoreW2PrefetchHandlers } from '@/lib/platform-core-w2-prefetch';
import { ROUTES } from '@/lib/routes';
import { WORKSHOP2_COL_PARAM } from '@/lib/production/workshop2-url';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  factoryId?: string;
};

/** Wave WY / BW · calendar attach TZ peer + brand W2 cross-link to order comms. */
export function MfrCmCalendarAttachTzBwPeerStrip({
  collectionId,
  articleId,
  orderId,
  factoryId,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [attached, setAttached] = useState(false);
  const brandW2Href = `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`;
  const resolvedOrderId = orderId?.trim() || '';

  const attach = async () => {
    setBusy(true);
    try {
      const res = await attachFactoryCommsEntityThreadTz({
        variant: 'manufacturer',
        collectionId,
        articleId,
        threadKind: 'dossier',
      });
      if (res.ok) setAttached(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid={MFR_CM_CALENDAR_ATTACH_TZ_BW_PEER_TESTID}
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        TZ · BW
      </Badge>
      <Link
        href={brandW2Href}
        data-testid="mfr-cm-calendar-brand-w2-peer-link"
        className="text-accent-primary font-medium hover:underline"
        {...platformCoreW2PrefetchHandlers}
      >
        ТЗ бренда (read-only) →
      </Link>
      <Button
        type="button"
        size="sm"
        variant={attached ? 'secondary' : 'outline'}
        className="h-7 text-[10px]"
        disabled={busy || attached}
        data-testid={MFR_CM_CALENDAR_ATTACH_TZ_BW_BTN_TESTID}
        onClick={() => void attach()}
      >
        {attached ? 'TZ в треде' : busy ? '…' : 'Прикрепить TZ'}
      </Button>
      {resolvedOrderId ? (
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link
            href={mfrCmOrderAttachTzPeerHref({
              collectionId,
              orderId: resolvedOrderId,
              factoryId,
            })}
            data-testid={MFR_CM_CALENDAR_ATTACH_TZ_BW_ORDER_LINK_TESTID}
          >
            Order TZ peer →
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
