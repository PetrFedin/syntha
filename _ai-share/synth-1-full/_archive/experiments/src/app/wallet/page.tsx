'use client';

import { SynthaWallet } from '@/components/fintech/SynthaWallet';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';

export default function WalletPage() {
  return (
    <div className="w-full space-y-4 py-2">
      <ClientCabinetSectionHeader showBack={false} />
      <SynthaWallet />
    </div>
  );
}
