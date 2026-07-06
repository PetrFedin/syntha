'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { isWorkshop2InvestorDemoModeEnabled } from '@/lib/production/workshop2-investor-demo-mode';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

type BriefSlice = {
  investorDemoReady?: boolean;
  failingAutoGatesRu?: string[];
  blockingGatesRu?: string[];
  probes?: { wave58?: number };
};

/** Hub banner: режим демо инвестора + ссылка на brief (Wave 58). */
export function Workshop2InvestorDemoHubBanner() {
  const [brief, setBrief] = useState<BriefSlice | null>(null);
  const demoEnv =
    typeof window !== 'undefined' &&
    (isWorkshop2InvestorDemoModeEnabled() ||
      String(process.env.NEXT_PUBLIC_WORKSHOP2_INVESTOR_DEMO_MODE ?? '').toLowerCase() === 'true');

  useEffect(() => {
    void fetch('/api/workshop2/investor-demo/brief')
      .then(async (r) => {
        if (!r.ok) return null;
        return (await r.json()) as BriefSlice | null;
      })
      .then((json) => setBrief(json))
      .catch(() => setBrief(null));
  }, []);

  if (isPlatformCoreMode()) return null;

  if (!demoEnv && !brief) return null;

  const ready = brief?.investorDemoReady === true;
  const failing = brief?.blockingGatesRu ?? brief?.failingAutoGatesRu ?? [];

  return (
    <div
      className="border-border-default bg-bg-surface2 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm"
      data-testid="workshop2-investor-demo-hub-banner"
    >
      <div>
        <p className="text-text-primary font-semibold">Режим демо инвестора</p>
        <p className="text-text-secondary text-xs">
          {ready
            ? 'Auto-gates PASS — можно вести показ по INVESTOR-DEMO-SCRIPT-RU.md.'
            : `Донастройка: ${failing.slice(0, 2).join(' · ') || 'см. brief API'}`}
          {brief?.probes?.wave58 != null ? ` · Wave58 probe ${brief.probes.wave58}/12+` : null}
        </p>
      </div>
      <Link
        href="/brand/production/workshop2/investor-brief"
        className="text-accent-primary text-xs font-bold uppercase tracking-wide underline"
      >
        Бриф для инвестора →
      </Link>
      <Link
        href="/brand/production/workshop2/investor-summary"
        className="text-accent-primary text-xs font-bold uppercase tracking-wide underline"
        data-testid="workshop2-investor-demo-hub-summary-link"
      >
        Summary →
      </Link>
    </div>
  );
}
