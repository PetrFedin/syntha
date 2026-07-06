'use client';

import { PlatformCoreSegmentError } from '@/components/platform/PlatformCoreSegmentError';

export default function FactorySupplierSegmentError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PlatformCoreSegmentError
      {...props}
      role="supplier"
      defaultPillar="development"
      title="Ошибка раздела поставщика"
    />
  );
}
