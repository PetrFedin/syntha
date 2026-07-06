'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { fetchBrandScReleaseGateCheck } from '@/lib/production/brand-sc-release-gate-passport';
import { BRAND_LINESHEET_SYNDICATE_API_PATH } from '@/lib/production/brand-linesheet-syndication';
import { BRAND_SC_SYNDICATION_WD_PANEL_TESTID } from '@/lib/production/brand-sc-syndication-wd';

type Props = {
  collectionId: string;
  /** Пустой массив — panel сам подтянет published-articles. */
  articleIds?: string[];
  onDone?: () => void;
  panelTestId?: string;
  buttonTestId?: string;
  buttonLabelRu?: string;
  titleRu?: string;
};

/** Syndication publish → shop auto-ingest (NuORDER-style). */
export function BrandScLinesheetSyndicationPanel({
  collectionId,
  articleIds: articleIdsProp = [],
  onDone,
  panelTestId = BRAND_SC_SYNDICATION_WD_PANEL_TESTID,
  buttonTestId = 'brand-sc-linesheets-syndicate-btn',
  buttonLabelRu = 'Syndicate → магазин',
  titleRu = 'Syndication · shop auto-ingest',
}: Props) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [gateLoading, setGateLoading] = useState(true);
  const [gateBlocked, setGateBlocked] = useState(true);
  const [gateMessageRu, setGateMessageRu] = useState('');
  const [resolvedArticleIds, setResolvedArticleIds] = useState<string[]>(articleIdsProp);

  useEffect(() => {
    setResolvedArticleIds(articleIdsProp);
  }, [articleIdsProp]);

  useEffect(() => {
    if (articleIdsProp.length > 0) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/published-articles`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          articles?: Array<{ articleId?: string }>;
        };
        if (cancelled || !res.ok || !json.ok || !Array.isArray(json.articles)) return;
        setResolvedArticleIds(
          json.articles.map((a) => a.articleId?.trim()).filter(Boolean) as string[]
        );
      } catch {
        /* offline */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, articleIdsProp]);

  useEffect(() => {
    let cancelled = false;
    setGateLoading(true);
    void (async () => {
      try {
        const gate = await fetchBrandScReleaseGateCheck(collectionId);
        if (cancelled) return;
        setGateBlocked(gate.blocked);
        setGateMessageRu(gate.messageRu);
      } catch {
        if (!cancelled) {
          setGateBlocked(true);
          setGateMessageRu('Release gate: material passport — проверка недоступна.');
        }
      } finally {
        if (!cancelled) setGateLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  async function syndicate() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(BRAND_LINESHEET_SYNDICATE_API_PATH, {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId,
          articleIds: resolvedArticleIds,
          shopBuyerId: 'shop1',
          publish: resolvedArticleIds.length > 0,
        }),
      });
      const json = (await res.json()) as { messageRu?: string; code?: string };
      if (res.status === 409 && json.code === 'material_passport_release_gate') {
        setGateBlocked(true);
        setGateMessageRu(json.messageRu ?? 'Release gate: material passport не завершён.');
        setNotice(json.messageRu ?? 'Syndication заблокирован — material passport.');
      } else {
        setNotice(json.messageRu ?? (res.ok ? 'Syndication выполнен.' : 'Syndication не выполнен.'));
      }
      if (res.ok) onDone?.();
    } catch {
      setNotice('Syndication недоступен (offline).');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="border-border-subtle bg-bg-surface2/40 space-y-2 rounded-lg border px-4 py-3"
      data-testid={panelTestId}
      data-audit-legacy="brand-sc-linesheets-syndicate-panel"
    >
      <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide">{titleRu}</p>
      {!gateLoading && gateBlocked ? (
        <p
          className="rounded border border-rose-200/80 bg-rose-50/70 px-2 py-1.5 text-[10px] text-rose-950"
          data-testid="brand-sc-release-gate-block-syndicate-banner"
        >
          {gateMessageRu || 'Release gate: material passport не завершён — syndicate заблокирован.'}
        </p>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="h-8 text-[10px] font-bold uppercase"
        disabled={busy || gateLoading || gateBlocked}
        data-testid={buttonTestId}
        onClick={() => void syndicate()}
      >
        {busy ? '…' : buttonLabelRu}
      </Button>
      {notice ? (
        <p
          className="text-text-secondary text-[10px] leading-snug"
          data-testid={
            gateBlocked && notice.includes('material passport')
              ? 'brand-sc-release-gate-block-syndicate-409'
              : undefined
          }
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}
