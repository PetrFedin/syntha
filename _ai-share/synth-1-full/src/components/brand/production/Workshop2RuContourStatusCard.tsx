'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Gauge } from 'lucide-react';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  buildWorkshop2Ss27RuJourneySteps,
  summarizeWorkshop2RuContourStatusLines,
} from '@/lib/production/workshop2-ru-journey-ss27';
import { summarizeWorkshop2RuStatusStrip } from '@/lib/production/workshop2-ru-status-strip-summary';
import type { Workshop2HubArticleMiniStatus } from '@/lib/production/workshop2-hub-summary';

/** Wave 18: свёрнутая карточка «Статус контура РФ» на хабе при выбранной коллекции (w2col). */
export function Workshop2RuContourStatusCard({
  collectionId,
  anchorArticleId,
  anchorDossier,
  hubMiniStatus,
  integrationProbesOneLiner,
  ruMaturityScore,
}: {
  collectionId: string;
  anchorArticleId?: string | null;
  anchorDossier?: Workshop2DossierPhase1 | null;
  hubMiniStatus?: Workshop2HubArticleMiniStatus | null;
  /** Wave 19: probes one-liner внутри карточки вместо отдельного баннера на хабе. */
  integrationProbesOneLiner?: string | null;
  /** Wave 20: итоговый maturity score 0–100 из integration-probes.wave20RuMaturity. */
  ruMaturityScore?: number | null;
}) {
  const cid = collectionId.trim();
  const [expanded, setExpanded] = useState(false);
  const [investorReady, setInvestorReady] = useState<boolean | null>(null);
  const [stagingNoteRu, setStagingNoteRu] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/workshop2/investor-readiness', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as {
          readyForInvestorDemo?: boolean;
          stagingNoteRu?: string;
        } | null;
      })
      .then((data) => {
        if (cancelled || !data) return;
        setInvestorReady(data.readyForInvestorDemo === true);
        setStagingNoteRu(typeof data.stagingNoteRu === 'string' ? data.stagingNoteRu : null);
      })
      .catch(() => {
        if (!cancelled) {
          setInvestorReady(null);
          setStagingNoteRu(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cid]);

  const journeySteps = useMemo(() => {
    if (!anchorArticleId) return [];
    return buildWorkshop2Ss27RuJourneySteps({
      collectionId: cid,
      articleId: anchorArticleId,
      dossier: anchorDossier,
    });
  }, [anchorArticleId, anchorDossier, cid]);

  const gateBlockerCount = useMemo(() => {
    if (hubMiniStatus?.gateBlockerCount != null) return hubMiniStatus.gateBlockerCount;
    if (anchorArticleId && anchorDossier) {
      return summarizeWorkshop2RuStatusStrip(anchorDossier, {
        collectionId: cid,
        articleId: anchorArticleId,
      })?.gateBlockerCount;
    }
    return 0;
  }, [anchorArticleId, anchorDossier, cid, hubMiniStatus?.gateBlockerCount]);

  const lines = summarizeWorkshop2RuContourStatusLines({
    readyForInvestorDemo: investorReady === true,
    stagingNoteRu,
    journeySteps,
    gateBlockerCount,
  });

  const collapsedHint =
    investorReady === true
      ? 'контур готов'
      : investorReady === false
        ? 'требует внимания · см. детали'
        : 'загрузка статуса…';

  return (
    <section
      className="rounded-lg border border-slate-200/90 bg-white/80 shadow-sm"
      data-testid="workshop2-ru-contour-status-card"
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50/80"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
        )}
        <Gauge className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
        <span className="text-[11px] font-bold text-slate-900">Статус контура РФ</span>
        {typeof ruMaturityScore === 'number' ? (
          <span
            className="ml-auto shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-indigo-700"
            data-testid="workshop2-ru-maturity-score"
            title="Зрелость РФ: API RU errors + UAT auto + critical wrappers"
          >
            {ruMaturityScore}
          </span>
        ) : null}
        <span className="truncate text-[10px] text-slate-500">
          · {cid} · {collapsedHint}
        </span>
      </button>
      {expanded ? (
        <div className="space-y-1.5 border-t border-slate-100 px-3 py-2">
          {integrationProbesOneLiner ? (
            <p
              className="text-[10px] leading-snug text-slate-600"
              data-testid="workshop2-hub-integration-probes-inline"
            >
              {integrationProbesOneLiner}
            </p>
          ) : null}
          <ul className="space-y-1 text-[10px] leading-snug text-slate-800">
            <li data-testid="workshop2-ru-contour-investor">{lines.investorLineRu}</li>
            <li data-testid="workshop2-ru-contour-journey">{lines.journeyLineRu}</li>
            <li data-testid="workshop2-ru-contour-blockers">{lines.blockersLineRu}</li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
