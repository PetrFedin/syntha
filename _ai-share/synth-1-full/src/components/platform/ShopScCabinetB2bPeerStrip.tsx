'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { ShopScCabinetB2bPeerStrip as Archived } from '@/_archive/platform-core-legacy/components/platform/monetization-mfr/ShopScCabinetB2bPeerStrip';

export function ShopScCabinetB2bPeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
