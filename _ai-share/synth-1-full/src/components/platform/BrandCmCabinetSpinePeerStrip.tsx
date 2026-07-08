'use client';

import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import {
  PlatformCoreSpinePeerStripShell,
  type PlatformCoreSpinePeerLink,
} from '@/components/platform/shared/PlatformCoreSpinePeerStripShell';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Brand comms cabinet · CO registry + shop monetization + CRM peers. */
export function BrandCmCabinetSpinePeerStrip({ collectionId, orderId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const session = buildBrandOrderCommsSession({
    collectionId,
    orderId: resolvedOrderId || undefined,
  });
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);

  const links: PlatformCoreSpinePeerLink[] = [];
  if (resolvedOrderId) {
    links.push(
      {
        href: session.registryHref,
        label: 'Реестр',
        testId: 'brand-cm-cabinet-registry-link',
      },
      {
        href: session.handoffHref,
        label: 'Передача',
        testId: 'brand-cm-cabinet-handoff-link',
      }
    );
  }
  links.push(
    {
      href: session.shopMatrixHref,
      label: 'Матрица магазина',
      testId: 'brand-cm-cabinet-shop-matrix-link',
    },
    {
      href: session.shopCheckoutHref,
      label: 'Оформление',
      testId: 'brand-cm-cabinet-shop-checkout-link',
    },
    {
      href: crmHref,
      label: 'Сегменты CRM',
      testId: 'brand-cm-cabinet-crm-segments-link',
    },
    {
      href: pricelistHref,
      label: 'Прайс-лист',
      testId: 'brand-cm-cabinet-crm-pricelist-link',
    }
  );
  if (resolvedOrderId) {
    links.push({
      href: session.replenishmentAtpHref,
      label: 'Пополнение',
      testId: 'brand-cm-cabinet-replenishment-link',
    });
  }

  return (
    <PlatformCoreSpinePeerStripShell testId="brand-cm-cabinet-spine-peer-strip" links={links} />
  );
}
