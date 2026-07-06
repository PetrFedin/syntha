'use client';

import { Badge } from '@/components/ui/badge';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  formatPublishedReadPathBadgeTitleRu,
  formatPublishedReadPathBadgeRu,
} from '@/lib/platform-core-ports/platform/wave-ze-hub-diagnostics-ru';
import { resolveBrandScPublishedArticlesReadPath } from '@/lib/platform-core-ports/b2b/brand-sc-cross-matrix';
import { brandScPublishedReadpathBadgeTestId } from '@/lib/platform-core-ports/b2b/brand-sc-linesheet-readpath';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  className?: string;
};

/** Честный бейдж источника опубликованных артикулов на SC surfaces. */
export function PlatformCorePublishedArticlesReadPathBadge({
  collectionId,
  className,
}: Props) {
  if (!isPlatformCoreMode()) return null;

  const readPath = resolveBrandScPublishedArticlesReadPath(collectionId);
  const isApi = readPath === 'api';

  return (
    <Badge
      variant="outline"
      className={cn(
        hubGadget.chip,
        isApi
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border-amber-200 bg-amber-50 text-amber-900',
        className
      )}
      data-testid={brandScPublishedReadpathBadgeTestId(readPath)}
      data-audit-legacy={isApi ? 'brand-sc-published-read-path-api' : undefined}
      title={formatPublishedReadPathBadgeTitleRu(readPath)}
    >
      {formatPublishedReadPathBadgeRu(readPath)}
    </Badge>
  );
}
