'use client';

import Link from 'next/link';
import { brandDevelopmentArticleHref } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
};

/** W2 hub · read-only investor brief — closes brand-dev-w2-hub investor gap. */
export function BrandDevW2HubInvestorSummaryStrip({ collectionId, articleId }: Props) {
  const href = brandDevelopmentArticleHref(collectionId, articleId, { section: 'overview' });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-dev-w2-hub-investor-summary-strip">
      <Link
        href={href}
        data-testid="brand-dev-w2-hub-investor-summary-link"
        className={hubGadget.goldenLink}
      >
        Сводка для инвестора
      </Link>
    </div>
  );
}
