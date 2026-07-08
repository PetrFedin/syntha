'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandOpHandoffCoSpinePeerStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/monetization-mfr/BrandOpHandoffCoSpinePeerStrip';

export function BrandOpHandoffCoSpinePeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
