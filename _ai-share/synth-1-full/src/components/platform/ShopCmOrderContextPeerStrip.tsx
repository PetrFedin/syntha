'use client';

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
  orderId: string;
};

/** Чат по заказу магазина · реестр, матрица, оформление, трекинг. */
export function ShopCmOrderContextPeerStrip({ collectionId, orderId }: Props) {
  const session = buildShopOrderCommsSession({ collectionId, orderId });
  const checkoutHref = shopB2bCheckoutCollectionHref(collectionId);

  const links: PlatformCoreSpinePeerLink[] = [
    {
      href: shopB2bOrdersCollectionRegistryHref(orderId),
      label: 'Реестр',
      testId: 'shop-cm-order-registry-link',
    },
    { href: session.matrixHref, label: 'Матрица', testId: 'shop-cm-order-matrix-link' },
    { href: checkoutHref, label: 'Оформление', testId: 'shop-cm-order-checkout-link' },
    {
      href: session.brandOrderHandoffHref,
      label: 'Передача бренда',
      testId: 'shop-cm-order-brand-handoff-link',
    },
    { href: session.trackingHref, label: 'Трекинг', testId: 'shop-cm-order-tracking-link' },
    {
      href: session.collaborativeHref,
      label: 'Согласования',
      testId: 'shop-cm-order-collaborative-link',
    },
  ];

  return <PlatformCoreSpinePeerStripShell testId="shop-cm-order-context-strip" links={links} />;
}
