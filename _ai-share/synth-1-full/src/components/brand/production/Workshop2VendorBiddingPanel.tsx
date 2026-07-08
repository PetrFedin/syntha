'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Workshop2VendorBid } from '@/lib/production/workshop2-dossier-phase1.types';
import { compareWorkshop2VendorBidsLowestCmt } from '@/lib/production/workshop2-vendor-bids';
import { isWorkshop2ShowVendorBiddingEnabled } from '@/lib/production/workshop2-show-heuristic-risk';

type Workshop2VendorBiddingPanelProps = {
  collectionId?: string;
  articleId?: string;
  bids?: Workshop2VendorBid[];
  hasDossierBidLink?: boolean;
  onBidsUpdate?: (bids: Workshop2VendorBid[]) => void;
};

/**
 * Wave 7 #10: vendor bids из dossier PG mirror (heuristic min CMT, без fake ML).
 */
export function Workshop2VendorBiddingPanel({
  collectionId,
  articleId,
  bids = [],
  hasDossierBidLink = false,
  onBidsUpdate,
}: Workshop2VendorBiddingPanelProps) {
  const { toast } = useToast();
  const [localBids, setLocalBids] = useState(bids);
  const [form, setForm] = useState({
    vendorId: '',
    vendorName: '',
    cmtPrice: '',
    leadTimeDays: '21',
    moq: '100',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLocalBids(bids);
  }, [bids]);

  const lowest = useMemo(() => compareWorkshop2VendorBidsLowestCmt(localBids), [localBids]);

  const biddingEnabled =
    isWorkshop2ShowVendorBiddingEnabled() &&
    Boolean(articleId?.trim()) &&
    Boolean(collectionId?.trim());

  const postBid = useCallback(async () => {
    if (!biddingEnabled || !articleId?.trim() || !collectionId?.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/vendor-bids`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorId: form.vendorId,
            vendorName: form.vendorName,
            cmtPrice: Number(form.cmtPrice),
            leadTimeDays: Number(form.leadTimeDays),
            moq: Number(form.moq),
          }),
        }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        bids?: Workshop2VendorBid[];
        messageRu?: string;
      };
      if (!json.ok) {
        toast({
          title: 'Ошибка ставки',
          description: json.messageRu,
          variant: 'destructive',
        });
        return;
      }
      const next = json.bids ?? localBids;
      setLocalBids(next);
      onBidsUpdate?.(next);
      toast({ title: 'Ставка сохранена в PG', description: json.messageRu });
    } finally {
      setBusy(false);
    }
  }, [articleId, biddingEnabled, collectionId, form, localBids, onBidsUpdate, toast]);

  if (!biddingEnabled) {
    return null;
  }

  return (
    <div
      className="border-border-default mt-4 w-full rounded-xl border bg-white p-4 shadow-sm"
      data-testid="workshop2-vendor-bidding-panel"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="bg-accent-primary/10 text-accent-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <LucideIcons.Landmark className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-text-primary text-base font-semibold">Аукцион / тендер</h2>
          <p className="text-text-secondary text-[11px]">
            Ставки в dossier.bids (PG mirror). Heuristic winner — минимальный CMT, без ML.
          </p>
          {hasDossierBidLink ? (
            <Badge variant="outline" className="mt-1 text-[10px]">
              PG link OK
            </Badge>
          ) : null}
        </div>
      </div>

      {lowest ? (
        <p className="mb-2 text-[11px] text-emerald-800">
          Мин. CMT: {lowest.vendorName} — {lowest.cmtPrice} {lowest.currency}
        </p>
      ) : null}

      <ul className="mb-3 max-h-32 space-y-1 overflow-y-auto text-[11px]">
        {localBids.length === 0 ? (
          <li className="text-text-muted">Ставок пока нет.</li>
        ) : (
          localBids.map((b) => (
            <li key={b.id} className="flex justify-between rounded border px-2 py-1">
              <span>
                {b.vendorName} · {b.cmtPrice} {b.currency}
              </span>
              <Badge variant="outline">{b.status}</Badge>
            </li>
          ))
        )}
      </ul>

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="vendorId"
          value={form.vendorId}
          onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
          className="h-8 text-[11px]"
        />
        <Input
          placeholder="Название фабрики"
          value={form.vendorName}
          onChange={(e) => setForm((f) => ({ ...f, vendorName: e.target.value }))}
          className="h-8 text-[11px]"
        />
        <Input
          placeholder="CMT price"
          value={form.cmtPrice}
          onChange={(e) => setForm((f) => ({ ...f, cmtPrice: e.target.value }))}
          className="h-8 text-[11px]"
        />
        <Input
          placeholder="leadTimeDays"
          value={form.leadTimeDays}
          onChange={(e) => setForm((f) => ({ ...f, leadTimeDays: e.target.value }))}
          className="h-8 text-[11px]"
        />
      </div>
      <Button
        type="button"
        size="sm"
        className="mt-2 h-8 text-[11px]"
        disabled={busy}
        onClick={() => void postBid()}
      >
        {busy ? '…' : 'POST bid → PG'}
      </Button>
    </div>
  );
}
