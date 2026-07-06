'use client';

import Link from 'next/link';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';
import {
  brandLinesheetsHrefForDemo,
  brandShowroomHrefForDemo,
  getPlatformCoreDemo,
} from '@/lib/platform-core-hub-matrix';
import { ROUTES, factoryProductionDossierHref } from '@/lib/routes';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';

type Props = {
  collectionId: string;
};

/** Peer deep-links на W2 hub: план, витрина, лайншиты, досье цеха. */
export function BrandDevW2HubContextStrip({ collectionId }: Props) {
  const demo = getPlatformCoreDemo(collectionId);
  const rangePlannerHref = `${ROUTES.brand.rangePlanner}?collection=${encodeURIComponent(collectionId)}`;
  const showroomHref = brandShowroomHrefForDemo(demo);
  const linesheetsHref = brandLinesheetsHrefForDemo(demo);
  const dossierHref = workshop2ArticleHref(collectionId, demo.demoArticleId);
  const factoryDossierHref = factoryProductionDossierHref(demo.demoArticleId, { collectionId });

  return (
    <div
      className={cn(
        hubGadget.goldenPath,
        hubCabinet.workspaceTableScroll,
        'max-md:flex-nowrap'
      )}
      data-testid="brand-dev-w2-hub-context-strip"
      data-audit-legacy="brand-w2-hub-cross-links"
    >
      <Link
        href={rangePlannerHref}
        className={hubGadget.goldenLink}
        data-testid="brand-dev-w2-hub-range-link"
        data-audit-legacy="brand-w2-range-planner-link"
      >
        План ассортимента
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={showroomHref}
        className={hubGadget.goldenLink}
        data-testid="brand-dev-w2-hub-showroom-link"
      >
        Витрина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={linesheetsHref}
        className={hubGadget.goldenLink}
        data-testid="brand-dev-w2-hub-linesheets-link"
      >
        Лайншиты
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={dossierHref}
        className={hubGadget.goldenLink}
        data-testid="brand-dev-w2-hub-dossier-link"
      >
        Досье артикула
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={factoryDossierHref}
        className={hubGadget.goldenLink}
        data-testid="brand-dev-w2-hub-factory-dossier-link"
      >
        Досье цеха
      </Link>
    </div>
  );
}
