'use client';

import Link from 'next/link';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { usePlatformCoreDevelopmentStatusPoll } from '@/hooks/use-platform-core-development-status-poll';
import { brandSampleLifecycleFeatureHref } from '@/lib/platform-core-ports/fashion/brand-sample-lifecycle-workspace';
import { brandAttributeSchemaFeatureHref } from '@/lib/platform-core-ports/fashion/brand-attribute-schema-workspace';
import {
  ROUTES,
  brandDevelopmentArticleHref,
  brandMessagesWorkshop2ArticleContextHref,
  factoryProductionDossierHref,
} from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  articleId: string;
  /** Кабинет: live SSE dot вместо poll-only (wave WT). */
  showLiveBadge?: boolean;
};

/** W2 hub · development-status peers — range, samples, factory, comms. */
export function BrandDevPgSyncPeerStrip({ collectionId, articleId, showLiveBadge = false }: Props) {
  const { sseConnected } = usePlatformCoreDevelopmentStatusPoll(
    showLiveBadge && Boolean(collectionId),
    [collectionId]
  );
  const rangeHref = platformCoreUiHref(
    `${ROUTES.brand.rangePlanner}?collection=${encodeURIComponent(collectionId)}`
  );
  const w2ArticleHref = brandDevelopmentArticleHref(collectionId, articleId);

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="brand-dev-pg-sync-peer-strip"
      {...(showLiveBadge ? { 'data-pg-sync-sse-live': sseConnected ? '1' : '0' } : {})}
    >
      {showLiveBadge ? (
        <PlatformCoreChainStatusRefreshBadge
          sseConnected={sseConnected}
          enabled
          variant="dot"
          sseTestId="brand-dev-development-sse-live-badge"
          pollTestId="brand-dev-development-poll-badge"
          sseLegacyTestId="brand-dev-pg-sync-sse-live-badge"
        />
      ) : null}
      <Link
        href={rangeHref}
        data-testid="brand-dev-pg-sync-range-link"
        className={hubGadget.goldenLink}
      >
        План
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandSampleLifecycleFeatureHref('rounds', collectionId)}
        data-testid="brand-dev-pg-sync-sample-lifecycle-link"
        className={hubGadget.goldenLink}
      >
        Образцы
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={factoryProductionDossierHref(articleId, { collectionId })}
        data-testid="brand-dev-pg-sync-factory-dossier-link"
        className={hubGadget.goldenLink}
      >
        Досье цеха
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandAttributeSchemaFeatureHref('health', collectionId)}
        data-testid="brand-dev-pg-sync-schema-link"
        className={hubGadget.goldenLink}
      >
        Схема атрибутов
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandMessagesWorkshop2ArticleContextHref(collectionId, articleId)}
        data-testid="brand-dev-pg-sync-article-comms-link"
        className={hubGadget.goldenLink}
      >
        Чат по артикулу
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={w2ArticleHref}
        data-testid="brand-dev-pg-sync-w2-article-link"
        className={hubGadget.goldenLink}
      >
        Артикул W2
      </Link>
    </div>
  );
}
