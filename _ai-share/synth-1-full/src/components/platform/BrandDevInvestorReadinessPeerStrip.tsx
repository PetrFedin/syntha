'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandDevInvestorReadinessPeerStrip as Archived } from '@/_archive/platform-core-legacy/components/platform/monetization-mfr/BrandDevInvestorReadinessPeerStrip';

export function BrandDevInvestorReadinessPeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
