'use client';

import dynamic from 'next/dynamic';

const OrderProductionPillarCardBrand = dynamic(
  () =>
    import('@/components/platform/pillars/OrderProductionPillarCardBrand').then((m) => ({
      default: m.OrderProductionPillarCardBrand,
    })),
  { ssr: false }
);

const OrderProductionPillarCardManufacturer = dynamic(
  () =>
    import('@/components/platform/pillars/OrderProductionPillarCardManufacturer').then((m) => ({
      default: m.OrderProductionPillarCardManufacturer,
    })),
  { ssr: false }
);

type Props = {
  variant: 'brand' | 'manufacturer';
  compact?: boolean;
  minimalChrome?: boolean;
};

/** Роутер: baseline brand vs extended manufacturer chunks. */
export function OrderProductionPillarCard({
  variant,
  compact = false,
  minimalChrome = false,
}: Props) {
  if (variant === 'manufacturer') {
    return (
      <OrderProductionPillarCardManufacturer
        variant="manufacturer"
        compact={compact}
        minimalChrome={minimalChrome}
      />
    );
  }
  return (
    <OrderProductionPillarCardBrand compact={compact} minimalChrome={minimalChrome} />
  );
}
