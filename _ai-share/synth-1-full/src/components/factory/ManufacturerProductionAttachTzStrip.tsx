'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  manufacturerCommsEntitiesHref,
  manufacturerCommsInboxHref,
} from '@/lib/fashion/manufacturer-comms-entity-threads';
import { attachFactoryCommsEntityThreadTz } from '@/lib/fashion/factory-comms-entity-thread-attach-tz-store';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
};

export function ManufacturerProductionAttachTzStrip({ collectionId, articleId, orderId }: Props) {
  const [busy, setBusy] = useState(false);
  const [attached, setAttached] = useState(false);
  const [dossierHref, setDossierHref] = useState<string | null>(null);

  const entitiesHref = manufacturerCommsEntitiesHref();

  const attach = async () => {
    setBusy(true);
    try {
      const res = await attachFactoryCommsEntityThreadTz({
        variant: 'manufacturer',
        collectionId,
        articleId,
        threadKind: 'dossier',
      });
      if (res.ok) {
        setAttached(true);
        if (res.dossierHref) setDossierHref(res.dossierHref);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid="mfr-op-production-attach-tz-strip"
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        TZ attach
      </Badge>
      <span className="text-text-secondary">
        Прикрепить ТЗ из досье в entity thread — для чата с брендом по PO.
      </span>
      <Button
        type="button"
        size="sm"
        variant={attached ? 'secondary' : 'default'}
        className="h-7 text-[10px]"
        disabled={busy || attached}
        data-testid="mfr-op-production-attach-tz-btn"
        onClick={() => void attach()}
      >
        {attached ? 'ТЗ прикреплено' : busy ? '…' : 'Attach TZ'}
      </Button>
      {dossierHref ? (
        <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
          <Link href={dossierHref} data-testid="mfr-op-production-attach-tz-dossier-link">
            Dossier
          </Link>
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
        <Link href={entitiesHref} data-testid="mfr-op-production-attach-tz-entities-link">
          Entities
        </Link>
      </Button>
      <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
        <Link
          href={manufacturerCommsInboxHref()}
          data-testid="mfr-op-production-attach-tz-inbox-link"
        >
          Inbox
        </Link>
      </Button>
    </div>
  );
}
