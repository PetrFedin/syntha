'use client';

import { Badge } from '@/components/ui/badge';
import { useMfrDevDevelopmentStatusMirror } from '@/hooks/use-mfr-dev-development-status-mirror';
import { usePlatformCoreDevelopmentStatusPoll } from '@/hooks/use-platform-core-development-status-poll';
import { PillarInsightSteps } from '@/components/platform/PillarInsightPrimitives';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { mfrSampleQueuePollLabelRu } from '@/lib/platform/wave-xc-mfr-sample-status-patch';
import { WAVE_YS_MFR_DEV_PG_MIRROR_BADGE_RU } from '@/lib/platform/wave-ys-mfr-dev-status-mirror';
import {
  WAVE_ZE_MFR_DEV_MIRROR_EMPTY_RU,
  WAVE_ZE_MFR_DEV_PG_UNAVAILABLE_RU,
} from '@/lib/platform/wave-ze-hub-diagnostics-ru';

type Props = {
  collectionId: string;
  factoryId?: string;
  /** Wave XC: parent poll tick — avoids duplicate EventSource on mfr dev cabinet. */
  devPollTick?: number;
  sseConnected?: boolean;
  suppressDevPollHook?: boolean;
  /** Wave YT: hide PG mirror diagnostics in operator cabinet. */
  showDiagnostics?: boolean;
};

/** Wave VL/XC · PG mirror brand development-status on mfr dev cabinet. */
export function MfrDevDevelopmentStatusMirrorStrip({
  collectionId,
  factoryId,
  devPollTick: devPollTickProp,
  sseConnected: sseConnectedProp,
  suppressDevPollHook = false,
  showDiagnostics = true,
}: Props) {
  const internalPoll = usePlatformCoreDevelopmentStatusPoll(
    !suppressDevPollHook && devPollTickProp == null,
    [collectionId],
    factoryId
  );
  const devPollTick = devPollTickProp ?? internalPoll.tick;
  const sseConnected = sseConnectedProp ?? internalPoll.sseConnected;
  const { steps, articleCount, sampleQueueCount, loading, pgReachable } =
    useMfrDevDevelopmentStatusMirror(collectionId, factoryId, devPollTick);

  const doneCount = steps.filter((s) => s.done).length;
  const progressPct = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : null;

  if (!showDiagnostics) return null;

  return (
    <div
      className="border-border-subtle space-y-2 rounded-md border bg-emerald-50/30 px-3 py-2 text-xs"
      data-testid="mfr-dev-development-status-mirror-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="border-emerald-200 text-[9px] uppercase text-emerald-800"
          data-testid="mfr-dev-development-status-mirror-pg-badge"
        >
          {WAVE_YS_MFR_DEV_PG_MIRROR_BADGE_RU}
        </Badge>
        {pgReachable ? (
          <Badge
            variant="secondary"
            className="text-[9px]"
            data-testid="mfr-dev-development-status-mirror-badge"
          >
            {loading
              ? '…'
              : progressPct != null
                ? `${progressPct}% · ${doneCount}/${steps.length}`
                : '—'}
          </Badge>
        ) : null}
        <span className={hubGadget.muted} data-testid="mfr-dev-development-status-mirror-meta">
          {loading
            ? 'Зеркало бренда…'
            : pgReachable
              ? `Артикулы ${articleCount} · очередь ${sampleQueueCount} · ${mfrSampleQueuePollLabelRu(sseConnected)}`
              : WAVE_ZE_MFR_DEV_PG_UNAVAILABLE_RU}
        </span>
      </div>
      {steps.length > 0 ? (
        <PillarInsightSteps steps={steps} testId="mfr-dev-development-status-mirror-steps" />
      ) : !loading ? (
        <p className={hubGadget.muted}>{WAVE_ZE_MFR_DEV_MIRROR_EMPTY_RU}</p>
      ) : null}
    </div>
  );
}
