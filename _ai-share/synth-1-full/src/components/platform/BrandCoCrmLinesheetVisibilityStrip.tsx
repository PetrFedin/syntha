'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { fetchBrandCoCrmLinesheetVisibility } from '@/lib/platform-core-ports/fashion/brand-co-crm-linesheet-visibility-store';
import { brandCoCrmLinesheetBrandPreviewHref } from '@/lib/platform-core-ports/b2b/brand-co-crm-linesheet-visibility';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import {
  BRAND_CO_CRM_LINESHEET_BRAND_SHOWROOM_RU,
  BRAND_CO_CRM_LINESHEET_CRM_SEGMENTS_RU,
  BRAND_CO_CRM_LINESHEET_GATED_SUFFIX_RU,
  BRAND_CO_CRM_LINESHEET_PG_SOURCE_RU,
  BRAND_CO_CRM_LINESHEET_SHOP_SHOWROOM_RU,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_SEGMENTS_LINK_TESTID,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOP_SHOWROOM_LINK_TESTID,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOWROOM_LINK_TESTID,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_STRIP_TESTID,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_SUMMARY_BADGE_TESTID,
  BRAND_CO_CRM_LINESHEET_VISIBILITY_SUMMARY_RU,
  brandCoCrmLinesheetSegmentLinkTestId,
  brandCoCrmLinesheetSegmentShopLinkTestId,
  brandCoCrmLinesheetShopShowroomHref,
  brandCoCrmLinesheetVisibilitySourceBadgeTestId,
} from '@/lib/platform-core-ports/b2b/brand-co-crm-wave-xb';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
};

/** CRM → showroom · PG buyer_segments auto linesheet visibility (wave XB). */
export function BrandCoCrmLinesheetVisibilityStrip({ collectionId }: Props) {
  const [rows, setRows] = useState<
    Awaited<ReturnType<typeof fetchBrandCoCrmLinesheetVisibility>>['rows']
  >([]);
  const [summary, setSummary] = useState({ total: 0, autoVisible: 0, gated: 0 });
  const [storageMode, setStorageMode] = useState('demo');

  useEffect(() => {
    void fetchBrandCoCrmLinesheetVisibility(collectionId).then((res) => {
      setRows(res.rows ?? []);
      setSummary(res.summary ?? { total: 0, autoVisible: 0, gated: 0 });
      setStorageMode(res.storageMode ?? 'demo');
    });
  }, [collectionId]);

  const segmentsHref = useMemo(
    () => brandCrmSegmentationFeatureHref('segments', collectionId),
    [collectionId]
  );
  const showroomHref = useMemo(
    () => brandCrmSegmentationFeatureHref('showroom', collectionId),
    [collectionId]
  );
  const shopShowroomHref = useMemo(
    () => brandCoCrmLinesheetShopShowroomHref({ collectionId }),
    [collectionId]
  );

  return (
    <div className={hubGadget.goldenPath} data-testid={BRAND_CO_CRM_LINESHEET_VISIBILITY_STRIP_TESTID}>
      <Badge variant="outline" data-testid={BRAND_CO_CRM_LINESHEET_VISIBILITY_SUMMARY_BADGE_TESTID}>
        {BRAND_CO_CRM_LINESHEET_VISIBILITY_SUMMARY_RU}: {summary.autoVisible}/{summary.total}
      </Badge>
      <Badge
        variant="outline"
        data-testid={brandCoCrmLinesheetVisibilitySourceBadgeTestId(storageMode)}
      >
        {storageMode === 'pg' ? BRAND_CO_CRM_LINESHEET_PG_SOURCE_RU : storageMode}
      </Badge>
      {rows?.slice(0, 4).map((row) => (
        <span key={row.segmentKey} className="contents">
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={brandCoCrmLinesheetBrandPreviewHref(collectionId, row.segmentKey)}
            data-testid={brandCoCrmLinesheetSegmentLinkTestId(row.segmentKey)}
            className={hubGadget.goldenLink}
          >
            {row.nameRu}
            {row.autoVisible ? '' : BRAND_CO_CRM_LINESHEET_GATED_SUFFIX_RU}
          </Link>
          {row.autoVisible ? (
            <>
              <span className={hubGadget.goldenSep} aria-hidden>
                →
              </span>
              <Link
                href={row.shopShowroomHref}
                data-testid={brandCoCrmLinesheetSegmentShopLinkTestId(row.segmentKey)}
                className={hubGadget.goldenLink}
              >
                {BRAND_CO_CRM_LINESHEET_SHOP_SHOWROOM_RU}
              </Link>
            </>
          ) : null}
        </span>
      ))}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={segmentsHref}
        data-testid={BRAND_CO_CRM_LINESHEET_VISIBILITY_SEGMENTS_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {BRAND_CO_CRM_LINESHEET_CRM_SEGMENTS_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={showroomHref}
        data-testid={BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOWROOM_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {BRAND_CO_CRM_LINESHEET_BRAND_SHOWROOM_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shopShowroomHref}
        data-testid={BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOP_SHOWROOM_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {BRAND_CO_CRM_LINESHEET_SHOP_SHOWROOM_RU}
      </Link>
    </div>
  );
}
