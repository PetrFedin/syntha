'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import type { BrandCentricRfqQuoteCard } from '@/lib/fashion/brand-centric-rfq-quotes';
import {
  formatSupplierRfqQuoteStatusRu,
  pickSupplierRfqQuoteForSupplier,
  SUPPLIER_RFQ_DEMO_SUPPLIER_ID,
} from '@/lib/fashion/supplier-rfq-quote-card';
import {
  formatSupDevRfqQuoteAmountLineRu,
  SUP_DEV_RFQ_QUOTE_CARD_COMPARE_LINK_TESTID,
  SUP_DEV_RFQ_QUOTE_CARD_DRAFT_LINK_TESTID,
  SUP_DEV_RFQ_QUOTE_CARD_INBOX_LINK_TESTID,
  SUP_DEV_RFQ_QUOTE_CARD_PANEL_TESTID,
  SUP_DEV_RFQ_QUOTE_CARD_SEND_LINK_TESTID,
  supDevCompareSuppliersHrefsForDemo,
  supDevRfqQuoteCardCompareLinkLabelRu,
  supDevRfqQuoteCardEmptyRu,
  supDevRfqQuoteCardLoadingRu,
  supDevRfqQuoteCardMissingRu,
  supDevRfqQuoteCardTitleRu,
  supDevRfqQuoteDraftLinkLabelRu,
  supDevRfqQuoteInboxLinkLabelRu,
  supDevRfqQuoteSendChatLabelRu,
} from '@/lib/fashion/supplier-dev-wave-xd';
import {
  factorySupplierMessagesWorkshop2ArticleContextHref,
  factorySupplierRfqInboxHref,
} from '@/lib/routes';

type Props = {
  collectionId: string;
  articleId: string;
  supplierId?: string;
};

/** Карточка котировки RFQ для поставщика (RU, wave UF/VG). */
export function SupplierRfqQuoteCardPanel({
  collectionId,
  articleId,
  supplierId = SUPPLIER_RFQ_DEMO_SUPPLIER_ID,
}: Props) {
  const [quotes, setQuotes] = useState<BrandCentricRfqQuoteCard[]>([]);
  const [rfqId, setRfqId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { snapshot } = usePillarSnapshot({
    collectionId,
    pillarId: 'order_production',
    roleId: 'supplier',
    articleId,
    enabled: true,
  });

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ collectionId, articleId });
      const res = await fetch(`/api/brand/b2b/centric-rfq/quotes?${params.toString()}`, {
        cache: 'no-store',
      });
      const json = (await res.json()) as {
        ok?: boolean;
        rfqId?: string | null;
        quotes?: BrandCentricRfqQuoteCard[];
      };
      if (json.ok) {
        setRfqId(json.rfqId ?? null);
        setQuotes(json.quotes ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [articleId, collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const centricRfq = snapshot?.supplierProcurement?.procurementSpine?.centricRfq;
  const quote = useMemo(
    () => pickSupplierRfqQuoteForSupplier(quotes, supplierId),
    [quotes, supplierId]
  );
  const chatHref = `${factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId)}&template=article-price-quote`;
  const rfqHref = factorySupplierRfqInboxHref({ collectionId, articleId });
  const compareHref = supDevCompareSuppliersHrefsForDemo({
    collectionId,
    demoArticleId: articleId,
    demoOrderId: '',
    factoryId: '',
  }).materialsHref;

  if (loading) {
    return (
      <p className="text-text-muted text-xs" data-testid="sup-dev-rfq-quote-card-loading">
        {supDevRfqQuoteCardLoadingRu()}
      </p>
    );
  }

  if (!rfqId && !centricRfq?.rfqId) {
    return (
      <Card className="border-dashed" data-testid="sup-dev-rfq-quote-card-empty">
        <CardContent className="text-text-muted py-4 text-xs">
          {supDevRfqQuoteCardEmptyRu(collectionId, articleId)}
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    const activeRfqId = rfqId ?? centricRfq?.rfqId ?? '—';
    return (
      <Card className="border-dashed" data-testid="sup-dev-rfq-quote-card-missing">
        <CardContent className="space-y-2 py-4 text-xs">
          <p className="text-text-secondary">{supDevRfqQuoteCardMissingRu(activeRfqId)}</p>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
              <Link href={chatHref} data-testid={SUP_DEV_RFQ_QUOTE_CARD_DRAFT_LINK_TESTID}>
                {supDevRfqQuoteDraftLinkLabelRu()}
              </Link>
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
              <Link href={compareHref} data-testid={SUP_DEV_RFQ_QUOTE_CARD_COMPARE_LINK_TESTID}>
                {supDevRfqQuoteCardCompareLinkLabelRu()}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="border-amber-200/70 bg-amber-50/20"
      data-testid={SUP_DEV_RFQ_QUOTE_CARD_PANEL_TESTID}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{supDevRfqQuoteCardTitleRu()}</CardTitle>
        <CardDescription className="font-mono text-[10px]">{quote.quoteId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[9px]">
            {formatSupplierRfqQuoteStatusRu(quote.status)}
          </Badge>
          <span className="text-text-muted">{quote.supplierName}</span>
        </div>
        <p data-testid={`sup-dev-rfq-quote-card-${quote.supplierId}`}>
          {formatSupDevRfqQuoteAmountLineRu(quote.amountRub, quote.currency, quote.leadTimeDays)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
            <Link href={chatHref} data-testid={SUP_DEV_RFQ_QUOTE_CARD_SEND_LINK_TESTID}>
              {supDevRfqQuoteSendChatLabelRu()}
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
            <Link href={rfqHref} data-testid={SUP_DEV_RFQ_QUOTE_CARD_INBOX_LINK_TESTID}>
              {supDevRfqQuoteInboxLinkLabelRu()}
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
            <Link href={compareHref} data-testid={SUP_DEV_RFQ_QUOTE_CARD_COMPARE_LINK_TESTID}>
              {supDevRfqQuoteCardCompareLinkLabelRu()}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
