'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { factoryProductionDossierHref, brandB2bOrderChainContextHref } from '@/lib/routes';
import { shouldMountBrandDossierFactoryDiffLegacyStrip } from '@/lib/platform/wave-yl-brand-dossier-diff-viewer';

type Props = {
  collectionId: string;
  articleId: string;
  productionOrderId?: string;
};

/** @deprecated Wave TO compact strip — superseded by `BrandDossierFactoryDiffPanel` (wave UN/YL). */
export function BrandDossierFactoryDiffStrip({
  collectionId,
  articleId,
  productionOrderId,
}: Props) {
  if (!shouldMountBrandDossierFactoryDiffLegacyStrip()) {
    return null;
  }
  const factoryHref = factoryProductionDossierHref(articleId, { collectionId });

  return (
    <div
      className="border-border-subtle bg-bg-surface2/50 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid="brand-dossier-factory-diff-strip"
    >
      <Badge variant="outline" className="text-[9px]">
        TZ vs цех
      </Badge>
      <span className="text-text-secondary">Read-only diff · side-by-side stub</span>
      <Link
        href={factoryHref}
        className={hubGadget.goldenLink}
        data-testid="brand-dossier-factory-diff-factory-link"
      >
        Досье цеха
      </Link>
      {productionOrderId ? (
        <Link
          href={brandB2bOrderChainContextHref(productionOrderId)}
          className={hubGadget.goldenLink}
          data-testid="brand-op-attach-tz-po-link"
        >
          TZ → PO
        </Link>
      ) : null}
    </div>
  );
}
