'use client';

import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import {
  PlatformCoreSpinePeerStripShell,
  type PlatformCoreSpinePeerLink,
} from '@/components/platform/shared/PlatformCoreSpinePeerStripShell';

type Props = {
  collectionId: string;
  orderId: string;
};

/** Brand order chat · CO spine + shop monetization + CRM peers. */
export function BrandCmOrderContextPeerStrip({ collectionId, orderId }: Props) {
  const session = buildBrandOrderCommsSession({ collectionId, orderId });
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);

  const links: PlatformCoreSpinePeerLink[] = [
    { href: session.registryHref, label: 'Реестр', testId: 'brand-cm-order-registry-link' },
    { href: session.handoffHref, label: 'Передача', testId: 'brand-cm-order-handoff-link' },
    {
      href: session.shopMatrixHref,
      label: 'Матрица магазина',
      testId: 'brand-cm-order-shop-matrix-link',
    },
    {
      href: session.shopCheckoutHref,
      label: 'Оформление',
      testId: 'brand-cm-order-shop-checkout-link',
    },
    {
      href: session.shopTrackingHref,
      label: 'Трекинг магазина',
      testId: 'brand-cm-order-shop-tracking-link',
    },
    { href: session.calendarHref, label: 'Календарь', testId: 'brand-cm-order-calendar-link' },
    { href: crmHref, label: 'Сегменты CRM', testId: 'brand-cm-order-crm-segments-link' },
    { href: pricelistHref, label: 'Прайс-лист', testId: 'brand-cm-order-crm-pricelist-link' },
    {
      href: session.productionOpsHref,
      label: 'Операции цеха',
      testId: 'brand-cm-order-production-ops-link',
    },
  ];

  return <PlatformCoreSpinePeerStripShell testId="brand-cm-order-context-strip" links={links} />;
}
