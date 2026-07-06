'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  buildBrandDossierFactoryDiffPeerHrefs,
  buildBrandDossierFactoryDiffStubRows,
  summarizeBrandDossierFactoryDiffRu,
  type BrandDossierFactoryDiffRow,
} from '@/lib/platform-core-ports/fashion/brand-dossier-factory-diff-stub';
import {
  brandDossierFactoryDiffApiPath,
  type BrandDossierFactoryDiffSnapshot,
} from '@/lib/platform-core-ports/fashion/brand-dossier-factory-diff';
import { buildBrandOpAttachTzPoSession } from '@/lib/platform-core-ports/fashion/brand-op-attach-tz-po-session';
import {
  BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID,
  BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_PEER_LABEL_RU,
  buildBrandDossierDiffAttachTzPoCrossLinks,
} from '@/lib/platform-core-ports/platform/wave-xq-brand-dossier-dual-write-off';
import {
  BRAND_DOSSIER_FACTORY_DIFF_MFR_COMMENTS_LINK_TESTID,
  BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR,
  MFR_DOSSIER_COMMENT_PEER_LABEL_RU,
  mfrDevDossierAnnotationPanelHref,
} from '@/lib/platform-core-ports/mfr-dossier-comments';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  brandDossierFactoryDiffMismatchBadgeCompactRu,
  shouldOmitBrandDossierDiffAttachTzCrossStrip,
  summarizeBrandDossierFactoryDiffCompactRu,
  WAVE_YL_BRAND_DOSSIER_DIFF_COMPACT_PANEL_TESTID,
  WAVE_YL_DIFF_BRAND_COL_RU,
  WAVE_YL_DIFF_FACTORY_COL_RU,
  WAVE_YL_DIFF_LOADING_RU,
  WAVE_YL_DIFF_MATCH_RU,
  WAVE_YL_DIFF_READ_ONLY_BADGE_RU,
  WAVE_YL_DIFF_STUB_RU,
  type BrandDossierDiffViewerContext,
} from '@/lib/platform-core-ports/platform/wave-yl-brand-dossier-diff-viewer';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  productionOrderId?: string;
  factoryId?: string;
  /** Wave YL: brand-dev W2 vs brand OP order detail — compact RU + dedupe attach TZ strip on OP. */
  context?: BrandDossierDiffViewerContext;
};

/** Inline side-by-side read-only: brand W2 dossier vs factory dossier mirror (Wave UN live PG). */
export function BrandDossierFactoryDiffPanel({
  collectionId,
  articleId,
  orderId,
  productionOrderId,
  factoryId,
  context = 'brand-dev',
}: Props) {
  const [liveSnapshot, setLiveSnapshot] = useState<BrandDossierFactoryDiffSnapshot | null>(null);
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingLive(true);
    void fetch(brandDossierFactoryDiffApiPath(collectionId, articleId), { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as BrandDossierFactoryDiffSnapshot;
      })
      .then((json) => {
        if (!cancelled && json?.rows?.length) setLiveSnapshot(json);
      })
      .catch(() => {
        if (!cancelled) setLiveSnapshot(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingLive(false);
      });
    return () => {
      cancelled = true;
    };
  }, [collectionId, articleId]);

  const stubRows = buildBrandDossierFactoryDiffStubRows({ collectionId, articleId });
  const rows: BrandDossierFactoryDiffRow[] =
    liveSnapshot?.live && liveSnapshot.rows.length > 0 ? liveSnapshot.rows : stubRows;
  const compact = true;
  const summaryRu =
    liveSnapshot?.summaryRu && liveSnapshot.live && !compact
      ? liveSnapshot.summaryRu
      : compact
        ? summarizeBrandDossierFactoryDiffCompactRu(rows)
        : summarizeBrandDossierFactoryDiffRu(rows);
  const isLive = liveSnapshot?.live === true;
  const omitAttachTzCrossStrip = shouldOmitBrandDossierDiffAttachTzCrossStrip(context);

  const resolvedOrderId = orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const resolvedPoId =
    productionOrderId?.trim() || PLATFORM_CORE_DEMO.productionOrderId;
  const peers = buildBrandDossierFactoryDiffPeerHrefs({
    collectionId,
    articleId,
    orderId: resolvedOrderId,
  });
  const crossLinks = buildBrandDossierDiffAttachTzPoCrossLinks({
    orderId: resolvedOrderId,
    collectionId,
    articleId,
    factoryId: factoryId ?? PLATFORM_CORE_DEMO.factoryId,
    productionOrderId: resolvedPoId,
  });
  const attachSession = buildBrandOpAttachTzPoSession({
    orderId: resolvedOrderId,
    collectionId,
    articleId,
    factoryId: factoryId ?? PLATFORM_CORE_DEMO.factoryId,
    productionOrderId: resolvedPoId,
  });
  const mfrCommentsHref = mfrDevDossierAnnotationPanelHref(articleId, { collectionId });
  const mismatchCount = rows.filter((r) => !r.matched).length;
  const storageModeLabel =
    liveSnapshot?.storageMode === 'pg'
      ? 'PG'
      : liveSnapshot?.storageMode === 'file'
        ? 'файл'
        : null;

  return (
    <div
      id={BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR}
      className={cn(
        'border-border-subtle rounded-md border bg-bg-surface2/50 text-xs',
        compact ? 'px-2 py-1.5' : 'px-3 py-2'
      )}
      data-testid="brand-dossier-factory-diff-panel"
      data-wave-yl-compact={compact ? '1' : undefined}
    >
      {compact ? (
        <span className="sr-only" data-testid={WAVE_YL_BRAND_DOSSIER_DIFF_COMPACT_PANEL_TESTID}>
          compact
        </span>
      ) : null}
      <div className={cn('mb-2 flex flex-wrap items-center gap-1.5', compact && 'gap-1')}>
        <Badge variant="outline" className="text-[9px] uppercase">
          {compact ? WAVE_YL_DIFF_READ_ONLY_BADGE_RU : 'Сверка · read-only'}
        </Badge>
        {loadingLive ? (
          <Badge
            variant="outline"
            className="text-[9px] text-text-muted"
            data-testid="brand-dossier-factory-diff-loading-badge"
          >
            {compact ? WAVE_YL_DIFF_LOADING_RU : 'Загрузка…'}
          </Badge>
        ) : null}
        {isLive ? (
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-50 text-[9px] text-sky-900"
            data-testid="brand-dossier-factory-diff-live-badge"
          >
            В эфире{storageModeLabel ? ` · ${storageModeLabel}` : ' · PG'}
            {liveSnapshot?.dossierVersion != null ? ` · v${liveSnapshot.dossierVersion}` : ''}
          </Badge>
        ) : null}
        {isLive && liveSnapshot?.storageMode ? (
          <span
            className="text-text-muted text-[9px] uppercase"
            data-testid="brand-dossier-factory-diff-storage-mode"
          >
            {storageModeLabel ?? liveSnapshot.storageMode}
          </span>
        ) : null}
        {!loadingLive && !isLive ? (
          <Badge variant="outline" className="text-[9px] text-text-muted">
            {compact ? WAVE_YL_DIFF_STUB_RU : 'заглушка'}
          </Badge>
        ) : null}
        {mismatchCount > 0 ? (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-[9px] text-amber-900"
            data-testid="brand-dossier-factory-diff-mismatch-badge"
          >
            {compact
              ? brandDossierFactoryDiffMismatchBadgeCompactRu(mismatchCount)
              : `${mismatchCount} расхождений`}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-[9px] text-emerald-800"
            data-testid="brand-dossier-factory-diff-match-badge"
          >
            {compact ? WAVE_YL_DIFF_MATCH_RU : 'Совпадает'}
          </Badge>
        )}
        <span
          className={cn('text-text-muted', compact ? 'text-[9px]' : 'text-[10px]')}
          data-testid="brand-dossier-factory-diff-summary"
        >
          {summaryRu}
        </span>
      </div>
      <div className={cn('grid md:grid-cols-2', compact ? 'gap-1.5' : 'gap-2')}>
        <div
          className="min-w-0 rounded border border-border-subtle bg-bg-surface px-2 py-1.5"
          data-testid="brand-dossier-factory-diff-brand-col"
        >
          <p className="text-text-muted mb-1 text-[9px] font-bold uppercase">
            {compact ? WAVE_YL_DIFF_BRAND_COL_RU : 'Бренд · W2'}
          </p>
          <ul className="space-y-1">
            {rows.map((row) => (
              <li
                key={row.id}
                className={
                  row.matched
                    ? 'flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5'
                    : 'flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 rounded bg-amber-50/60 px-1'
                }
                data-testid={`brand-dossier-factory-diff-row-${row.id}`}
              >
                <span className="text-text-secondary">{row.labelRu}</span>
                <span className="text-text-primary font-medium">{row.brandValueRu}</span>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="min-w-0 rounded border border-border-subtle bg-bg-surface px-2 py-1.5"
          data-testid="brand-dossier-factory-diff-factory-col"
        >
          <p className="text-text-muted mb-1 text-[9px] font-bold uppercase">
            {compact ? WAVE_YL_DIFF_FACTORY_COL_RU : 'Цех · досье'}
          </p>
          <ul className="space-y-1">
            {rows.map((row) => (
              <li
                key={`factory-${row.id}`}
                className={
                  row.matched
                    ? 'flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5'
                    : 'flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 rounded bg-amber-50/60 px-1'
                }
                data-testid={`brand-dossier-factory-diff-factory-row-${row.id}`}
              >
                <span className="text-text-secondary">{row.labelRu}</span>
                <span
                  className={
                    row.matched ? 'font-medium text-emerald-800' : 'font-medium text-amber-900'
                  }
                >
                  {row.factoryValueRu}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className={cn(hubGadget.goldenPath, compact ? 'mt-1.5' : 'mt-2')}
        data-testid={
          omitAttachTzCrossStrip
            ? 'brand-dossier-factory-diff-peer-strip'
            : BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID
        }
      >
        {!omitAttachTzCrossStrip ? (
          <>
            <Link
              href={crossLinks.diffViewerHref}
              data-testid="brand-dossier-factory-diff-brand-link"
              className={hubGadget.goldenLink}
            >
              ТЗ бренда
            </Link>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={crossLinks.attachTzPoHref}
              data-testid="brand-op-attach-tz-po-link"
              className={hubGadget.goldenLink}
            >
              {BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_PEER_LABEL_RU}
            </Link>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={attachSession.attachTzPdfPeerHref}
              data-testid="brand-op-attach-tz-pdf-peer-link"
              className={hubGadget.goldenLink}
            >
              ТЗ PDF на заказе
            </Link>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
          </>
        ) : null}
        <Link
          href={peers.factoryDossierHref}
          data-testid="brand-dossier-factory-diff-factory-link"
          className={hubGadget.goldenLink}
        >
          Досье цеха →
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={mfrCommentsHref}
          data-testid={BRAND_DOSSIER_FACTORY_DIFF_MFR_COMMENTS_LINK_TESTID}
          className={hubGadget.goldenLink}
        >
          {MFR_DOSSIER_COMMENT_PEER_LABEL_RU} →
        </Link>
      </div>
    </div>
  );
}
