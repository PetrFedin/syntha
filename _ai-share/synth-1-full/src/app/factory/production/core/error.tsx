'use client';

import { PlatformCoreSegmentError } from '@/components/platform/PlatformCoreSegmentError';

export default function FactoryProductionCoreCabinetSegmentError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PlatformCoreSegmentError
      {...props}
      role="manufacturer"
      defaultPillar="order_production"
      title="Ошибка кабинета производства"
    />
  );
}
