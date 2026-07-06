'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { findHandbookLeafById } from '@/lib/production/category-catalog';
import { W2_ARTICLE_SECTION_DOM } from '@/lib/production/workshop2-url';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { useArticleWorkspace } from '@/components/brand/production/article-workspace-context';
import { SectionFlashWrap } from '@/components/brand/production/workshop2-article-workspace-tab-panels-shell';
import { Workshop2ArticleOperationalTzRibbon } from '@/components/brand/production/Workshop2ArticleOperationalTzRibbon';
import {
  Workshop2TabPanelChunkBoundary,
  prefetchWorkshop2ArticleTabChunks,
} from '@/components/brand/production/workshop2-tab-panel-chunk-boundary';
import { Workshop2LogisticsPanel } from '@/components/brand/production/Workshop2LogisticsPanel';
import { Workshop2FactoryERPIntegrationPanel } from '@/components/brand/production/Workshop2FactoryERPIntegrationPanel';
import { Workshop2AQLInspectionPanel } from '@/components/brand/production/Workshop2AQLInspectionPanel';

export type Workshop2ArticleWorkspaceMainTab =
  | 'supply'
  | 'fit'
  | 'plan'
  | 'release'
  | 'qc'
  | 'stock'
  | 'vault';

function TabPanelLoading({ label }: { label: string }) {
  return <p className="text-text-secondary text-sm">Загрузка вкладки «{label}»…</p>;
}

const Workshop2ArticleSupplyPanel = dynamic(
  () =>
    import('@/components/brand/production/workshop2-article-workspace-supply-panel').then((m) => ({
      default: m.Workshop2ArticleSupplyPanel,
    })),
  { loading: () => <TabPanelLoading label="Снабжение" /> }
);

const Workshop2ArticleFitGoldPanel = dynamic(
  () =>
    import('@/components/brand/production/workshop2-article-workspace-fit-gold-panel').then(
      (m) => ({
        default: m.Workshop2ArticleFitGoldPanel,
      })
    ),
  { loading: () => <TabPanelLoading label="Примерка" /> }
);

const Workshop2ArticlePlanPoPanel = dynamic(
  () =>
    import('@/components/brand/production/workshop2-article-workspace-plan-po-panel').then((m) => ({
      default: m.Workshop2ArticlePlanPoPanel,
    })),
  { loading: () => <TabPanelLoading label="План" /> }
);

const Workshop2ArticleNestingPanel = dynamic(
  () =>
    import('@/components/brand/production/workshop2-article-workspace-nesting-panel').then((m) => ({
      default: m.Workshop2ArticleNestingPanel,
    })),
  { loading: () => <TabPanelLoading label="План" /> }
);

const Workshop2TimeAndActionPanel = dynamic(
  () =>
    import('@/components/brand/production/Workshop2TimeAndActionPanel').then((m) => ({
      default: m.Workshop2TimeAndActionPanel,
    })),
  { loading: () => <TabPanelLoading label="T&A" /> }
);

const Workshop2ArticleReleasePanel = dynamic(
  () =>
    import('@/components/brand/production/workshop2-article-workspace-release-panel').then((m) => ({
      default: m.Workshop2ArticleReleasePanel,
    })),
  { loading: () => <TabPanelLoading label="Выпуск" /> }
);

const Workshop2ArticleQcPanel = dynamic(
  () =>
    import('@/components/brand/production/workshop2-article-workspace-qc-panel').then((m) => ({
      default: m.Workshop2ArticleQcPanel,
    })),
  { loading: () => <TabPanelLoading label="ОТК" /> }
);

const Workshop2ArticleStockPanel = dynamic(
  () =>
    import('@/components/brand/production/workshop2-article-workspace-stock-panel').then((m) => ({
      default: m.Workshop2ArticleStockPanel,
    })),
  { loading: () => <TabPanelLoading label="Склад" /> }
);

const Workshop2ArticleWorkspaceVaultPanel = dynamic(
  () =>
    import('@/components/brand/production/workshop2-article-workspace-vault-panel').then((m) => ({
      default: m.Workshop2ArticleWorkspaceVaultPanel,
    })),
  { loading: () => <TabPanelLoading label="Документы" /> }
);

export function Workshop2ArticleWorkspaceTabPanels({
  tab,
  flashSectionId = null,
  dossier,
  categoryLeafId,
  articleUrlSegment,
}: {
  tab: Workshop2ArticleWorkspaceMainTab;
  flashSectionId?: string | null;
  dossier: Workshop2DossierPhase1 | null;
  categoryLeafId: string;
  articleUrlSegment: string;
}) {
  const { ref } = useArticleWorkspace();
  const articleIdStr = String(ref.articleId);
  const collectionIdStr = String(ref.collectionId);
  const leaf = useMemo(() => findHandbookLeafById(categoryLeafId) ?? null, [categoryLeafId]);

  if (tab === 'plan' || tab === 'release') {
    prefetchWorkshop2ArticleTabChunks(tab);
  }

  const ribbon = (
    <Workshop2ArticleOperationalTzRibbon
      tab={tab}
      dossier={dossier}
      leaf={leaf}
      articleUrlSegment={articleUrlSegment}
    />
  );

  switch (tab) {
    case 'supply':
      return (
        <div className="space-y-3">
          {ribbon}
          <Workshop2TabPanelChunkBoundary tabLabelRu="Снабжение">
            <SectionFlashWrap id={W2_ARTICLE_SECTION_DOM.supply} flashSectionId={flashSectionId}>
              <Workshop2ArticleSupplyPanel dossier={dossier} />
            </SectionFlashWrap>
          </Workshop2TabPanelChunkBoundary>
        </div>
      );
    case 'fit':
      return (
        <div className="space-y-3">
          {ribbon}
          <Workshop2TabPanelChunkBoundary tabLabelRu="Примерка">
            <SectionFlashWrap id={W2_ARTICLE_SECTION_DOM.fit} flashSectionId={flashSectionId}>
              <Workshop2ArticleFitGoldPanel
                dossier={dossier}
                categoryLeafId={categoryLeafId}
                articleUrlSegment={articleUrlSegment}
              />
            </SectionFlashWrap>
          </Workshop2TabPanelChunkBoundary>
        </div>
      );
    case 'plan':
      return (
        <div className="space-y-3">
          {ribbon}
          <Workshop2TabPanelChunkBoundary tabLabelRu="План">
            <SectionFlashWrap id={W2_ARTICLE_SECTION_DOM.planPo} flashSectionId={flashSectionId}>
              <Workshop2ArticlePlanPoPanel dossier={dossier} articleId={articleIdStr} />
            </SectionFlashWrap>
            <SectionFlashWrap id={W2_ARTICLE_SECTION_DOM.planTa} flashSectionId={flashSectionId}>
              <Workshop2TimeAndActionPanel
                articleId={articleIdStr}
                collectionId={collectionIdStr}
                dossier={dossier}
              />
            </SectionFlashWrap>
            <SectionFlashWrap id={W2_ARTICLE_SECTION_DOM.planNest} flashSectionId={flashSectionId}>
              <Workshop2ArticleNestingPanel dossier={dossier} />
            </SectionFlashWrap>
          </Workshop2TabPanelChunkBoundary>
        </div>
      );
    case 'release':
      return (
        <div className="space-y-3">
          {ribbon}
          <Workshop2TabPanelChunkBoundary tabLabelRu="Выпуск">
            <SectionFlashWrap id={W2_ARTICLE_SECTION_DOM.release} flashSectionId={flashSectionId}>
              <Workshop2ArticleReleasePanel dossier={dossier} />
            </SectionFlashWrap>
            <Workshop2LogisticsPanel dossier={dossier} />
            <Workshop2FactoryERPIntegrationPanel articleId={articleIdStr} dossier={dossier} />
          </Workshop2TabPanelChunkBoundary>
        </div>
      );
    case 'qc':
      return (
        <div className="space-y-3">
          {ribbon}
          <Workshop2TabPanelChunkBoundary tabLabelRu="ОТК">
            <SectionFlashWrap id={W2_ARTICLE_SECTION_DOM.qc} flashSectionId={flashSectionId}>
              <Workshop2ArticleQcPanel dossier={dossier} />
            </SectionFlashWrap>
            <Workshop2AQLInspectionPanel dossier={dossier} />
          </Workshop2TabPanelChunkBoundary>
        </div>
      );
    case 'stock':
      return (
        <div className="space-y-3">
          {ribbon}
          <Workshop2TabPanelChunkBoundary tabLabelRu="Склад">
            <SectionFlashWrap id={W2_ARTICLE_SECTION_DOM.stock} flashSectionId={flashSectionId}>
              <Workshop2ArticleStockPanel dossier={dossier} />
            </SectionFlashWrap>
          </Workshop2TabPanelChunkBoundary>
        </div>
      );
    case 'vault':
      return (
        <div className="space-y-3">
          {ribbon}
          <Workshop2TabPanelChunkBoundary tabLabelRu="Документы">
            <SectionFlashWrap id="w2article-section-vault" flashSectionId={flashSectionId}>
              <Workshop2ArticleWorkspaceVaultPanel dossier={dossier} />
            </SectionFlashWrap>
          </Workshop2TabPanelChunkBoundary>
        </div>
      );
    default:
      return null;
  }
}
