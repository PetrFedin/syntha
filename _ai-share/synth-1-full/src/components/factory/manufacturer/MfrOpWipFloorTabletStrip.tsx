'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  factoryMesReleaseStageLabelRu,
  type FactoryMesReleaseStage,
} from '@/lib/production/workshop2-factory-mes-release-stage';
import {
  factoryMaterialsProcurementHrefForDemo,
  factoryHandoffQueueHrefForDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  WAVE_WO_MFR_WIP_ADVANCE_BTN_RU,
  WAVE_WO_MFR_WIP_FLOOR_ADVANCE_BTN_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_BLOCKED_RU,
  WAVE_WO_MFR_WIP_FLOOR_BLOCKED_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_GANTT_LINK_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_HANDOFF_LINK_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_MESSAGE_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_PEER_STRIP_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_QC_BTN_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_STAGE_BADGE_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_TABLET_STRIP_TESTID,
  WAVE_WO_MFR_WIP_GANTT_PEER_RU,
  WAVE_WO_MFR_WIP_HANDOFF_PEER_RU,
  WAVE_WO_MFR_WIP_QC_BTN_RU,
  WAVE_WO_MFR_WIP_TABLET_TITLE_RU,
} from '@/lib/platform/wave-wo-mfr-wip-tablet';

type Props = {
  productionOrderId: string;
  collectionId: string;
  articleId: string;
  factoryId?: string;
  b2bOrderId?: string;
  wipStatus: string;
  poStatus: string;
  compact?: boolean;
  /** Peer to Gantt/WIP timeline (Wave WJ · same page or registry). */
  ganttHref?: string;
  /** Hide handoff peer when handoff SoT strip is shown nearby (Wave WO dedup). */
  hideHandoffPeer?: boolean;
  onWipUpdated?: (wipStatus: string) => void;
};

/** Wave WO · WIP PATCH с планшета цеха (PG wip_status). */
export function MfrOpWipFloorTabletStrip({
  productionOrderId,
  collectionId,
  articleId,
  factoryId = PLATFORM_CORE_DEMO.factoryId,
  b2bOrderId,
  wipStatus,
  poStatus,
  compact = false,
  ganttHref,
  hideHandoffPeer = false,
  onWipUpdated,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [localWipStatus, setLocalWipStatus] = useState(wipStatus);
  const [messageRu, setMessageRu] = useState<string | null>(null);

  const canPatch = poStatus === 'synced';

  const patchWip = async (mode: 'advance' | FactoryMesReleaseStage) => {
    setBusy(true);
    setMessageRu(null);
    try {
      const body =
        mode === 'advance'
          ? { factoryId, collectionId, articleId, advance: true }
          : { factoryId, collectionId, articleId, stage: mode };
      const res = await fetch(
        `/api/workshop2/manufacturer/production-orders/${encodeURIComponent(productionOrderId)}/wip-status`,
        {
          method: 'PATCH',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        wipStatus?: string;
        stage?: string;
        messageRu?: string;
      };
      const next = json.wipStatus ?? json.stage;
      if (json.ok && next) {
        setLocalWipStatus(next);
        onWipUpdated?.(next);
        setMessageRu(json.messageRu ?? 'WIP обновлён.');
      } else {
        setMessageRu(json.messageRu ?? 'WIP недоступен.');
      }
    } finally {
      setBusy(false);
    }
  };

  const demo = {
    ...PLATFORM_CORE_DEMO,
    factoryId,
    collectionId,
    demoOrderId: b2bOrderId ?? PLATFORM_CORE_DEMO.demoOrderId,
  };
  const handoffHref = factoryHandoffQueueHrefForDemo(demo);
  const materialsHref = factoryMaterialsProcurementHrefForDemo(demo);
  const ganttPeerHref = ganttHref ?? '#mfr-op-wip-gantt-strip';

  return (
    <div
      className={
        compact
          ? 'space-y-1 border-t border-slate-100 pt-1.5'
          : 'border-border-subtle space-y-2 rounded-md border bg-slate-50/60 p-2'
      }
      data-testid={WAVE_WO_MFR_WIP_FLOOR_TABLET_STRIP_TESTID}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold text-slate-800">
          {WAVE_WO_MFR_WIP_TABLET_TITLE_RU}
        </span>
        <Badge
          variant="outline"
          className="text-[8px] uppercase"
          data-testid={WAVE_WO_MFR_WIP_FLOOR_STAGE_BADGE_TESTID}
        >
          {factoryMesReleaseStageLabelRu(localWipStatus)}
        </Badge>
      </div>
      <div className={hubGadget.goldenPath} data-testid={WAVE_WO_MFR_WIP_FLOOR_PEER_STRIP_TESTID}>
        <Link
          href={ganttPeerHref}
          data-testid={WAVE_WO_MFR_WIP_FLOOR_GANTT_LINK_TESTID}
          className={hubGadget.goldenLink}
        >
          {WAVE_WO_MFR_WIP_GANTT_PEER_RU}
        </Link>
        {!hideHandoffPeer ? (
          <>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={handoffHref}
              data-testid={WAVE_WO_MFR_WIP_FLOOR_HANDOFF_LINK_TESTID}
              className={hubGadget.goldenLink}
            >
              {WAVE_WO_MFR_WIP_HANDOFF_PEER_RU}
            </Link>
          </>
        ) : null}
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={materialsHref}
          data-testid="mfr-op-wip-floor-materials-link"
          className={hubGadget.goldenLink}
        >
          Закупка материалов
        </Link>
      </div>
      {canPatch ? (
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-7 text-[9px] font-bold"
            disabled={busy}
            data-testid={WAVE_WO_MFR_WIP_FLOOR_ADVANCE_BTN_TESTID}
            onClick={() => void patchWip('advance')}
          >
            {WAVE_WO_MFR_WIP_ADVANCE_BTN_RU}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-[9px] font-bold"
            disabled={busy}
            data-testid={WAVE_WO_MFR_WIP_FLOOR_QC_BTN_TESTID}
            onClick={() => void patchWip('qc')}
          >
            {WAVE_WO_MFR_WIP_QC_BTN_RU}
          </Button>
        </div>
      ) : (
        <p
          className="text-text-muted text-[9px]"
          data-testid={WAVE_WO_MFR_WIP_FLOOR_BLOCKED_TESTID}
        >
          {WAVE_WO_MFR_WIP_FLOOR_BLOCKED_RU}
        </p>
      )}
      {messageRu ? (
        <p
          className="text-text-muted text-[9px]"
          data-testid={WAVE_WO_MFR_WIP_FLOOR_MESSAGE_TESTID}
        >
          {messageRu}
        </p>
      ) : null}
    </div>
  );
}
