'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  fetchBrandScReleaseGateCheck,
  BRAND_DEV_PASSPORT_RELEASE_GATE_CHECKLIST_LINK_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_PEER_STRIP_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_RECHECK_BTN_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_SHOWROOM_PUBLISH_LINK_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_STATUS_BADGE_TESTID,
  brandDevPassportReleaseChecklistHref,
  brandDevPassportReleaseGateStatusLabelRu,
  brandDevPassportShowroomPublishHref,
} from '@/lib/platform-core-ports/brand-release-gate';
import { WAVE_YF_RELEASE_GATE_LOADING_RU } from '@/lib/platform-core-ports/platform/wave-yf-hub-compact-ru';
import {
  WAVE_YP_RELEASE_CHECKLIST_RU,
  WAVE_YP_SHOWROOM_PUBLISH_RU,
} from '@/lib/platform-core-ports/platform/wave-yp-cross-link-audit-fix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
};

/** Wave WQ · dev passport → release gate live status peer strip. */
export function BrandDevPassportReleaseGatePeerStrip({ collectionId }: Props) {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(true);
  const [ready, setReady] = useState(0);
  const [total, setTotal] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const gate = await fetchBrandScReleaseGateCheck(collectionId);
      setBlocked(gate.blocked);
      setReady(gate.summary.ready);
      setTotal(gate.summary.total);
    } catch {
      setBlocked(true);
      setReady(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const checklistHref = brandDevPassportReleaseChecklistHref(collectionId);
  const showroomPublishHref = brandDevPassportShowroomPublishHref(collectionId);

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={BRAND_DEV_PASSPORT_RELEASE_GATE_PEER_STRIP_TESTID}
    >
      {loading ? (
        <Badge variant="secondary" className="text-[9px] uppercase">
          {WAVE_YF_RELEASE_GATE_LOADING_RU}
        </Badge>
      ) : (
        <Badge
          variant={blocked ? 'destructive' : 'outline'}
          className={
            blocked
              ? 'text-[9px] uppercase'
              : 'border-emerald-300 bg-emerald-50 text-[9px] uppercase text-emerald-800'
          }
          data-testid={BRAND_DEV_PASSPORT_RELEASE_GATE_STATUS_BADGE_TESTID}
        >
          {brandDevPassportReleaseGateStatusLabelRu({ blocked, ready, total })}
        </Badge>
      )}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={checklistHref}
        data-testid={BRAND_DEV_PASSPORT_RELEASE_GATE_CHECKLIST_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_RELEASE_CHECKLIST_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={showroomPublishHref}
        data-testid={BRAND_DEV_PASSPORT_RELEASE_GATE_SHOWROOM_PUBLISH_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_SHOWROOM_PUBLISH_RU}
      </Link>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="ml-auto h-6 px-2 text-[9px]"
        disabled={loading}
        data-testid={BRAND_DEV_PASSPORT_RELEASE_GATE_RECHECK_BTN_TESTID}
        onClick={() => void reload()}
      >
        {loading ? '…' : 'Перепроверить'}
      </Button>
    </div>
  );
}
