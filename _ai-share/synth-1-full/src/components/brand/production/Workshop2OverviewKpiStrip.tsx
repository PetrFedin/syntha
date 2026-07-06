'use client';
import { persistWorkshop2OverviewMirrorToDossier } from '@/lib/production/workshop2-overview-dossier-persist';

import Link from 'next/link';
import { Workshop2DossierPersistButton } from '@/components/brand/production/Workshop2DossierPersistButton';
import type { Workshop2OverviewModel } from '@/lib/production/workshop2-overview-model';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import { Workshop2RuArticleDashboardCard } from '@/components/brand/production/Workshop2RuArticleDashboardCard';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

type Props = {
  collectionId: string;
  articleUrlSegment: string;
  model: Workshop2OverviewModel;
  dossier?: Workshop2DossierPhase1 | null;
  market?: 'ru' | 'global';
  /** ISO из досье PG (wave 19 #21). */
  overviewPersistedAt?: string | null;
  onPersistOverviewSnapshot?: () => void;
  overviewPersisting?: boolean;
};

/** KPI обзора из досье-readiness + опциональный snapshot в PG. */
export function Workshop2OverviewKpiStrip({
  collectionId,
  articleUrlSegment,
  model,
  dossier = null,
  market = 'ru',
  overviewPersistedAt,
  onPersistOverviewSnapshot,
  overviewPersisting = false,
}: Props) {
  const snap = model.readinessSnapshot;
  const primaryHref = workshop2ArticleHref(collectionId, articleUrlSegment, {
    w2pane: model.primaryAction.tab === 'tz' ? 'tz' : model.primaryAction.tab,
    ...(model.primaryAction.dossierSection ? { w2sec: model.primaryAction.dossierSection } : {}),
  });

  void persistWorkshop2OverviewMirrorToDossier;

  return (
    <div className="space-y-2">
      <Workshop2RuArticleDashboardCard
        collectionId={collectionId}
        articleUrlSegment={articleUrlSegment}
        dossier={dossier}
        market={market}
      />
      <div
        className="border-border-subtle flex flex-wrap items-center gap-3 rounded-lg border bg-slate-50/90 px-3 py-2 text-xs"
        role="status"
      >
        <span className="text-text-muted font-semibold uppercase tracking-wide">Обзор SKU</span>
        <span>
          ТЗ: <strong>{snap.tzOverallPct}%</strong>
        </span>
        <span className={snap.readyForHandoff ? 'text-emerald-700' : 'text-amber-800'}>
          {snap.readyForHandoff ? 'Готово к передаче' : 'Передача заблокирована'}
        </span>
        {snap.blockerCount > 0 ? (
          <span className="text-amber-800">Блокеров: {snap.blockerCount}</span>
        ) : null}
        {overviewPersistedAt ? (
          <span className="text-text-muted font-mono text-[10px]" title="Снимок обзора в досье PG">
            PG{' '}
            {new Date(overviewPersistedAt).toLocaleString('ru-RU', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </span>
        ) : null}
        {onPersistOverviewSnapshot ? (
          <Workshop2DossierPersistButton
            busy={overviewPersisting}
            className="h-6 text-[10px]"
            title="overviewMirror "
            onClick={onPersistOverviewSnapshot}
          />
        ) : null}
        <Link
          href={primaryHref}
          className="text-accent-primary ml-auto font-medium hover:underline"
        >
          {model.primaryAction.buttonLabel.replace(/\s*>$/, '')} →
        </Link>
      </div>
    </div>
  );
}
