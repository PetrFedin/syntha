'use client';

import Link from 'next/link';
import {
  brandDevInvestorReleaseGatePeerHref,
  brandDevTasksKanbanPeerHref,
} from '@/lib/platform-core-ports/platform/brand-dev-investor-readiness-dashboard';
import {
  WAVE_YF_BRAND_DEV_INVESTOR_PEER_STRIP_TESTID,
  WAVE_YF_RELEASE_GATE_RU,
} from '@/lib/platform-core-ports/platform/wave-yf-hub-compact-ru';
import { ROUTES } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  /** Скрыть ссылку Kanban, если панель уже на экране (wave XF dedup). */
  omitKanbanLink?: boolean;
  /** Wave YF: golden path / readiness strip уже показывают релиз — только задачи. */
  omitReleaseGate?: boolean;
};

/** Wave WE · investor-readiness peers: release gate + tasks (kanban peer опционально). */
export function BrandDevInvestorReadinessPeerStrip({
  collectionId,
  omitKanbanLink = false,
  omitReleaseGate = false,
}: Props) {
  const kanbanHref = brandDevTasksKanbanPeerHref(collectionId);
  const releaseGateHref = brandDevInvestorReleaseGatePeerHref(collectionId);

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={WAVE_YF_BRAND_DEV_INVESTOR_PEER_STRIP_TESTID}
    >
      {!omitKanbanLink ? (
        <>
          <Link
            href={kanbanHref}
            data-testid="brand-dev-investor-readiness-kanban-peer-link"
            className={hubGadget.goldenLink}
          >
            Kanban задач
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
        </>
      ) : null}
      {!omitReleaseGate ? (
        <>
          <Link
            href={releaseGateHref}
            data-testid="brand-dev-investor-readiness-release-gate-peer-link"
            className={hubGadget.goldenLink}
          >
            {WAVE_YF_RELEASE_GATE_RU}
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
        </>
      ) : null}
      <Link
        href={ROUTES.brand.tasks}
        data-testid="brand-dev-investor-readiness-tasks-peer-link"
        className={hubGadget.goldenLink}
      >
        Все задачи
      </Link>
    </div>
  );
}
