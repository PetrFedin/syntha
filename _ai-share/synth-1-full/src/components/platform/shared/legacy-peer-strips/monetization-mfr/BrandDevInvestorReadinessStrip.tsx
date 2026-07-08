'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  brandDevInvestorReadinessArticlesLabelRu,
  brandDevInvestorReadinessFillLabelRu,
  brandDevInvestorReadinessPgSourceLabelRu,
  brandDevInvestorReadinessReadyLabelRu,
  brandDevInvestorSummaryHref,
  BRAND_DEV_INVESTOR_READINESS_API,
} from '@/lib/platform-core-ports/platform/brand-dev-investor-readiness-dashboard';
import type { Workshop2InvestorReadinessReport } from '@/lib/platform-core-ports/investor-readiness';
import { brandDevelopmentArticleHref } from '@/lib/platform-core-routes';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  articleId: string;
  /** compact = dev cabinet dashboard strip inside PillarCard panel */
  variant?: 'compact' | 'full';
};

/** Wave WE: investor-readiness metrics strip · PG `/api/workshop2/investor-readiness`. */
export function BrandDevInvestorReadinessStrip({
  collectionId,
  articleId,
  variant = 'compact',
}: Props) {
  const [report, setReport] = useState<Workshop2InvestorReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(BRAND_DEV_INVESTOR_READINESS_API, { cache: 'no-store' });
        if (!res.ok) throw new Error('investor-readiness failed');
        const json = (await res.json()) as Workshop2InvestorReadinessReport;
        if (!cancelled) setReport(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  const investorHref = brandDevInvestorSummaryHref(collectionId, articleId);
  const fillPct = report?.ss27.avgTzFillPct;
  const compact = variant === 'compact';

  return (
    <div
      className={cn(
        compact
          ? hubGadget.goldenPath
          : 'border-border-subtle space-y-2 rounded-md border border-amber-200/50 bg-amber-50/20 px-3 py-2'
      )}
      data-testid="brand-dev-investor-readiness-strip"
    >
      <span
        className="text-text-muted text-[10px] font-bold uppercase"
        data-testid="brand-dev-investor-readiness-label"
      >
        Готовность инвестору · PG
      </span>
      {loading ? (
        <span
          className="text-text-muted text-[10px]"
          data-testid="brand-dev-investor-readiness-loading"
        >
          Загрузка PG…
        </span>
      ) : error ? (
        <Badge
          variant="destructive"
          className="text-[9px]"
          data-testid="brand-dev-investor-readiness-error"
        >
          PG недоступен
        </Badge>
      ) : (
        <>
          <Badge
            variant="outline"
            className="text-[9px]"
            data-testid="brand-dev-investor-readiness-pg-source"
          >
            {brandDevInvestorReadinessPgSourceLabelRu(report?.pgOnly ?? false)}
          </Badge>
          <Badge
            variant={report?.readyForInvestorDemo ? 'default' : 'secondary'}
            className="text-[9px]"
            data-testid="brand-dev-investor-readiness-ready"
          >
            {brandDevInvestorReadinessReadyLabelRu(report?.readyForInvestorDemo ?? false)}
          </Badge>
          {typeof fillPct === 'number' ? (
            <span
              className="text-text-secondary text-[10px] tabular-nums"
              data-testid="brand-dev-investor-readiness-fill"
            >
              {brandDevInvestorReadinessFillLabelRu(fillPct)}
            </span>
          ) : null}
          <span
            className="text-text-muted text-[10px] tabular-nums"
            data-testid="brand-dev-investor-readiness-articles"
          >
            {brandDevInvestorReadinessArticlesLabelRu(report?.ss27.articleCount ?? 0)}
          </span>
          {report?.stagingMode && report.stagingNoteRu ? (
            <span
              className="text-text-muted max-w-[12rem] truncate text-[9px]"
              data-testid="brand-dev-investor-readiness-staging-note"
              title={report.stagingNoteRu}
            >
              {report.stagingNoteRu}
            </span>
          ) : null}
        </>
      )}
      <Link
        href={investorHref}
        className={hubGadget.goldenLink}
        data-testid="brand-dev-investor-readiness-link"
      >
        Сводка
      </Link>
      <Link
        href={brandDevelopmentArticleHref(collectionId, articleId, { section: 'overview' })}
        className={hubGadget.goldenLink}
        data-testid="brand-dev-investor-readiness-dossier-link"
      >
        ТЗ
      </Link>
    </div>
  );
}
