'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bPaymentLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/payment/payment-legacy').then(
      (m) => m.ShopB2bPaymentLegacyPage
    ),
  { ssr: false }
);

export default function B2BPaymentPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bPayment} />;
  }
  return <ShopB2bPaymentLegacyPage />;
}
