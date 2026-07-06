'use client';

import Link from 'next/link';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  WAVE_WO_MFR_GANTT_FLOOR_SOT_LINK_RU,
  WAVE_WO_MFR_GANTT_FLOOR_SOT_RU,
  WAVE_WO_MFR_HANDOFF_FLOOR_SOT_LINK_RU,
  WAVE_WO_MFR_HANDOFF_FLOOR_SOT_RU,
  WAVE_WO_MFR_HANDOFF_FLOOR_SOT_LINK_TESTID,
  WAVE_WO_MFR_HANDOFF_FLOOR_SOT_STRIP_TESTID,
} from '@/lib/platform/wave-wo-mfr-wip-tablet';

type Props =
  | {
      variant: 'handoff-owner';
      registryHref: string;
    }
  | {
      variant: 'gantt-owner';
      handoffQueueHref: string;
    };

/** Wave WO · handoff/Gantt dedup — floor tablet PATCH owner is production orders registry. */
export function MfrOpWipFloorTabletSoTStrip(props: Props) {
  if (props.variant === 'handoff-owner') {
    return (
      <p className={hubGadget.muted} data-testid={WAVE_WO_MFR_HANDOFF_FLOOR_SOT_STRIP_TESTID}>
        {WAVE_WO_MFR_HANDOFF_FLOOR_SOT_RU}{' '}
        <Link
          href={props.registryHref}
          className={hubGadget.goldenLink}
          data-testid={WAVE_WO_MFR_HANDOFF_FLOOR_SOT_LINK_TESTID}
        >
          {WAVE_WO_MFR_HANDOFF_FLOOR_SOT_LINK_RU}
        </Link>
        .
      </p>
    );
  }

  return (
    <p className={hubGadget.muted} data-testid="mfr-op-wip-gantt-floor-sot-strip">
      {WAVE_WO_MFR_GANTT_FLOOR_SOT_RU}{' '}
      <Link
        href={props.handoffQueueHref}
        className={hubGadget.goldenLink}
        data-testid="mfr-op-wip-gantt-floor-sot-link"
      >
        {WAVE_WO_MFR_GANTT_FLOOR_SOT_LINK_RU}
      </Link>
      .
    </p>
  );
}
