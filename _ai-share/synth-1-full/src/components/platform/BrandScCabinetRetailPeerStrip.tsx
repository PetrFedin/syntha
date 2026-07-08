'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandScCabinetRetailPeerStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/retail-crm/BrandScCabinetRetailPeerStrip';

export function BrandScCabinetRetailPeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
