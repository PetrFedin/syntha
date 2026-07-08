'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandDevInvestorReadinessPeerStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/monetization-mfr/BrandDevInvestorReadinessPeerStrip';

export function BrandDevInvestorReadinessPeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
