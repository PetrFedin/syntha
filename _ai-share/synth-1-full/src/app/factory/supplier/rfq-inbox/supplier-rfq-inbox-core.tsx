'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCoreCommsUniversalInboxStrip } from '@/components/platform/PlatformCoreCommsUniversalInboxStrip';
import { SupplierProcurementRfqPanel } from '@/components/factory/supplier/SupplierProcurementWorkspacePanels';
import { SupplierRfqQuoteCardPanel } from '@/components/factory/supplier/SupplierRfqQuoteCardPanel';
import { SupplierRfqSlaTimerStrip } from '@/components/factory/supplier/SupplierRfqSlaTimerStrip';
import { PLATFORM_CORE_DEMO, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { ROUTES, factorySupplierMessagesWorkshop2ArticleContextHref } from '@/lib/routes';

function SupplierRfqInboxBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const articleId = searchParams.get('article')?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const chatHref = factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId);

  return (
    <div data-testid="supplier-rfq-inbox-panel">
      <div className="space-y-4" data-testid="supplier-rfq-inbox-core">
        <p className="text-text-secondary text-xs" data-testid="supplier-rfq-inbox-lead">
          Входящие запросы котировок от бренда — отдельно от общего inbox сообщений.
        </p>
        <SupplierRfqSlaTimerStrip collectionId={collectionId} articleId={articleId} />
        <SupplierRfqQuoteCardPanel collectionId={collectionId} articleId={articleId} />
        <SupplierProcurementRfqPanel collectionId={collectionId} articleId={articleId} />
        <p className="text-text-muted text-[10px]">
          Чат по цене материала:{' '}
          <Link
            href={chatHref}
            className="text-accent-primary underline"
            data-testid="supplier-rfq-inbox-chat-link"
          >
            открыть чат артикула →
          </Link>
          {' · '}
          <Link
            href={`${EXTENDED_ROUTES.factory.supplierMessages}?collection=${encodeURIComponent(collectionId)}`}
            className="text-accent-primary underline"
            data-testid="supplier-rfq-inbox-messages-link"
          >
            все сообщения →
          </Link>
        </p>
      </div>
    </div>
  );
}

export function SupplierRfqInboxCorePage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-24 sm:px-6">
      <PlatformCoreListChrome highlightRole="supplier" pillarId="comms">
        <Suspense fallback={null}>
          <PlatformCoreCommsUniversalInboxStrip variant="supplier" />
        </Suspense>
        <Suspense fallback={<div className="text-text-secondary p-6 text-sm">Загрузка RFQ…</div>}>
          <SupplierRfqInboxBody />
        </Suspense>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
