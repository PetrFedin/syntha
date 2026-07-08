'use client';

import dynamic from 'next/dynamic';

const CommsPillarCardBaseline = dynamic(
  () =>
    import('@/components/platform/pillars/CommsPillarCardBaseline').then((m) => ({
      default: m.CommsPillarCardBaseline,
    })),
  { ssr: false }
);

const CommsPillarCardExtended = dynamic(
  () =>
    import('@/components/platform/pillars/CommsPillarCardExtended').then((m) => ({
      default: m.CommsPillarCardExtended,
    })),
  { ssr: false }
);

type Props = {
  variant: 'brand' | 'shop' | 'manufacturer' | 'supplier';
  compact?: boolean;
  minimalChrome?: boolean;
};

/** Роутер: brand/shop baseline vs manufacturer/supplier extended chunks. */
export function CommsPillarCard({ variant, compact = false, minimalChrome = false }: Props) {
  if (variant === 'manufacturer' || variant === 'supplier') {
    return (
      <CommsPillarCardExtended variant={variant} compact={compact} minimalChrome={minimalChrome} />
    );
  }
  return (
    <CommsPillarCardBaseline variant={variant} compact={compact} minimalChrome={minimalChrome} />
  );
}
