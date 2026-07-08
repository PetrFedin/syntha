'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandCoAgentRepCoPeerStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/retail-crm/BrandCoAgentRepCoPeerStrip';

export function BrandCoAgentRepCoPeerStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
