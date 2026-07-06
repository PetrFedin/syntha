'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { attachFactoryCommsEntityThreadTz } from '@/lib/fashion/factory-comms-entity-thread-attach-tz-store';
import { ROUTES } from '@/lib/routes';

type Props = {
  collectionId: string;
  orderId?: string;
  factoryId?: string;
  articleId?: string;
};

/** Milestone Gantt peer — brand production view with PO/collection + handoff spine. */
export function ManufacturerCalendarGanttBridgeStrip({
  collectionId,
  orderId,
  factoryId,
  articleId,
}: Props) {
  const qs = new URLSearchParams();
  if (orderId?.trim()) qs.set('po', orderId.trim());
  qs.set('collection', collectionId);
  const href = `${ROUTES.brand.productionGantt}?${qs.toString()}`;
  const collectionGanttHref = `/brand/calendar/collection/${encodeURIComponent(collectionId)}`;
  const session = buildManufacturerHandoffQueueSession({
    factoryId,
    collectionId,
    orderId,
  });
  const [attachBusy, setAttachBusy] = useState(false);
  const [attachDone, setAttachDone] = useState(false);

  const handleAttachTz = async () => {
    if (attachBusy || attachDone || !articleId?.trim()) return;
    setAttachBusy(true);
    try {
      const res = await attachFactoryCommsEntityThreadTz({
        variant: 'manufacturer',
        collectionId,
        articleId: articleId.trim(),
        threadKind: 'dossier',
      });
      if (res.ok) setAttachDone(true);
    } finally {
      setAttachBusy(false);
    }
  };

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-bg-surface2/60 px-3 py-2 text-xs"
      data-testid="mfr-cm-calendar-gantt-bridge-strip"
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        Gantt
      </Badge>
      <span className="text-text-secondary">
        Milestone Gantt · сроки образцов и PO (peer к brand production).
      </span>
      <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
        <Link href={href} data-testid="mfr-cm-calendar-gantt-link">
          Открыть Gantt
        </Link>
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
        <Link href={collectionGanttHref} data-testid="mfr-cm-calendar-gantt-collection-link">
          Collection Gantt
        </Link>
      </Button>
      {articleId?.trim() ? (
        <Button
          type="button"
          size="sm"
          variant={attachDone ? 'secondary' : 'default'}
          className="h-7 text-[10px]"
          disabled={attachBusy || attachDone}
          data-testid="mfr-cm-calendar-gantt-attach-tz-btn"
          onClick={() => void handleAttachTz()}
        >
          {attachDone ? 'TZ attached' : attachBusy ? '…' : 'Attach TZ'}
        </Button>
      ) : null}
      {orderId ? (
        <>
          <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
            <Link href={session.handoffHref} data-testid="mfr-cm-calendar-gantt-handoff-link">
              Очередь передачи
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
            <Link href={session.productionOpsCutTicketHref} data-testid="mfr-cm-calendar-gantt-cut-ticket-link">
              Техкарта раскроя
            </Link>
          </Button>
        </>
      ) : null}
    </div>
  );
}
