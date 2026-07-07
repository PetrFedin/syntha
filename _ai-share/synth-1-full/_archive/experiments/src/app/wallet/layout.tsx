'use client';

import { UserCabinetRouteLayout } from '@/components/layout/client-cabinet-shell';

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return <UserCabinetRouteLayout>{children}</UserCabinetRouteLayout>;
}
