'use client';

import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { BrandCoRegistryRetailOnboardingStrip as Archived } from '@/components/platform/shared/legacy-peer-strips/retail-crm/BrandCoRegistryRetailOnboardingStrip';

export function BrandCoRegistryRetailOnboardingStrip(props: Parameters<typeof Archived>[0]) {
  if (isPlatformCoreArticleSpineMode()) return null;
  return <Archived {...props} />;
}
