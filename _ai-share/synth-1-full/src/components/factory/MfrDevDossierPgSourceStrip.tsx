'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { FactoryDossierResolveSource } from '@/lib/production/workshop2-resolve-factory-dossier';
import {
  WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LABEL_RU,
  WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LINK_TESTID,
  WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_RU,
  WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_TESTID,
  WAVE_YA_MFR_DOSSIER_SOURCE_STRIP_TESTID,
  buildMfrDevDossierBrandDiffPeerHref,
  labelMfrDossierSourceBadgeRu,
  mfrDossierSourceBadgeTestId,
} from '@/lib/platform/wave-ya-mfr-dossier-pg-sot';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
  source: FactoryDossierResolveSource;
};

/** Wave YA · honest PG vs legacy source badge + brand diff peer cross-link. */
export function MfrDevDossierPgSourceStrip({ collectionId, articleId, source }: Props) {
  const brandDiffHref = buildMfrDevDossierBrandDiffPeerHref(collectionId, articleId);

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid={WAVE_YA_MFR_DOSSIER_SOURCE_STRIP_TESTID}
    >
      <Badge
        variant="outline"
        className={
          source === 'postgres'
            ? 'border-sky-200 bg-sky-50 text-[9px] text-sky-900'
            : 'border-amber-200 bg-amber-50 text-[9px] text-amber-900'
        }
        data-testid={mfrDossierSourceBadgeTestId(source)}
      >
        {labelMfrDossierSourceBadgeRu(source)}
      </Badge>
      <Badge
        variant="outline"
        className="text-text-muted text-[9px]"
        data-testid={WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_TESTID}
      >
        {WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_RU}
      </Badge>
      <div className={hubGadget.goldenPath}>
        <Link
          href={brandDiffHref}
          data-testid={WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LINK_TESTID}
          className={hubGadget.goldenLink}
        >
          {WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LABEL_RU} →
        </Link>
      </div>
    </div>
  );
}
