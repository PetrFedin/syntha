'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandScLinesheetsRetailPeerStrip as Archived } from '@/_archive/platform-core-legacy/components/platform/retail-crm/BrandScLinesheetsRetailPeerStrip';

export function BrandScLinesheetsRetailPeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
