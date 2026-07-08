'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { fetchBrandCoOtbPlanSync } from '@/lib/platform-core-ports/fashion/brand-co-otb-plan-sync-store';
import {
  BRAND_CO_OTB_OTB_SOURCE_RU,
  BRAND_CO_OTB_PLAN_SYNC_BADGE_TESTID,
  BRAND_CO_OTB_PLAN_SYNC_RU,
  BRAND_CO_OTB_REPLENISHMENT_SYNC_STRIP_TESTID,
  BRAND_CO_OTB_REPLENISHMENT_SYNC_SUMMARY_BADGE_TESTID,
  BRAND_CO_OTB_REPLENISHMENT_SYNC_SUMMARY_RU,
  BRAND_CO_OTB_RULES_SOURCE_RU,
  BRAND_CO_OTB_SYNC_STATUS_RU,
  brandCoOtbReplenishmentSyncBuyerLinkTestId,
  brandCoOtbReplenishmentSyncOtbSourceBadgeTestId,
  brandCoOtbReplenishmentSyncRulesSourceBadgeTestId,
} from '@/lib/platform-core-ports/b2b/brand-co-otb-wave-xv';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

export function BrandCoOtbReplenishmentSyncStrip({ collectionId, orderId: _orderId }: Props) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchBrandCoOtbPlanSync>>['rows']>([]);
  const [summary, setSummary] = useState({ buyers: 0, aligned: 0, review: 0, pending: 0 });
  const [otbStorageMode, setOtbStorageMode] = useState('demo');
  const [rulesStorageMode, setRulesStorageMode] = useState('demo');
  const [messageRu, setMessageRu] = useState<string | null>(null);

  useEffect(() => {
    void fetchBrandCoOtbPlanSync(collectionId).then((res) => {
      setRows(res.rows ?? []);
      setSummary(res.summary ?? { buyers: 0, aligned: 0, review: 0, pending: 0 });
      setOtbStorageMode(res.planSync?.otbStorageMode ?? res.otbStorageMode ?? 'demo');
      setRulesStorageMode(res.planSync?.rulesStorageMode ?? res.rulesStorageMode ?? 'demo');
      setMessageRu(res.messageRu ?? null);
    });
  }, [collectionId]);

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={BRAND_CO_OTB_REPLENISHMENT_SYNC_STRIP_TESTID}
    >
      <Badge variant="outline" data-testid={BRAND_CO_OTB_REPLENISHMENT_SYNC_SUMMARY_BADGE_TESTID}>
        {BRAND_CO_OTB_REPLENISHMENT_SYNC_SUMMARY_RU}: {summary.aligned}/{summary.buyers}
      </Badge>
      <Badge variant="outline" data-testid={BRAND_CO_OTB_PLAN_SYNC_BADGE_TESTID}>
        {BRAND_CO_OTB_PLAN_SYNC_RU}
      </Badge>
      <Badge
        variant="outline"
        data-testid={brandCoOtbReplenishmentSyncOtbSourceBadgeTestId(otbStorageMode)}
      >
        {BRAND_CO_OTB_OTB_SOURCE_RU} {otbStorageMode === 'pg' ? 'PG' : otbStorageMode}
      </Badge>
      <Badge
        variant="outline"
        data-testid={brandCoOtbReplenishmentSyncRulesSourceBadgeTestId(rulesStorageMode)}
      >
        {BRAND_CO_OTB_RULES_SOURCE_RU} {rulesStorageMode === 'pg' ? 'PG' : rulesStorageMode}
      </Badge>
      {rows?.map((row) => (
        <span key={row.buyerId} className="contents">
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={row.rulesHref}
            data-testid={brandCoOtbReplenishmentSyncBuyerLinkTestId(row.buyerId)}
            className={hubGadget.goldenLink}
          >
            {row.buyerLabelRu}: {row.presetTitleRu ?? BRAND_CO_OTB_SYNC_STATUS_RU[row.syncStatus]}
          </Link>
        </span>
      ))}
      {messageRu ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <span
            className="text-text-muted text-[10px]"
            data-testid="brand-co-otb-plan-sync-message"
          >
            {messageRu}
          </span>
        </>
      ) : null}
    </div>
  );
}
