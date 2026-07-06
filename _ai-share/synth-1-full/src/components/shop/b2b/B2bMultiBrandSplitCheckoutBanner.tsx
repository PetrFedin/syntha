'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { summarizeWorkshop2B2bMixedBrandCheckoutRu } from '@/lib/production/workshop2-b2b-wave23-parity';

type CartLineLike = {
  brandId?: string;
  collectionId?: string;
  name?: string;
  sku?: string;
};

type SplitSession = {
  brandId: string;
  sessionId: string;
  lines: Array<{ articleId?: string; qty?: number }>;
};

/**
 * Wave 33: checkout banner when cart spans 2+ brands — split into separate sessions.
 */
export function B2bMultiBrandSplitCheckoutBanner({ lines }: { lines: CartLineLike[] }) {
  const [splitSessions, setSplitSessions] = useState<SplitSession[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorRu, setErrorRu] = useState<string | null>(null);

  const summary = useMemo(
    () =>
      summarizeWorkshop2B2bMixedBrandCheckoutRu({
        lines: lines.map((l) => ({
          brandId: l.brandId,
          collectionId: l.collectionId ?? 'SS27',
        })),
      }),
    [lines]
  );

  const onSplit = useCallback(async () => {
    setBusy(true);
    setErrorRu(null);
    try {
      const res = await fetch('/api/shop/b2b/cart/split-by-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        messageRu?: string;
        sessions?: SplitSession[];
      };
      if (!res.ok || !json.ok) {
        setErrorRu(json.messageRu ?? 'Не удалось разделить корзину.');
        return;
      }
      setSplitSessions(json.sessions ?? null);
    } catch {
      setErrorRu('Сеть недоступна — повторите позже.');
    } finally {
      setBusy(false);
    }
  }, []);

  if (!summary.mixed && !splitSessions?.length) return null;

  return (
    <div
      className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      data-testid="shop-b2b-checkout-multi-brand-split"
      role="status"
    >
      <p className="font-semibold">{summary.headlineRu}</p>
      <p className="mt-1 text-[12px] text-amber-900/90">
        Бренды: {summary.brandIds.join(', ')}. Оформление одним заказом заблокировано (409) — оформите
        каждый бренд отдельно после разделения.
      </p>

      {splitSessions?.length ? (
        <ul className="mt-3 space-y-2 text-[12px]" data-testid="shop-b2b-split-sessions-list">
          {splitSessions.map((s) => (
            <li
              key={s.sessionId}
              className="rounded border border-amber-200 bg-white/80 px-2 py-1.5"
            >
              <span className="font-medium">{s.brandId}</span>
              <span className="text-amber-800/80">
                {' '}
                — {s.lines.length} строк · session {s.sessionId.slice(0, 32)}…
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 border-amber-400 bg-white hover:bg-amber-100"
          disabled={busy}
          onClick={() => void onSplit()}
          data-testid="shop-b2b-checkout-split-by-brand"
        >
          {busy ? 'Разделение…' : 'Разделить по брендам'}
        </Button>
      )}

      {errorRu ? (
        <p className="mt-2 text-[11px] text-rose-800" data-testid="shop-b2b-split-error">
          {errorRu}
        </p>
      ) : null}
    </div>
  );
}
