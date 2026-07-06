'use client';

import { PlatformCoreSegmentError } from '@/components/platform/PlatformCoreSegmentError';

export default function BrandCoreCabinetSegmentError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PlatformCoreSegmentError
      {...props}
      role="brand"
      defaultPillar="development"
      title="Ошибка кабинета бренда"
    />
  );
}
