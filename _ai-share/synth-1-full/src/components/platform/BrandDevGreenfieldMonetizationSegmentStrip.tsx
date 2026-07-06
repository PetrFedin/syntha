'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandDevGreenfieldMonetizationSegmentStrip as Archived } from '@/_archive/platform-core-legacy/components/platform/monetization-mfr/BrandDevGreenfieldMonetizationSegmentStrip';

export function BrandDevGreenfieldMonetizationSegmentStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
