'use client';

import type { ReactNode } from 'react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import { shouldShowPlatformCoreWorkspaceGoldenPathStrips } from '@/lib/platform-core-ports/platform/wave-yt-hub-noise-pass2';

type Props = {
  children: ReactNode;
};

/** Core workspace: golden-path / peer strips только в hub «Аудит» (sidebar заменяет навигацию). */
export function PlatformCoreWorkspaceStripsGate({ children }: Props) {
  const auditUi = usePlatformCoreAuditUi();
  if (isPlatformCoreMode() && !shouldShowPlatformCoreWorkspaceGoldenPathStrips(auditUi)) {
    return null;
  }
  return <>{children}</>;
}
