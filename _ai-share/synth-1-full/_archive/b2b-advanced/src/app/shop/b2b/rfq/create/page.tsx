'use client';

import { ROUTES } from '@/lib/routes';
import { withShopB2bCoreLegacyGuard } from '@/app/shop/b2b/shop-b2b-core-legacy-guard';

function RfqCreateRedirectContent() {
  return null;
}

export default withShopB2bCoreLegacyGuard(ROUTES.shop.b2bRfqCreate, RfqCreateRedirectContent);
