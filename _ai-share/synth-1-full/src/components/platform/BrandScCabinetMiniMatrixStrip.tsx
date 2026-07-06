'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BRAND_SC_CROSS_MATRIX_MINI_MATRIX_LABEL_RU,
  brandScCrossMatrixMiniMatrixHintRu,
  brandScCrossMatrixMiniMatrixHref,
} from '@/lib/platform-core-ports/b2b/brand-sc-cross-matrix';
import {
  WAVE_YR_BRAND_SC_MINI_MATRIX_HINT_TESTID,
  WAVE_YR_BRAND_SC_MINI_MATRIX_LINK_TESTID,
  brandScCrossMatrixOneClickAriaLabelRu,
} from '@/lib/platform-core-ports/platform/wave-yr-brand-sc-matrix-cta';
import { WAVE_YT_HUB_READPATH_OWNER_TESTID } from '@/lib/platform-core-ports/platform/wave-yt-hub-noise-pass2';
import { PlatformCorePublishedArticlesReadPathBadge } from '@/components/platform/PlatformCorePublishedArticlesReadPathBadge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  carryQtyTotal?: number;
};

/** Wave YR/YT · cabinet one-click mini-matrix CTA + readpath=api badge (owner strip). */
export function BrandScCabinetMiniMatrixStrip({ collectionId, carryQtyTotal }: Props) {
  const [articleIds, setArticleIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/published-articles`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          articles?: Array<{ articleId?: string }>;
        };
        if (cancelled || !json.ok) return;
        setArticleIds(
          (json.articles ?? []).map((a) => String(a.articleId ?? '').trim()).filter(Boolean)
        );
      } catch {
        if (!cancelled) setArticleIds([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  const href = brandScCrossMatrixMiniMatrixHref(collectionId, articleIds, carryQtyTotal);
  const hint = brandScCrossMatrixMiniMatrixHintRu(articleIds.length, carryQtyTotal);

  const ariaLabel = brandScCrossMatrixOneClickAriaLabelRu(articleIds.length, 'mini-matrix');

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_YT_HUB_READPATH_OWNER_TESTID}>
      <Link
        href={href}
        className={hubGadget.goldenLink}
        data-testid={WAVE_YR_BRAND_SC_MINI_MATRIX_LINK_TESTID}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {BRAND_SC_CROSS_MATRIX_MINI_MATRIX_LABEL_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <span
        className="text-text-muted text-[10px] leading-snug"
        data-testid={WAVE_YR_BRAND_SC_MINI_MATRIX_HINT_TESTID}
      >
        {hint}
      </span>
      <PlatformCorePublishedArticlesReadPathBadge collectionId={collectionId} />
    </div>
  );
}
