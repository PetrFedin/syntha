'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandCoPackRulesCoPeerStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/monetization-mfr/BrandCoPackRulesCoPeerStrip';

export function BrandCoPackRulesCoPeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
