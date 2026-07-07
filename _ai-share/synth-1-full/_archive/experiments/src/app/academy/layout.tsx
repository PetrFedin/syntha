'use client';

import { Suspense, type ReactNode } from 'react';
import { UserCabinetRouteLayout } from '@/components/layout/client-cabinet-shell';

export default function AcademyLayout({ children }: { children: ReactNode }) {
  return (
    <UserCabinetRouteLayout>
      <Suspense fallback={null}>{children}</Suspense>
    </UserCabinetRouteLayout>
  );
}
