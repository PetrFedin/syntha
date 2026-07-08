'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import Link from 'next/link';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import MessagesPage from '@/components/user/messages/MessagesPage';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCoreCommsWorkspaceExtras } from '@/components/platform/PlatformCoreCommsWorkspaceExtras';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { FactoryCommsEntityThreadsPanel } from '@/components/factory/FactoryCommsEntityThreadsPanel';
import { FactoryCommsAttachTzComposeStrip } from '@/components/factory/FactoryCommsAttachTzComposeStrip';
import { ManufacturerOrderCommsPanel } from '@/components/factory/ManufacturerOrderCommsPanel';
import { MfrCmOrderContextPeerStrip } from '@/components/factory/MfrCmOrderContextPeerStrip';
import { MfrCmArticleMessagesPeerPanel } from '@/components/factory/MfrCmArticleMessagesPeerPanel';
import {
  ManufacturerCommsWorkspaceGoldenPathStrip,
  manufacturerCommsGoldenPathStepFromFeature,
} from '@/components/factory/ManufacturerCommsWorkspaceGoldenPathStrip';
import { PlatformCoreCommsUniversalInboxStrip } from '@/components/platform/PlatformCoreCommsUniversalInboxStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { getPlatformCoreDemo, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreCommsThreadsSource } from '@/hooks/use-platform-core-comms-threads-source';
import { ROUTES } from '@/lib/routes';
import { PLATFORM_CORE_MESSAGES_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';

function FactoryCommsFailClosed({
  variant,
  collectionId,
}: {
  variant: 'manufacturer' | 'supplier';
  collectionId: string;
}) {
  const hubHref =
    variant === 'supplier'
      ? EXTENDED_ROUTES.factory.supplierCoreCabinet
      : EXTENDED_ROUTES.factory.productionCoreCabinet;
  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50/90 p-6 text-sm text-amber-950"
      data-testid={`factory-messages-core-fail-closed-${variant}`}
      role="alert"
    >
      <p className="font-semibold">Сообщения недоступны</p>
      <p className="text-text-secondary mt-1">{PLATFORM_CORE_MESSAGES_UNAVAILABLE_RU}</p>
      <p className="mt-3">
        <Link
          href={`${hubHref}?collection=${encodeURIComponent(collectionId)}`}
          className="text-accent-primary underline"
        >
          Перейти на хаб кабинета →
        </Link>
      </p>
    </div>
  );
}

function FactoryCommsThreadsGate({
  variant,
  children,
  collectionId,
}: {
  variant: 'manufacturer' | 'supplier';
  children: React.ReactNode;
  collectionId: string;
}) {
  const source = usePlatformCoreCommsThreadsSource('/api/factory/messages/threads');
  if (source === 'loading') {
    return <div className="text-text-secondary p-6 text-sm">Загрузка сообщений…</div>;
  }
  if (source === 'memory') {
    return <FactoryCommsFailClosed variant={variant} collectionId={collectionId} />;
  }
  return <>{children}</>;
}

function FactoryProductionMessagesWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const demo = getPlatformCoreDemo(collectionId);
  const factoryId = searchParams.get('factoryId')?.trim() || demo.factoryId;
  const orderId =
    searchParams.get('order')?.trim() || searchParams.get('orderId')?.trim() || undefined;
  const ctx = { collectionId, orderId, factoryId };
  const { activeFeatureId } = usePillarCapabilityWorkspace('manufacturer-comms-workspace');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="manufacturer-comms-workspace"
      ctx={ctx}
      crossLinksTitle="Связь · передача · трекинг магазина"
    >
      <div className="mb-4">
        <ManufacturerCommsWorkspaceGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          factoryId={factoryId}
          activeStep={manufacturerCommsGoldenPathStepFromFeature(activeFeatureId)}
        />
      </div>
      {orderId ? (
        <div className="mb-4">
          <MfrCmOrderContextPeerStrip
            collectionId={collectionId}
            orderId={orderId}
            factoryId={factoryId}
          />
        </div>
      ) : null}
      <FactoryCommsAttachTzComposeStrip variant="manufacturer" />
      {activeFeatureId === 'inbox' ? <MessagesPage initialRole="manufacturer" slimCore /> : null}
      {activeFeatureId === 'entities' ? (
        <FactoryCommsEntityThreadsPanel variant="manufacturer" />
      ) : null}
      {activeFeatureId === 'order' ? (
        <ManufacturerOrderCommsPanel
          orderId={orderId}
          collectionId={collectionId}
          factoryId={factoryId}
        />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

function FactoryProductionMessagesCorePageInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const roleParam = searchParams.get('role');
  const variant: 'manufacturer' | 'supplier' =
    roleParam === 'supplier' || pathname?.startsWith('/factory/supplier/messages')
      ? 'supplier'
      : 'manufacturer';

  if (variant === 'supplier') {
    return (
      <div className="space-y-4 p-4" data-testid="factory-messages-core">
        <PlatformCoreListChrome highlightRole={variant} pillarId="comms">
          <PlatformCoreCommsWorkspaceExtras variant={variant} />
          <FactoryCommsThreadsGate variant={variant} collectionId={collectionId}>
            <Suspense fallback={null}>
              <PlatformCoreCommsUniversalInboxStrip variant="supplier" />
            </Suspense>
            <MessagesPage initialRole={variant} slimCore />
          </FactoryCommsThreadsGate>
        </PlatformCoreListChrome>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4" data-testid="factory-messages-core">
      <PlatformCoreListChrome highlightRole="manufacturer" pillarId="comms">
        <PlatformCoreCommsWorkspaceExtras variant="manufacturer" />
        <MfrCmArticleMessagesPeerPanel />
        <Suspense fallback={null}>
          <PlatformCoreCommsUniversalInboxStrip variant="manufacturer" />
        </Suspense>
        <FactoryCommsThreadsGate variant="manufacturer" collectionId={collectionId}>
          <Suspense fallback={null}>
            <FactoryProductionMessagesWorkspaceBody />
          </Suspense>
        </FactoryCommsThreadsGate>
      </PlatformCoreListChrome>
    </div>
  );
}

export function FactoryProductionMessagesCorePage() {
  return (
    <Suspense fallback={<div className="text-text-secondary p-6 text-sm">Загрузка сообщений…</div>}>
      <FactoryProductionMessagesCorePageInner />
    </Suspense>
  );
}
