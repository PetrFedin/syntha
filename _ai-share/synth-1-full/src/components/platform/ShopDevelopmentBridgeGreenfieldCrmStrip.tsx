'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { ShopDevelopmentBridgeGreenfieldCrmStrip as Archived } from '@/_archive/platform-core-legacy/components/platform/retail-crm/ShopDevelopmentBridgeGreenfieldCrmStrip';

export function ShopDevelopmentBridgeGreenfieldCrmStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
