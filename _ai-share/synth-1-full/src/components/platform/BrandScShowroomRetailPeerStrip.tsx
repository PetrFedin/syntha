'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandScShowroomRetailPeerStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/retail-crm/BrandScShowroomRetailPeerStrip';

export function BrandScShowroomRetailPeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
