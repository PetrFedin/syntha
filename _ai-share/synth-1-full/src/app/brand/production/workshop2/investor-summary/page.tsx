'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { W2_OPERATIONAL_PANEL_ROOT } from '@/components/brand/production/workshop2-operational-panel-chrome';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformCorePlaceholderSurfaceDisclaimer } from '@/components/platform/PlatformCorePlaceholderSurfaceDisclaimer';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { Workshop2InvestorDemoBrief } from '@/lib/production/workshop2-investor-demo-brief';
import type { Workshop2InvestorReadinessReport } from '@/lib/production/workshop2-investor-readiness';

type ReadinessPayload = {
  ok?: boolean;
  report?: Workshop2InvestorReadinessReport;
};

/**
 * Wave D: read-only investor summary — readiness + brief в одном экране.
 * Вне Platform Core golden path (investor / demo).
 */
export default function Workshop2InvestorSummaryPage() {
  const coreMode = isPlatformCoreMode();
  const [brief, setBrief] = useState<Workshop2InvestorDemoBrief | null>(null);
  const [readiness, setReadiness] = useState<Workshop2InvestorReadinessReport | null>(null);
  const [errorRu, setErrorRu] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch('/api/workshop2/investor-demo/brief').then(async (r) =>
        r.ok ? ((await r.json()) as Workshop2InvestorDemoBrief) : null
      ),
      fetch('/api/workshop2/investor-readiness').then(async (r) => {
        if (!r.ok) return null;
        const json = (await r.json()) as ReadinessPayload;
        return json.report ?? null;
      }),
    ])
      .then(([b, rd]) => {
        if (!b && !rd) {
          setErrorRu('API недоступны — нужен dev:core или dev:e2e.');
          return;
        }
        setBrief(b);
        setReadiness(rd);
      })
      .catch(() => setErrorRu('Сервер недоступен.'));
  }, []);

  return (
    <div className={W2_OPERATIONAL_PANEL_ROOT} data-testid="workshop2-investor-summary-page">
      <header className="space-y-1">
        <h1 className="text-text-primary text-lg font-semibold">Сводка для инвестора</h1>
        <p className="text-text-secondary text-xs">
          Сводка готовности W2 + B2B только для просмотра. Не часть основного сценария Platform Core
          hub.
        </p>
      </header>

      {coreMode ? (
        <PlatformCorePlaceholderSurfaceDisclaimer
          route="/brand/production/workshop2/investor-summary"
          className="text-text-muted border-amber-200 bg-amber-50/80 rounded-md border px-3 py-2 text-xs"
        />
      ) : null}

      {errorRu ? (
        <p className="text-destructive text-sm" role="status">
          {errorRu}
        </p>
      ) : !brief && !readiness ? (
        <p className="text-muted-foreground text-sm">Загрузка…</p>
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2" data-testid="workshop2-investor-summary-badges">
            {readiness ? (
              <Badge variant={readiness.readyForInvestorDemo ? 'default' : 'outline'}>
                {readiness.readyForInvestorDemo ? 'readyForInvestorDemo' : 'не готово'}
              </Badge>
            ) : null}
            {brief ? (
              <Badge variant={brief.investorDemoReady ? 'default' : 'outline'}>
                brief {brief.investorDemoReady ? 'ready' : 'pending'}
              </Badge>
            ) : null}
            {readiness ? (
              <Badge variant="outline">PG-only {readiness.pgOnly ? 'да' : 'нет'}</Badge>
            ) : null}
            {readiness?.ss27.avgTzFillPct != null ? (
              <Badge variant="outline">SS27 fill {readiness.ss27.avgTzFillPct}%</Badge>
            ) : null}
          </div>

          {readiness ? (
            <section data-testid="workshop2-investor-summary-readiness">
              <h2 className="text-text-primary mb-1 font-medium">Readiness</h2>
              <ul className="text-text-secondary list-disc space-y-0.5 pl-5 text-xs">
                <li>Артикулов SS27: {readiness.ss27.articleCount}</li>
                <li>Unit tests: {readiness.unitTests.messageRu}</li>
                {readiness.reasons.length > 0 ? (
                  <li>Причины: {readiness.reasons.slice(0, 3).join(' · ')}</li>
                ) : (
                  <li>Блокеров readiness нет</li>
                )}
              </ul>
            </section>
          ) : null}

          {brief ? (
            <section data-testid="workshop2-investor-summary-brief-slice">
              <h2 className="text-text-primary mb-1 font-medium">Brief</h2>
              <p className="text-text-secondary text-xs">{brief.labelRu}</p>
              <p className="text-text-muted mt-1 text-[10px]">
                Parity {brief.parityNativePct}% · keys {brief.keysConfiguredCount}/{brief.keysTotal}
              </p>
            </section>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm" asChild>
              <Link href="/brand/production/workshop2/investor-brief">Полный investor brief</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="/api/workshop2/investor-demo/brief.pdf"
                data-testid="workshop2-investor-summary-pdf-link"
                download="investor-brief-platform-core.pdf"
              >
                PDF
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/platform?collection=SS27">Platform Core hub</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
