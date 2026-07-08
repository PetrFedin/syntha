'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { ShopDevelopmentBridgeGreenfieldCrmStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/retail-crm/ShopDevelopmentBridgeGreenfieldCrmStrip';

export function ShopDevelopmentBridgeGreenfieldCrmStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
