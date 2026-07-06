'use client';

import { useEffect, useState } from 'react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { usePlatformCoreCommsNotificationPrefsPoll } from '@/hooks/use-platform-core-comms-notification-prefs-poll';
import {
  DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS,
  loadPlatformCoreCommsNotificationPrefs,
  type PlatformCoreCommsNotificationRole,
} from '@/lib/platform-core-comms-notification-prefs';

/** PG prefs chainStatusPush — gate для SSE/poll chain-status на hub/pillar cards. */
export function usePlatformCoreChainStatusPushEnabled(
  role: PlatformCoreCommsNotificationRole,
  scopeKey?: string
): boolean {
  const coreMode = isPlatformCoreMode();
  const { tick: prefsTick } = usePlatformCoreCommsNotificationPrefsPoll(coreMode, role);
  const [enabled, setEnabled] = useState(
    () => DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS.chainStatusPush
  );

  useEffect(() => {
    if (!coreMode) {
      setEnabled(true);
      return;
    }
    let cancelled = false;
    void loadPlatformCoreCommsNotificationPrefs({ role, scopeKey }).then(({ prefs }) => {
      if (!cancelled) setEnabled(prefs.chainStatusPush);
    });
    return () => {
      cancelled = true;
    };
  }, [coreMode, prefsTick, role, scopeKey]);

  return enabled;
}
