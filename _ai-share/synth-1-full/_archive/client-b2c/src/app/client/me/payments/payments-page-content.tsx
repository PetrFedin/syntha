'use client';

import Link from 'next/link';
import { RegistryPageHeader } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { PaymentMethods } from '@/components/user/payment-methods';
import { LoyaltyStatus } from '@/components/user/loyalty-status';
import { ROUTES } from '@/lib/routes';

export function PaymentsPageContent() {
  return (
    <div className="space-y-4">
      <RegistryPageHeader
        title="Оплата и бонусы"
        leadPlain="Способы оплаты и бонусный счёт в одном операционном экране."
        actions={
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href={ROUTES.client.profileWithTab('profile')}>К профилю</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PaymentMethods />
        </div>
        <div className="lg:col-span-1">
          <LoyaltyStatus />
        </div>
      </div>
    </div>
  );
}
