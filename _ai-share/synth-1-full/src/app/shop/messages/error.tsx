'use client';

import { PlatformCoreSegmentError } from '@/components/platform/PlatformCoreSegmentError';

export default function ShopMessagesSegmentError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PlatformCoreSegmentError
      {...props}
      role="shop"
      defaultPillar="comms"
      title="Ошибка сообщений магазина"
    />
  );
}
