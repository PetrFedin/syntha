'use client';

import { useCallback, useEffect, useState } from 'react';
import { readPlatformCoreHubViews } from '@/lib/platform-core-hub-view';

/** Hub «Аудит» ON — показывать investor/honest strips и dev diagnostics. */
export function usePlatformCoreAuditUi(): boolean {
  const read = useCallback(() => readPlatformCoreHubViews().audit, []);

  const [audit, setAudit] = useState(false);

  useEffect(() => {
    setAudit(read());
    const sync = () => setAudit(read());
    window.addEventListener('storage', sync);
    window.addEventListener('platform-core-hub-views', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('platform-core-hub-views', sync);
    };
  }, [read]);

  return audit;
}
