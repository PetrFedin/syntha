'use client';

import Link from 'next/link';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import {
  factoryMaterialsCatalogHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix';
import {
  factorySupplierMessagesWorkshop2ArticleContextHref,
  ROUTES,
} from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
};

/** Supplier dev cabinet · BOM + RFQ + CRM spine peers. */
export function SupplierDevCabinetSpinePeerStrip({ collectionId, articleId, orderId }: Props) {
  const demo = { collectionId, demoArticleId: articleId, demoOrderId: orderId ?? '' };
  const materialsHref = factoryMaterialsHrefForDemo(demo);
  const catalogHref = factoryMaterialsCatalogHrefForDemo(demo);
  const procurementHref = factoryMaterialsProcurementHrefForDemo(demo, { role: 'supplier' });
  const commsHref = factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId);
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);
  const rfqHref = `${ROUTES.brand.suppliersRfq}?collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`;

  return (
    <div className={hubGadget.goldenPath} data-testid="sup-dev-cabinet-spine-peer-strip">
      <Link href={materialsHref} data-testid="sup-dev-cabinet-materials-link" className={hubGadget.goldenLink}>
        BOM
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={catalogHref} data-testid="sup-dev-cabinet-catalog-link" className={hubGadget.goldenLink}>
        Каталог
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={materialsHref}
        data-testid="sup-dev-cabinet-alt-materials-link"
        className={hubGadget.goldenLink}
      >
        Альтернативы
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={procurementHref} data-testid="sup-dev-cabinet-procurement-link" className={hubGadget.goldenLink}>
        Закупка
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={rfqHref} data-testid="sup-dev-cabinet-rfq-link" className={hubGadget.goldenLink}>
        RFQ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={commsHref} data-testid="sup-dev-cabinet-comms-link" className={hubGadget.goldenLink}>
        Чат
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={crmHref} data-testid="sup-dev-cabinet-crm-link" className={hubGadget.goldenLink}>
        CRM бренда
      </Link>
    </div>
  );
}
