'use client';

import Link from 'next/link';
import { GitCompareArrows } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  SUP_DEV_COMPARE_SUPPLIERS_P2_CATALOG_LINK_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_MATERIALS_LINK_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_RFQ_LINK_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_STRIP_TESTID,
  supDevCompareSuppliersHrefsForDemo,
  supDevCompareSuppliersP2BadgeRu,
  supDevCompareSuppliersP2LeadRu,
} from '@/lib/fashion/supplier-dev-wave-wk';

type Props = {
  collectionId: string;
  articleId: string;
};

/** Wave UF/VG/WK · сравнение поставщиков по материалам — P2 stub (RU, peer-ссылки). */
export function SupDevCompareSuppliersP2Strip({ collectionId, articleId }: Props) {
  const { catalogHref, materialsHref, rfqHref } = supDevCompareSuppliersHrefsForDemo({
    collectionId,
    demoArticleId: articleId,
    demoOrderId: '',
    factoryId: '',
  });

  return (
    <div
      className="border-border-subtle bg-bg-surface2/40 flex flex-wrap items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs"
      data-testid={SUP_DEV_COMPARE_SUPPLIERS_P2_STRIP_TESTID}
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        {supDevCompareSuppliersP2BadgeRu()}
      </Badge>
      <GitCompareArrows className="text-text-muted h-3.5 w-3.5" aria-hidden />
      <span className="text-text-secondary">{supDevCompareSuppliersP2LeadRu()}</span>
      <Link
        href={materialsHref}
        className="text-accent-primary text-[10px] font-medium hover:underline"
        data-testid={SUP_DEV_COMPARE_SUPPLIERS_P2_MATERIALS_LINK_TESTID}
      >
        Материалы →
      </Link>
      <Link
        href={catalogHref}
        className="text-accent-primary text-[10px] font-medium hover:underline"
        data-testid={SUP_DEV_COMPARE_SUPPLIERS_P2_CATALOG_LINK_TESTID}
      >
        Каталог →
      </Link>
      <Link
        href={rfqHref}
        className="text-accent-primary text-[10px] font-medium hover:underline"
        data-testid={SUP_DEV_COMPARE_SUPPLIERS_P2_RFQ_LINK_TESTID}
      >
        RFQ →
      </Link>
    </div>
  );
}
