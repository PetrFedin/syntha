'use client';

import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildShopOrderCommsSession } from '@/lib/platform-core-ports/b2b/shop-order-comms';
import {
  shopB2bCheckoutCollectionHref,
  shopB2bOrdersCollectionRegistryHref,
} from '@/lib/platform-core-routes';
import {
  PlatformCoreSpinePeerStripShell,
  type PlatformCoreSpinePeerLink,
} from '@/components/platform/shared/PlatformCoreSpinePeerStripShell';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Shop comms cabinet · registry + matrix + brand peers. */
export function ShopCmCabinetSpinePeerStrip({ collectionId, orderId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const session = buildShopOrderCommsSession({
    collectionId,
    orderId: resolvedOrderId || undefined,
  });
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);
  const checkoutHref = shopB2bCheckoutCollectionHref(collectionId);

  const links: PlatformCoreSpinePeerLink[] = [];
  if (resolvedOrderId) {
    links.push(
      {
        href: shopB2bOrdersCollectionRegistryHref(resolvedOrderId),
        label: 'Реестр',
        testId: 'shop-cm-cabinet-registry-link',
      },
      {
        href: session.trackingHref,
        label: 'Трекинг',
        testId: 'shop-cm-cabinet-tracking-link',
      }
    );
  }
  links.push(
    {
      href: session.matrixHref,
      label: 'Матрица',
      testId: 'shop-cm-cabinet-matrix-link',
    },
    {
      href: checkoutHref,
      label: 'Оформление',
      testId: 'shop-cm-cabinet-checkout-link',
    },
    {
      href: pricelistHref,
      label: 'Прайс-лист бренда',
      testId: 'shop-cm-cabinet-brand-pricelist-link',
    },
    {
      href: session.replenishmentAtpHref,
      label: 'ATP',
      testId: 'shop-cm-cabinet-replenishment-link',
    }
  );
  if (resolvedOrderId) {
    links.push({
      href: session.brandOrderChatHref,
      label: 'Чат бренда',
      testId: 'shop-cm-cabinet-brand-chat-link',
    });
  }

  return (
    <PlatformCoreSpinePeerStripShell testId="shop-cm-cabinet-spine-peer-strip" links={links} />
  );
}
