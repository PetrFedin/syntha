'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { BrandCentricStyleImportPanel } from '@/components/integrations/BrandCentricStyleImportPanel';
import { BrandCentricBomConflictPanel } from '@/components/integrations/BrandCentricBomConflictPanel';
import { BrandCentricRfqImportPanel } from '@/components/integrations/BrandCentricRfqImportPanel';
import { BrandCentricMediaImportPanel } from '@/components/integrations/BrandCentricMediaImportPanel';
import { BrandCentricRfqRegistryPanel } from '@/components/brand/merch/BrandCentricRfqRegistryPanel';
import { BrandCentricRfqQuoteCardsPanel } from '@/components/brand/merch/BrandCentricRfqQuoteCardsPanel';
import { BrandCommsEntityThreadsPanel } from '@/components/brand/merch/BrandCommsEntityThreadsPanel';
import {
  BrandRfqSupplierGoldenPathStrip,
  brandRfqSupplierGoldenPathStepFromFeature,
} from '@/components/brand/merch/BrandRfqSupplierGoldenPathStrip';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { PLATFORM_CORE_DEMO, getPlatformCoreDemo } from '@/lib/platform-core-demo-context';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { BrandDevMerchCoSpinePeerStrip } from '@/components/platform/BrandDevMerchCoSpinePeerStrip';

function CentricIntegrationsWorkspaceBody() {
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-rfq-supplier');
  const collectionId = PLATFORM_CORE_DEMO.collectionId;
  const articleId = PLATFORM_CORE_DEMO.demoArticleId;
  const demo = getPlatformCoreDemo(collectionId);

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-rfq-supplier"
      ctx={{ collectionId, articleId }}
      crossLinksTitle="Разработка → закупка → comms"
      beforeTabs={
        <div className="mb-2 flex items-center gap-3">
          <Link href={ROUTES.brand.integrations}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      }
    >
      <div className="mb-4">
        <BrandRfqSupplierGoldenPathStrip
          collectionId={collectionId}
          articleId={articleId}
          activeStep={brandRfqSupplierGoldenPathStepFromFeature(activeFeatureId)}
        />
      </div>
      {isPlatformCoreMode() ? (
        <div className="mb-4">
          <BrandDevMerchCoSpinePeerStrip
            variant="rfq-supplier"
            collectionId={collectionId}
            orderId={demo.demoOrderId}
          />
        </div>
      ) : null}
      {activeFeatureId === 'upstream' ? (
        <div className="grid gap-4">
          <BrandCentricStyleImportPanel collectionId={collectionId} articleId={articleId} />
          <BrandCentricBomConflictPanel collectionId={collectionId} articleId={articleId} />
          <BrandCentricMediaImportPanel collectionId={collectionId} articleId={articleId} />
        </div>
      ) : null}

      {activeFeatureId === 'rfq' ? (
        <div className="grid gap-4">
          <BrandCentricRfqImportPanel collectionId={collectionId} articleId={articleId} />
          <BrandCentricRfqRegistryPanel collectionId={collectionId} articleId={articleId} />
          <BrandCentricRfqQuoteCardsPanel collectionId={collectionId} articleId={articleId} />
        </div>
      ) : null}

      {activeFeatureId === 'comms' ? (
        <BrandCommsEntityThreadsPanel />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function BrandIntegrationsCentricPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Centric PLM</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          RFQ workspace: upstream → quote/award → entity threads.
        </p>
      </div>
      <Suspense fallback={null}>
        <CentricIntegrationsWorkspaceBody />
      </Suspense>
    </div>
  );
}
