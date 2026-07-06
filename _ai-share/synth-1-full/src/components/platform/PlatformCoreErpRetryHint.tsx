'use client';

import {
  formatErpAutoRetryAttemptRu,
  formatErpAutoRetryExhaustedRu,
} from '@/lib/platform-core-ports/erp-retry-hint';
import { useErpRetryCountdown } from '@/hooks/use-erp-retry-countdown';

export function PlatformCoreErpRetryHint({
  erpNextRetryAt,
  erpAutoRetryCount,
  testId = 'platform-core-erp-retry-hint',
  className = 'text-text-muted text-xs',
}: {
  erpNextRetryAt?: string;
  erpAutoRetryCount?: number;
  testId?: string;
  className?: string;
}) {
  const countdown = useErpRetryCountdown(erpNextRetryAt);
  const exhausted = formatErpAutoRetryExhaustedRu(erpAutoRetryCount);
  const attempt = formatErpAutoRetryAttemptRu(erpAutoRetryCount);
  const primary = countdown ?? exhausted;
  if (!primary && !attempt) return null;

  const suffix = attempt && primary ? ` · ${attempt}` : attempt && !primary ? attempt : '';

  return (
    <p className={className} data-testid={testId}>
      {primary}
      {suffix}
    </p>
  );
}
