'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useArticleEligibleGate } from '@/hooks/use-article-eligible-gate';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

type Props = {
  /** When set — compact strip on article dossier (столп 1 development). */
  collectionId?: string;
  articleId?: string;
  compact?: boolean;
};

/** Wave B1 · Centric style → external ref → eligible gate. */
export function BrandCentricStyleImportPanel({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
  articleId = PLATFORM_CORE_DEMO.demoArticleId,
  compact = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const { gate, loadState } = useArticleEligibleGate(collectionId, articleId, true, reloadNonce);

  const importStyle = async (lifecycleState: 'Approved' | 'Draft') => {
    setBusy(true);
    setMsg(null);
    try {
      const styleId = `CENTRIC-${articleId}-${lifecycleState}`;
      const res = await fetch('/api/integrations/v1/centric/styles/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleId,
          styleCode: articleId,
          lifecycleState,
          collectionId,
          articleId,
        }),
      });
      const json = (await res.json()) as {
        data?: { eligibleForCollection?: boolean; articleId?: string };
      };
      if (!res.ok) {
        setMsg('Ошибка импорта PLM');
        return;
      }
      setMsg(
        lifecycleState === 'Approved'
          ? `PLM Approved → eligible для ${json.data?.articleId ?? articleId}`
          : `PLM Draft импортирован (не eligible)`
      );
      setReloadNonce((n) => n + 1);
    } catch {
      setMsg('Ошибка сети');
    } finally {
      setBusy(false);
    }
  };

  if (compact) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 px-1 text-xs"
        data-testid="brand-dev-centric-eligible-strip"
      >
        <Badge variant="outline" className="text-[9px]">
          PLM · мастер-данные
        </Badge>
        {loadState === 'ready' && gate ? (
          <Badge
            variant={gate.eligibleForCollection ? 'secondary' : 'outline'}
            className="text-[9px]"
            data-testid="brand-dev-centric-eligible-badge"
          >
            {gate.eligibleForCollection ? 'Eligible' : 'Not eligible'}
          </Badge>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-6 text-[9px]"
          disabled={busy}
          data-testid="brand-dev-centric-import-approved-btn"
          onClick={() => void importStyle('Approved')}
        >
          {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          Import Approved
        </Button>
        <Link
          href={ROUTES.brand.integrationsCentric}
          className="text-accent-primary hover:underline"
        >
          PLM →
        </Link>
        {msg ? <span className="text-text-muted text-[9px]">{msg}</span> : null}
      </div>
    );
  }

  return (
    <Card data-testid="brand-centric-plm-panel">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
          <Database className="h-4 w-4" /> PLM · импорт стиля
        </CardTitle>
        <CardDescription>
          Lifecycle Approved → eligible для витрины и матрицы (столп 1 → 2 → 3).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-text-secondary text-xs">
          <span className="font-mono">{collectionId}</span> /{' '}
          <span className="font-mono">{articleId}</span>
        </div>
        {loadState === 'ready' && gate ? (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={gate.eligibleForCollection ? 'secondary' : 'outline'}
              data-testid="brand-centric-eligible-status"
            >
              {gate.eligibleForCollection ? 'Eligible for collection' : 'Not eligible'}
            </Badge>
            {gate.sources.map((s) => (
              <Badge key={s} variant="outline" className="text-[9px]">
                {s}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy} onClick={() => void importStyle('Approved')}>
            {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            Import Approved style
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => void importStyle('Draft')}
          >
            Import Draft (no eligible)
          </Button>
          <Link href={brandShowroomHref(collectionId)}>
            <Button size="sm" variant="ghost">
              Витрина →
            </Button>
          </Link>
        </div>
        {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
      </CardContent>
    </Card>
  );
}

function brandShowroomHref(collectionId: string): string {
  return `${ROUTES.brand.showroom}?collection=${encodeURIComponent(collectionId)}`;
}
