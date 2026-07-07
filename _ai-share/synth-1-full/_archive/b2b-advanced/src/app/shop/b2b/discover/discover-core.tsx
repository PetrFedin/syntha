'use client';

import { ROUTES } from '@/lib/routes';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';

export function ShopB2bDiscoverCorePage() {
  return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bDiscover} />;
}
