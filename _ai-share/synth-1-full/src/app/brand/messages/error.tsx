'use client';

import { PlatformCoreSegmentError } from '@/components/platform/PlatformCoreSegmentError';

export default function BrandMessagesSegmentError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PlatformCoreSegmentError
      {...props}
      role="brand"
      defaultPillar="comms"
      title="Ошибка сообщений бренда"
    />
  );
}
