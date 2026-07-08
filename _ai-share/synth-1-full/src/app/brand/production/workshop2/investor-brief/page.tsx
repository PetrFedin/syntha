'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { W2_OPERATIONAL_PANEL_ROOT } from '@/components/brand/production/workshop2-operational-panel-chrome';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Workshop2InvestorDemoBrief } from '@/lib/production/workshop2-investor-demo-brief';

/** Wave 58: read-only RU dashboard — данные из GET /api/workshop2/investor-demo/brief. */
export default function Workshop2InvestorBriefPage() {
  const [brief, setBrief] = useState<Workshop2InvestorDemoBrief | null>(null);
  const [errorRu, setErrorRu] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/workshop2/investor-demo/brief')
      .then(async (r) => {
        if (!r.ok) {
          setErrorRu(`API недоступен (${r.status}) — запустите dev:e2e.`);
          return;
        }
        setBrief((await r.json()) as Workshop2InvestorDemoBrief);
      })
      .catch(() => setErrorRu('Сервер недоступен — npm run dev:e2e (порт 3123).'));
  }, []);

  return (
    <div className={W2_OPERATIONAL_PANEL_ROOT} data-testid="workshop2-investor-brief-page">
      <header className="space-y-1">
        <h1 className="text-text-primary text-lg font-semibold">
          Бриф для инвестора — Workshop2 + B2B
        </h1>
        <p className="text-text-secondary text-xs">
          Read-only сводка для показа. Demo ≠ live — см. таблицу demo vs live.
        </p>
      </header>

      {errorRu ? (
        <p className="text-sm text-destructive">{errorRu}</p>
      ) : !brief ? (
        <p className="text-sm text-muted-foreground">Загрузка brief…</p>
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant={brief.investorDemoReady ? 'default' : 'outline'}>
              {brief.investorDemoReady ? 'investorDemoReady' : 'не готово'}
            </Badge>
            <Badge variant="outline">parity {brief.parityNativePct}%</Badge>
            <Badge variant="outline">
              keys {brief.keysConfiguredCount}/{brief.keysTotal}
            </Badge>
            <Badge variant="outline">unit {brief.unitTests.passing ? 'PASS' : 'FAIL'}</Badge>
          </div>

          <p className="text-text-secondary">{brief.labelRu}</p>

          <section>
            <h2 className="text-text-primary mb-2 font-medium">Probes wave54–58</h2>
            <ul className="text-text-secondary grid grid-cols-2 gap-1 text-xs sm:grid-cols-5">
              <li>w54: {brief.probes.wave54}</li>
              <li>w55: {brief.probes.wave55}</li>
              <li>w56: {brief.probes.wave56}</li>
              <li>w57: {brief.probes.wave57}</li>
              <li>w58: {brief.probes.wave58}</li>
            </ul>
          </section>

          {brief.blockingGatesRu.length > 0 && (
            <section>
              <h2 className="mb-1 font-medium text-destructive">Blocking gates (RU)</h2>
              <ul className="list-disc pl-5 text-xs">
                {brief.blockingGatesRu.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </section>
          )}

          {brief.warningsRu.length > 0 && (
            <section>
              <h2 className="mb-1 font-medium text-amber-600">Warnings (demo / live prod)</h2>
              <ul className="text-text-secondary list-disc pl-5 text-xs">
                {brief.warningsRu.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-text-primary mb-2 font-medium">Demo paths</h2>
            <ul className="space-y-1">
              {brief.demoPaths.map((p) => (
                <li key={p.id}>
                  <Link href={p.path} className="text-accent-primary underline">
                    {p.labelRu}
                  </Link>
                  <span className="ml-2 text-[10px] text-muted-foreground">{p.path}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm" asChild>
              <a
                href="/api/workshop2/investor-demo/brief.pdf"
                data-testid="brand-w2-investor-pdf-export-btn"
                download="investor-brief-platform-core.pdf"
              >
                Скачать PDF
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                href="/brand/production/workshop2/investor-summary"
                data-testid="workshop2-investor-brief-summary-link"
              >
                Сводка для инвестора
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/brand/production/workshop2?w2col=SS27">Hub SS27</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`/${brief.scriptPath}`}
                onClick={(e) => e.preventDefault()}
                title={brief.scriptPath}
              >
                Script (disk)
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
