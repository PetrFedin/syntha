'use client';

import Link from 'next/link';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { buildShopAgentRepSession } from '@/lib/b2b/shop-agent-rep';
import {
  SHOP_AGENT_REP_BRAND_COMMISSION_DISPUTE_LINK,
  shopAgentRepBrandCommissionDisputePeerHref,
} from '@/lib/b2b/shop-agent-rep-wave-ws';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId?: string;
  orderId?: string;
  repId?: string;
};

/** Agent rep · brand CRM + collaborative + replenishment + dispute peers. */
export function ShopAgentRepBrandCoPeerStrip({ collectionId, orderId, repId }: Props) {
  const session = buildShopAgentRepSession({ collectionId, orderId, repId });
  const crmHref = brandCrmSegmentationFeatureHref('segments', session.demoCollectionId);
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', session.demoCollectionId);
  const disputeHref = shopAgentRepBrandCommissionDisputePeerHref({
    collectionId: session.demoCollectionId,
    orderId: session.demoOrderId,
  });

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-agent-rep-brand-co-peer-strip">
      <Link href={crmHref} data-testid="shop-agent-rep-brand-crm-segments-link" className={hubGadget.goldenLink}>
        Brand CRM
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={pricelistHref} data-testid="shop-agent-rep-brand-pricelist-link" className={hubGadget.goldenLink}>
        Прайс-лист
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.collaborativeHref} data-testid="shop-agent-rep-collaborative-link" className={hubGadget.goldenLink}>
        Совместный заказ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.brandLedgerHref} data-testid="shop-agent-rep-brand-ledger-link" className={hubGadget.goldenLink}>
        Brand ledger
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={disputeHref}
        data-testid={SHOP_AGENT_REP_BRAND_COMMISSION_DISPUTE_LINK}
        className={hubGadget.goldenLink}
      >
        Спор по комиссии
      </Link>
    </div>
  );
}
