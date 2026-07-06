'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandCoAgentRepCoPeerStrip as Archived } from '@/_archive/platform-core-legacy/components/platform/retail-crm/BrandCoAgentRepCoPeerStrip';

export function BrandCoAgentRepCoPeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
