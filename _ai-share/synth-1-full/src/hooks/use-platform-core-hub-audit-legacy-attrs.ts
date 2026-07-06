'use client';

import { useCallback } from 'react';
import { platformCoreHubAuditLegacyAttrs } from '@/lib/platform/wave-yt-hub-noise-pass2';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';

/** Returns spreadable audit-legacy attrs gated by hub «Аудит». */
export function usePlatformCoreHubAuditLegacyAttrs() {
  const auditUi = usePlatformCoreAuditUi();
  return useCallback(
    (legacy?: string) => platformCoreHubAuditLegacyAttrs(legacy, auditUi),
    [auditUi]
  );
}
