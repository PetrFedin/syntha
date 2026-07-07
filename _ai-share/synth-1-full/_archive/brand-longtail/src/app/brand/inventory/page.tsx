'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

const BrandInventoryCorePage = dynamic(
  () =>
    import('@/app/brand/inventory/brand-inventory-core').then((m) => ({
      default: m.BrandInventoryCorePage,
    })),
  { ssr: false }
);

const BrandInventoryLegacyPage = dynamic(
  () => import('@/app/brand/inventory/brand-inventory-legacy'),
  { ssr: false }
);

export default function BrandInventoryPage() {
  return (
    <Suspense fallback={null}>
      <BrandInventoryRouter />
    </Suspense>
  );
}

function BrandInventoryRouter() {
  const searchParams = useSearchParams();
  const legacy = searchParams.get('legacy') === '1';

  if (isPlatformCoreMode() && !legacy) {
    return <BrandInventoryCorePage />;
  }
  return <BrandInventoryLegacyPage />;
}
