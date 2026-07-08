'use client';

import { BrandScPublishAuditLog } from '@/components/brand/sample/BrandScPublishAuditLog';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

type Props = {
  collectionId?: string;
  reloadNonce?: number;
  compact?: boolean;
};

/** Wave TN · PG-backed publish audit for SC cabinet + release publish surfaces. */
export function BrandReleasePublishAuditPanel({
  collectionId,
  reloadNonce = 0,
  compact = false,
}: Props) {
  const resolvedCollectionId = collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;

  return (
    <div className={compact ? 'pt-1' : 'space-y-2'} data-testid="brand-release-publish-audit-panel">
      <BrandScPublishAuditLog collectionId={resolvedCollectionId} reloadNonce={reloadNonce} />
    </div>
  );
}
