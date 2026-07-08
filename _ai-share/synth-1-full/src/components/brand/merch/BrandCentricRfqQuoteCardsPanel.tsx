'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  pickAcceptedBrandCentricRfqQuote,
  summarizeBrandCentricRfqQuotes,
} from '@/lib/fashion/brand-centric-rfq-quotes';
import {
  awardBrandCentricRfqQuote,
  fetchBrandCentricRfqQuotes,
} from '@/lib/fashion/brand-centric-rfq-quotes-store';
import { supplierMrpSupplyFeatureHref } from '@/lib/fashion/supplier-mrp-supply';
import { brandMessagesWorkshop2ArticleContextHref } from '@/lib/routes';
import { Loader2, Trophy } from 'lucide-react';

type Props = {
  collectionId: string;
  articleId: string;
  rfqId?: string;
};

export function BrandCentricRfqQuoteCardsPanel({ collectionId, articleId, rfqId }: Props) {
  const [busyQuoteId, setBusyQuoteId] = useState<string | null>(null);
  const [resolvedRfqId, setResolvedRfqId] = useState<string | null>(rfqId ?? null);
  const [quotes, setQuotes] = useState<
    Awaited<ReturnType<typeof fetchBrandCentricRfqQuotes>>['quotes']
  >([]);
  const [storageMode, setStorageMode] = useState<string>('demo');

  const reload = useCallback(async () => {
    const res = await fetchBrandCentricRfqQuotes({
      rfqId,
      collectionId,
      articleId,
    });
    setResolvedRfqId(res.rfqId);
    setQuotes(res.quotes);
    setStorageMode(res.storageMode ?? 'demo');
  }, [articleId, collectionId, rfqId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const summary = useMemo(() => summarizeBrandCentricRfqQuotes(quotes), [quotes]);
  const accepted = useMemo(() => pickAcceptedBrandCentricRfqQuote(quotes), [quotes]);
  const rfqThreadHref = `${brandMessagesWorkshop2ArticleContextHref(collectionId, articleId)}&q=${encodeURIComponent('Centric RFQ award')}`;
  const mrpHref = supplierMrpSupplyFeatureHref(collectionId, articleId);

  const award = async (quoteId: string) => {
    if (!resolvedRfqId) return;
    setBusyQuoteId(quoteId);
    try {
      const res = await awardBrandCentricRfqQuote({ rfqId: resolvedRfqId, quoteId });
      if (res.ok) {
        setQuotes(res.quotes);
        setStorageMode(res.storageMode ?? storageMode);
      }
    } finally {
      setBusyQuoteId(null);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-centric-rfq-quote-cards-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Quotes: {summary.total}</Badge>
        <Badge variant="outline">Pending: {summary.pending}</Badge>
        {accepted ? (
          <Badge
            className="border-emerald-300 bg-emerald-50 text-emerald-800"
            data-testid="brand-centric-rfq-quote-awarded-badge"
          >
            Awarded · {accepted.supplierName}
          </Badge>
        ) : null}
        <Badge variant="outline" data-testid={`brand-centric-rfq-quotes-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG quotes' : `${storageMode} quotes`}
        </Badge>
        <Button size="sm" variant="outline" type="button" onClick={() => void reload()}>
          Refresh
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={rfqThreadHref}>RFQ comms</Link>
        </Button>
        {accepted ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href={mrpHref}>Supplier MRP</Link>
          </Button>
        ) : null}
      </div>

      {!resolvedRfqId ? (
        <Card className="border-dashed">
          <CardContent className="text-text-muted py-6 text-sm">
            Нет RFQ для {collectionId}:{articleId} — сначала импортируйте RFQ выше.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2" data-testid="brand-centric-rfq-quote-cards-grid">
          {quotes.map((quote) => {
            const isAccepted = quote.status === 'accepted';
            const isRejected = quote.status === 'rejected';
            return (
              <Card
                key={quote.quoteId}
                className={
                  isAccepted
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : isRejected
                      ? 'opacity-60'
                      : 'border-amber-200/70 bg-amber-50/20'
                }
                data-testid={`brand-centric-rfq-quote-card-${quote.supplierId}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {isAccepted ? (
                      <Trophy className="h-4 w-4 text-emerald-700" aria-hidden />
                    ) : null}
                    {quote.supplierName}
                  </CardTitle>
                  <CardDescription className="font-mono text-[10px]">
                    {quote.quoteId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-text-muted text-xs uppercase">Сумма</span>
                    <br />
                    <span className="font-semibold">
                      {quote.amountRub.toLocaleString('ru-RU')} {quote.currency}
                    </span>
                  </p>
                  <p>
                    <span className="text-text-muted text-xs uppercase">Lead time</span>
                    <br />
                    {quote.leadTimeDays} дн.
                  </p>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {quote.status}
                  </Badge>
                  {quote.status === 'pending' ? (
                    <Button
                      size="sm"
                      type="button"
                      disabled={busyQuoteId != null}
                      onClick={() => void award(quote.quoteId)}
                      data-testid={`brand-centric-rfq-quote-award-${quote.supplierId}`}
                    >
                      {busyQuoteId === quote.quoteId ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : null}
                      Award
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
