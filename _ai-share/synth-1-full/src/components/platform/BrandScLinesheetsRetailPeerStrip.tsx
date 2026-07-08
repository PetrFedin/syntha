'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandScLinesheetsRetailPeerStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/retail-crm/BrandScLinesheetsRetailPeerStrip';

export function BrandScLinesheetsRetailPeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
