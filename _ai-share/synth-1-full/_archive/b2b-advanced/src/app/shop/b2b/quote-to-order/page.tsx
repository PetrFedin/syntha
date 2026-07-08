'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bQuoteToOrderLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/quote-to-order/quote-to-order-legacy').then(
      (m) => m.ShopB2bQuoteToOrderLegacyPage
    ),
  { ssr: false }
);

export default function QuoteToOrderPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bQuoteToOrder} />;
  }
  return <ShopB2bQuoteToOrderLegacyPage />;
}
