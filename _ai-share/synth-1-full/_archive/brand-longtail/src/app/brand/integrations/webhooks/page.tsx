'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { getIntegrationsLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { BrandIntegrationsSpineInboundPanel } from '@/components/integrations/BrandIntegrationsSpineInboundPanel';

export default function WebhooksPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      <SectionInfoCard
        title="Webhooks & API"
        description="Inbound-события B2B-каналов и статус коннекторов. Импорт заказов и отслеживание отгрузок в оптовый реестр и столпы 3–4."
        icon={Zap}
        iconBg="bg-accent-primary/15"
        iconColor="text-accent-primary"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              B2B inbound
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              Коннекторы
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.b2bOrders}>Оптовый реестр</Link>
            </Button>
          </>
        }
      />
      <h1 className="text-2xl font-bold uppercase">Webhooks & API</h1>
      <BrandIntegrationsSpineInboundPanel />
      <RelatedModulesBlock links={getIntegrationsLinks()} />
    </CabinetPageContent>
  );
}
