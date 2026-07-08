'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ROUTES, shopB2bCheckoutCollectionHref } from '@/lib/routes';

function hrefHasCollection(href: string, collectionId: string): boolean {
  try {
    const url = new URL(href, 'http://local');
    return (
      url.searchParams.get('collection') === collectionId ||
      href.includes(`collection=${encodeURIComponent(collectionId)}`)
    );
  } catch {
    return href.includes(collectionId);
  }
}

/** UAT: audit path showroom → shop matrix сохраняет collection и peer CTA. */
export function BrandScCrossRoleAuditUatStrip({
  collectionId,
  publishedCount = 0,
  linesheetHref,
  showroomHref,
  shopShowroomHref,
  shopMatrixHref,
}: {
  collectionId: string;
  publishedCount?: number;
  linesheetHref: string;
  showroomHref: string;
  shopShowroomHref: string;
  shopMatrixHref: string;
}) {
  const shopCheckoutHref = shopB2bCheckoutCollectionHref(collectionId);

  const auditOk = useMemo(() => {
    const hrefs = [linesheetHref, showroomHref, shopShowroomHref, shopMatrixHref, shopCheckoutHref];
    return hrefs.every((href) => hrefHasCollection(href, collectionId));
  }, [
    collectionId,
    linesheetHref,
    showroomHref,
    shopShowroomHref,
    shopMatrixHref,
    shopCheckoutHref,
  ]);

  const matrixReady = publishedCount > 0;

  return (
    <div
      className="border-border-subtle bg-bg-surface2/50 space-y-2 rounded-lg border px-3 py-2"
      data-testid="brand-sc-cross-role-audit-uat"
      data-audit-path-collection-ok={auditOk ? '1' : '0'}
      data-matrix-ready={matrixReady ? '1' : '0'}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-bold uppercase tracking-wide">
          UAT · cross-role audit path
        </span>
        <Badge
          variant="outline"
          className={
            auditOk
              ? 'border-emerald-200 bg-emerald-50 text-[10px] text-emerald-900'
              : 'border-amber-200 bg-amber-50 text-[10px] text-amber-950'
          }
          data-testid="brand-sc-cross-role-audit-uat-status"
        >
          {auditOk ? 'collection в URL ✓' : 'Проверьте collection в ссылках'}
        </Badge>
        {matrixReady ? (
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-50 text-[10px] text-sky-900"
            data-testid="brand-sc-cross-role-audit-uat-matrix-ready"
          >
            {publishedCount} арт. → matrix
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="text-[10px]"
            data-testid="brand-sc-cross-role-audit-uat-matrix-empty"
          >
            Витрина пуста — matrix после publish
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
        <Link
          href={`${ROUTES.brand.launchReadiness}?collection=${encodeURIComponent(collectionId)}`}
          className="text-accent-primary font-medium hover:underline"
          data-testid="brand-sc-cross-role-audit-uat-release-gate-link"
        >
          Release gate →
        </Link>
        <Link
          href={shopMatrixHref}
          className="text-accent-primary font-medium hover:underline"
          data-testid="brand-sc-cross-role-audit-uat-matrix-link"
        >
          Peer · матрица магазина →
        </Link>
        <Link
          href={shopCheckoutHref}
          className="text-accent-primary font-medium hover:underline"
          data-testid="brand-sc-cross-role-audit-uat-checkout-link"
        >
          Peer · checkout →
        </Link>
        <Link
          href={`${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`}
          className="text-accent-primary font-medium hover:underline"
          data-testid="brand-sc-cross-role-audit-uat-shop-showroom-link"
        >
          Peer · showroom магазина →
        </Link>
      </div>
    </div>
  );
}
