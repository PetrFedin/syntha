'use client';

import Link from 'next/link';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props =
  | {
      variant: 'gantt-owner';
      handoffQueueHref: string;
    }
  | {
      variant: 'handoff-owner';
      registryHref: string;
    };

/** Wave WJ: WIP Гantt ↔ handoff panel — один источник строк, без дубля списка PO. */
export function MfrOpWipGanttSoTStrip(props: Props) {
  if (props.variant === 'gantt-owner') {
    return (
      <p className={hubGadget.muted} data-testid="mfr-op-wip-gantt-handoff-sot-strip">
        WIP · Гantt — здесь. Bulk-приёмка —{' '}
        <Link
          href={props.handoffQueueHref}
          className={hubGadget.goldenLink}
          data-testid="mfr-op-wip-gantt-handoff-sot-link"
        >
          очередь передачи
        </Link>
        .
      </p>
    );
  }

  return (
    <p className={hubGadget.muted} data-testid="mfr-op-handoff-wip-gantt-sot-strip">
      Bulk-приёмка — на этой панели. WIP · Гantt —{' '}
      <Link
        href={props.registryHref}
        className={hubGadget.goldenLink}
        data-testid="mfr-op-handoff-wip-gantt-sot-link"
      >
        производственные заказы
      </Link>
      .
    </p>
  );
}
