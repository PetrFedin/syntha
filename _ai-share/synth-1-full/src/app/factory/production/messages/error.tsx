'use client';

import { PlatformCoreSegmentError } from '@/components/platform/PlatformCoreSegmentError';

export default function FactoryMessagesSegmentError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PlatformCoreSegmentError
      {...props}
      role="manufacturer"
      defaultPillar="comms"
      title="Ошибка сообщений производства"
    />
  );
}
