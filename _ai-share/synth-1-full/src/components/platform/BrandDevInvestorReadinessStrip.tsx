'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandDevInvestorReadinessStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/monetization-mfr/BrandDevInvestorReadinessStrip';

export function BrandDevInvestorReadinessStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
