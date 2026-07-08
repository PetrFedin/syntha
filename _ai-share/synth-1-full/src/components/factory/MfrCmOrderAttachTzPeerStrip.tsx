'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { attachFactoryCommsEntityThreadTz } from '@/lib/fashion/factory-comms-entity-thread-attach-tz-store';
import { manufacturerCommsEntitiesHref } from '@/lib/fashion/manufacturer-comms-entity-threads';
import { ROUTES } from '@/lib/routes';
import { WORKSHOP2_COL_PARAM } from '@/lib/production/workshop2-url';
import { platformCoreW2PrefetchHandlers } from '@/lib/platform-core-w2-prefetch';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
};

/** Wave UL / BW · attach TZ peer на order comms (article context). */
export function MfrCmOrderAttachTzPeerStrip({ collectionId, articleId, orderId }: Props) {
  const [busy, setBusy] = useState(false);
  const [attached, setAttached] = useState(false);
  const brandW2Href = `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`;

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
      data-testid="mfr-cm-order-attach-tz-peer-strip"
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        Order TZ
      </Badge>
      <Link
        href={brandW2Href}
        data-testid="mfr-cm-order-brand-w2-peer-link"
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
        data-testid="mfr-cm-order-attach-tz-btn"
        onClick={() => void attach()}
      >
        {attached ? 'TZ в треде' : busy ? '…' : 'Прикрепить TZ'}
      </Button>
      <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
        <Link href={manufacturerCommsEntitiesHref()} data-testid="mfr-cm-order-entities-link">
          Сущности
        </Link>
      </Button>
    </div>
  );
}
