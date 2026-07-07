'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BrandMarketingContentFactoryPage from '@/app/brand/marketing/content-factory/page';
import { RegistryPageHeader } from '@/components/design-system';

/**
 * CMS: на маршруте /brand/cms — редирект в Content Factory (полноэкранно).
 * Во вкладке «Медиа и контент» (/brand/media) тот же модуль рендерится внутри таба без ухода со страницы.
 */
export default function CMSPage() {
  const pathname = usePathname();
  const router = useRouter();
  const isStandaloneCmsRoute = pathname === '/brand/cms';

  useEffect(() => {
    if (isStandaloneCmsRoute) {
      router.replace('/brand/marketing/content-factory');
    }
  }, [isStandaloneCmsRoute, router]);

  if (isStandaloneCmsRoute) {
    return (
      <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
        <RegistryPageHeader title="CMS" leadPlain="Перенаправление в Content Factory…" />
        <div className="text-text-secondary flex min-h-[200px] items-center justify-center text-sm">
          Перенаправление в Content Factory…
        </div>
      </CabinetPageContent>
    );
  }

  return <BrandMarketingContentFactoryPage />;
}
