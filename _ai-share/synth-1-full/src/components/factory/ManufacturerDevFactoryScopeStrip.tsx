'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  ROUTES,
  factoryProductionDossierHref,
} from '@/lib/routes';
import { WORKSHOP2_COL_PARAM } from '@/lib/production/workshop2-url';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { factorySampleQueueDeepHref } from '@/lib/platform/wave-xc-mfr-sample-status-patch';

type Props = {
  collectionId: string;
  articleId: string;
  factoryId?: string;
};

/** Mfr dev status — factory-scoped filter honesty + brand W2 read-only peer. */
export function ManufacturerDevFactoryScopeStrip({
  collectionId,
  articleId,
  factoryId,
}: Props) {
  const brandW2Href = `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`;
  const dossierHref = factoryProductionDossierHref(articleId, { collectionId });

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-indigo-50/40 px-3 py-2 text-xs"
      data-testid="mfr-dev-factory-scope-strip"
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        Factory scope
      </Badge>
      <span className="text-text-secondary">
        Только артикулы цеха{factoryId ? ` · ${factoryId}` : ''} — brand-only steps скрыты.
      </span>
      <Link
        href={brandW2Href}
        data-testid="mfr-dev-factory-scope-brand-w2-link"
        className={hubGadget.goldenLink}
      >
        ТЗ бренда
      </Link>
      <Link
        href={dossierHref}
        data-testid="mfr-dev-factory-scope-dossier-link"
        className={hubGadget.goldenLink}
      >
        Досье
      </Link>
      <Link
        href={factorySampleQueueDeepHref({ collectionId, articleId, factoryId })}
        data-testid="mfr-dev-factory-scope-sample-queue-link"
        className={hubGadget.goldenLink}
      >
        Очередь образцов
      </Link>
    </div>
  );
}
