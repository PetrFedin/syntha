'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { ROUTES, brandDevelopmentCabinetHref } from '@/lib/platform-core-routes';
import { getPlatformCoreCollectionLabel } from '@/lib/platform-core-hub-matrix';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

type Props = {
  collectionId: string;
  /** cabinet | w2-hub — один testid, разный layout не нужен */
  variant?: 'cabinet' | 'w2-hub';
};

/** EMPTY27 / пустая цепочка: один путь старта без лишних CTA. */
export function BrandDevEmptyChainOnboarding({ collectionId, variant = 'cabinet' }: Props) {
  const rangeHref = platformCoreUiHref(
    `${ROUTES.brand.rangePlanner}?collection=${encodeURIComponent(collectionId)}`
  );
  const createHref = brandDevelopmentCabinetHref(collectionId, undefined, { create: true });
  const ss27W2Href = brandDevelopmentCabinetHref('SS27');
  const ss27RangeHref = platformCoreUiHref(`${ROUTES.brand.rangePlanner}?collection=SS27`);

  return (
    <div
      className={
        variant === 'w2-hub'
          ? 'rounded-lg border border-amber-200/80 bg-amber-50/40 p-2.5'
          : hubGadget.pillarCard + ' ' + hubGadget.pillarBody
      }
      data-testid="brand-dev-empty-onboarding"
      data-audit-section="brand-dev-empty-chain"
    >
      <p className="text-text-primary text-[11px] font-medium">
        {getPlatformCoreCollectionLabel(collectionId)} — нет артикулов
      </p>
      <p className={hubGadget.muted}>Создайте SKU или откройте golden SS27</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm" variant="default" className="h-7 text-[10px] font-semibold">
          <Link href={createHref} data-testid="brand-dev-empty-create-sku-link">
            + SKU
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="h-7 text-[10px] font-semibold">
          <Link href={rangeHref} data-testid="brand-dev-empty-range-link">
            План
          </Link>
        </Button>
        <span className={hubGadget.muted}>
          <Link
            href={ss27W2Href}
            data-testid="brand-dev-empty-ss27-w2-link"
            className={hubGadget.ctaLink}
          >
            SS27 W2
          </Link>
          <span className={hubGadget.goldenSep}> · </span>
          <Link
            href={ss27RangeHref}
            data-testid="brand-dev-empty-ss27-range-link"
            className={hubGadget.ctaLink}
          >
            SS27 план
          </Link>
        </span>
      </div>
    </div>
  );
}
