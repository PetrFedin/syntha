'use client';

import { Badge } from '@/components/ui/badge';
import {
  formatMfrEmptyPublishBadgeRu,
  MFR_EMPTY_SC_PUBLISH_BADGE_TESTID,
  shouldShowMfrEmptyPublishBadge,
} from '@/lib/platform-core-ports/platform/wave-yv-mfr-empty-pillars-final';
// wave-yv-mfr-empty-pillars-final — read-only publish badge (dedupe VS)

type Props = {
  publishedCount: number;
  readyForBuyers?: boolean;
  testId?: string;
};

/** Badge when brand publishes collection to showroom (empty pillar SC). */
export function MfrEmptyPublishStatusBadge({
  publishedCount,
  readyForBuyers = false,
  testId = MFR_EMPTY_SC_PUBLISH_BADGE_TESTID,
}: Props) {
  if (!shouldShowMfrEmptyPublishBadge(publishedCount) && !readyForBuyers) return null;

  const label = formatMfrEmptyPublishBadgeRu(publishedCount);
  if (!label) return null;

  return (
    <Badge variant="secondary" className="text-[10px]" data-testid={testId}>
      {label}
    </Badge>
  );
}
