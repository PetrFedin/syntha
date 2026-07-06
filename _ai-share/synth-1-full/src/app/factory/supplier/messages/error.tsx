'use client';

import { PlatformCoreSegmentError } from '@/components/platform/PlatformCoreSegmentError';

export default function SupplierMessagesSegmentError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PlatformCoreSegmentError
      {...props}
      role="supplier"
      defaultPillar="comms"
      title="Ошибка сообщений поставщика"
    />
  );
}
