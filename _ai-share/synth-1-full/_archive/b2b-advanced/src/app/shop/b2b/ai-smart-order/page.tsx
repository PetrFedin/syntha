'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bAiSmartOrderLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/ai-smart-order/ai-smart-order-legacy').then(
      (m) => m.ShopB2bAiSmartOrderLegacyPage
    ),
  { ssr: false }
);

export default function AiSmartOrderPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bAiSmartOrder} />;
  }
  return <ShopB2bAiSmartOrderLegacyPage />;
}
