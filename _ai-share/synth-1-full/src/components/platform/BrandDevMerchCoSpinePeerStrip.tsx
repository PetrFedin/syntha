'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandDevMerchCoSpinePeerStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/retail-crm/BrandDevMerchCoSpinePeerStrip';

export function BrandDevMerchCoSpinePeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
