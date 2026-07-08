'use client';

import dynamic from 'next/dynamic';

const DevelopmentPillarCardBrand = dynamic(
  () =>
    import('@/components/platform/pillars/DevelopmentPillarCardBrand').then((m) => ({
      default: m.DevelopmentPillarCardBrand,
    })),
  { ssr: false }
);

const DevelopmentPillarCardManufacturer = dynamic(
  () =>
    import('@/components/platform/pillars/DevelopmentPillarCardManufacturer').then((m) => ({
      default: m.DevelopmentPillarCardManufacturer,
    })),
  { ssr: false }
);

type Props = {
  collectionId?: string;
  variant?: 'brand' | 'manufacturer';
  compact?: boolean;
  minimalChrome?: boolean;
};

/** Роутер: baseline brand и extended manufacturer — отдельные webpack chunks. */
export function DevelopmentPillarCard({
  collectionId,
  variant = 'brand',
  compact = false,
  minimalChrome = false,
}: Props) {
  if (variant === 'manufacturer') {
    return (
      <DevelopmentPillarCardManufacturer
        collectionId={collectionId}
        variant="manufacturer"
        compact={compact}
        minimalChrome={minimalChrome}
      />
    );
  }
  return (
    <DevelopmentPillarCardBrand
      collectionId={collectionId}
      compact={compact}
      minimalChrome={minimalChrome}
    />
  );
}
