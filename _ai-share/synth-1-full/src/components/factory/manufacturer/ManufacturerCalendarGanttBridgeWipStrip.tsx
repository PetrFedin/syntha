'use client';

import { useEffect, useRef } from 'react';
import { MfrOpWipGanttStrip } from '@/components/factory/manufacturer/MfrOpWipGanttStrip';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { MFR_CM_CALENDAR_GANTT_BRIDGE_WIP_TESTID } from '@/lib/platform/platform-core-mfr-comms-wy-gantt-bridge';

type Props = {
  factoryId: string;
  collectionId: string;
  orderId?: string;
  focusTaskId?: string;
};

/** Wave WY · pcTask-aware WIP Gantt embed on production calendar (handoff SoT). */
export function ManufacturerCalendarGanttBridgeWipStrip({
  factoryId,
  collectionId,
  orderId,
  focusTaskId,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const session = buildManufacturerHandoffQueueSession({
    factoryId,
    collectionId,
    orderId,
  });

  useEffect(() => {
    if (!focusTaskId?.trim()) return;
    rootRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusTaskId]);

  return (
    <div
      ref={rootRef}
      className="rounded-md border border-amber-200/60 bg-amber-50/20 px-2 py-1.5"
      data-testid={MFR_CM_CALENDAR_GANTT_BRIDGE_WIP_TESTID}
      data-pc-task={focusTaskId?.trim() || undefined}
    >
      <MfrOpWipGanttStrip
        factoryId={factoryId}
        orderId={orderId}
        compact
        maxRows={4}
        handoffQueueHref={session.handoffHref}
        showSoTStrip={Boolean(orderId?.trim())}
      />
    </div>
  );
}
