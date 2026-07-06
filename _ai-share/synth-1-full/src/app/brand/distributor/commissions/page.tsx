'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ArrowLeft } from 'lucide-react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PartnersFinanceDistributorsBadges } from '@/components/brand/SectionBadgeCta';
import { B2BIntegrationStatusWidget } from '@/components/b2b/B2BIntegrationStatusWidget';
import { getSubAgentCommissionLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import {
  listCommissionRecords,
  type CommissionRecord,
} from '@/lib/distributor/sub-agent-commission';
import { RegistryPageHeader } from '@/components/design-system';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  BrandAgentRepLedgerPanel,
  BrandAgentRepRepsPanel,
  BrandAgentRepShopPortalPanel,
} from '@/components/brand/distributor/BrandAgentRepWorkspacePanels';
import { BrandAgentRepCommissionDisputeStrip } from '@/components/brand/distributor/BrandAgentRepCommissionDisputeStrip';
import { BrandAgentRepShopPortalReadOnlyRuStrip } from '@/components/brand/distributor/BrandAgentRepShopPortalReadOnlyRuStrip';
import {
  BrandAgentRepGoldenPathStrip,
  brandAgentRepGoldenPathStepFromFeature,
} from '@/components/brand/distributor/BrandAgentRepGoldenPathStrip';
import { BrandCoAgentRepCoPeerStrip } from '@/components/platform/BrandCoAgentRepCoPeerStrip';
import { BrandAgentRepTerritoryPeerStrip } from '@/components/brand/distributor/BrandAgentRepTerritoryPeerStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';

const statusLabels: Record<CommissionRecord['status'], string> = {
  pending: 'На согласовании',
  approved: 'Утверждено',
  paid: 'Выплачено',
};

function CommissionsLegacyPage() {
  const [records, setRecords] = useState<CommissionRecord[]>([]);

  useEffect(() => {
    listCommissionRecords().then(setRecords);
  }, []);

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Sub-Agent Commission"
        leadPlain="Расчёт комиссий торговых представителей."
        eyebrow={
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.distributors} aria-label="Назад">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <DollarSign className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <PartnersFinanceDistributorsBadges />
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Комиссии по периодам</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {records.map((r) => (
              <li key={r.id} className="flex justify-between rounded-lg border p-3 text-sm">
                <span>{r.subAgentName}</span>
                <Badge variant="outline">{statusLabels[r.status]}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <B2BIntegrationStatusWidget settingsHref={ROUTES.brand.integrations} />
      <RelatedModulesBlock links={getSubAgentCommissionLinks()} title="Партнёры" />
    </CabinetPageContent>
  );
}

function CommissionsWorkspaceBody() {
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-agent-rep');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-agent-rep"
      crossLinksTitle="Brand ledger ↔ shop rep portal"
      beforeTabs={
        <RegistryPageHeader
          title="Rep oversight"
          leadPlain="Brand-side mirror co-agent-rep: ledger · reps · shop portal links."
          eyebrow={
            <Button variant="ghost" size="icon" asChild>
              <Link href={ROUTES.brand.distributors} aria-label="Назад">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          }
          actions={<PartnersFinanceDistributorsBadges />}
        />
      }
    >
      <div className="mb-4 space-y-2">
        <BrandAgentRepGoldenPathStrip
          activeStep={brandAgentRepGoldenPathStepFromFeature(activeFeatureId)}
        />
        <BrandCoAgentRepCoPeerStrip />
      </div>
      {activeFeatureId === 'ledger' ? (
        <>
          <BrandAgentRepShopPortalReadOnlyRuStrip />
          <BrandAgentRepCommissionDisputeStrip />
          <BrandAgentRepLedgerPanel />
        </>
      ) : null}
      {activeFeatureId === 'reps' ? (
        <>
          <BrandAgentRepTerritoryPeerStrip />
          <BrandAgentRepRepsPanel />
        </>
      ) : null}
      {activeFeatureId === 'shop-portal' ? <BrandAgentRepShopPortalPanel /> : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function SubAgentCommissionPage() {
  if (!isPlatformCoreMode()) {
    return <CommissionsLegacyPage />;
  }

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <Suspense fallback={null}>
        <CommissionsWorkspaceBody />
      </Suspense>
      <B2BIntegrationStatusWidget settingsHref={ROUTES.brand.integrations} />
      <RelatedModulesBlock links={getSubAgentCommissionLinks()} title="Партнёры, финансы" />
    </CabinetPageContent>
  );
}
