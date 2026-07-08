'use client';

import { ClientCabinetShell } from '@/components/layout/client-cabinet-shell';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <ClientCabinetShell>{children}</ClientCabinetShell>;
}
