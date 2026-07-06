'use client';

import Link from 'next/link';
import { ROUTES, shopB2bCheckoutCollectionHref } from '@/lib/routes';

import {
  WAVE_WZ_BRAND_SC_GOLDEN_PATH_RELEASE_GATE_RU,
} from '@/lib/platform/wave-wz-ru-noise-dedup-final';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

export type BrandScGoldenPathOmitStep = 'linesheets' | 'showroom';

/** Единая цепочка sample_collection — без ссылки на текущий экран. */
export function BrandScCabinetGoldenPathStrip({
  collectionId,
  testIdVariant = 'cabinet',
  omitStep,
  /** Wave YR/UE: plain «Матрица» скрыта — mini-matrix / open-shop prefill CTA primary. */
  omitMatrixPrefillCta = false,
}: {
  collectionId: string;
  /** legacy testids на странице лайншитов (e2e core-02/06). */
  testIdVariant?: 'cabinet' | 'linesheets';
  /** Скрыть шаг, на котором уже находится пользователь. */
  omitStep?: BrandScGoldenPathOmitStep;
  omitMatrixPrefillCta?: boolean;
}) {
  const linesheetHref = `/brand/linesheets?collection=${encodeURIComponent(collectionId)}`;
  const releaseGateHref = `${ROUTES.brand.launchReadiness}?collection=${encodeURIComponent(collectionId)}`;
  const showroomHref = `${ROUTES.brand.showroom}?collection=${encodeURIComponent(collectionId)}`;
  const shopShowroomHref = `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`;
  const shopMatrixHref = `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`;

  const parts: Array<{ key: string; href: string; label: string; testId: string; legacy?: string }> = [];

  if (omitStep !== 'linesheets') {
    parts.push({
      key: 'linesheets',
      href: linesheetHref,
      label: 'Лайншиты',
      testId: 'brand-sc-audit-path-linesheet',
    });
  }
  if (omitStep !== 'showroom') {
    parts.push({
      key: 'showroom',
      href: showroomHref,
      label: 'Витрина',
      testId: 'brand-sc-audit-path-showroom',
    });
  }
  parts.push(
    {
      key: 'release-gate',
      href: releaseGateHref,
      label: WAVE_WZ_BRAND_SC_GOLDEN_PATH_RELEASE_GATE_RU,
      testId: 'brand-sc-audit-path-release-gate',
    },
    {
      key: 'shop',
      href: shopShowroomHref,
      label: 'Витрина магазина',
      testId: 'brand-sc-audit-path-shop-showroom',
    },
    ...(omitMatrixPrefillCta
      ? []
      : [
          {
            key: 'matrix',
            href: shopMatrixHref,
            label: 'Матрица',
            testId:
              testIdVariant === 'linesheets'
                ? 'brand-sc-linesheets-shop-matrix-link'
                : 'brand-sc-audit-path-shop-matrix',
            legacy: 'brand-sc-cross-matrix-shop-matrix-link',
          },
        ]),
    {
      key: 'checkout',
      href: shopB2bCheckoutCollectionHref(collectionId),
      label: 'Оформление',
      testId:
        testIdVariant === 'linesheets'
          ? 'brand-sc-linesheets-shop-checkout-link'
          : 'brand-sc-golden-path-shop-checkout',
      legacy: 'brand-sc-cross-matrix-shop-checkout-link',
    }
  );

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid="brand-sc-unified-audit-path"
      data-audit-legacy="brand-sc-cabinet-golden-path"
    >
      {parts.map((part, index) => (
        <span key={part.key} className="inline-flex items-center gap-1.5">
          {index > 0 ? <span className={hubGadget.goldenSep}>→</span> : null}
          <Link
            href={part.href}
            className={hubGadget.goldenLink}
            data-testid={part.testId}
            {...(part.legacy ? { 'data-audit-legacy': part.legacy } : {})}
          >
            {part.label}
          </Link>
        </span>
      ))}
    </div>
  );
}
