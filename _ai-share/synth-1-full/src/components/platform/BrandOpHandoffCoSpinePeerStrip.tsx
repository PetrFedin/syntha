'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandOpHandoffCoSpinePeerStrip as Archived } from '@/_archive/platform-core-legacy/components/platform/monetization-mfr/BrandOpHandoffCoSpinePeerStrip';

export function BrandOpHandoffCoSpinePeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
