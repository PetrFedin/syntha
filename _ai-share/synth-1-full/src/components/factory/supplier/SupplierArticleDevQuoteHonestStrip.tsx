'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { PLATFORM_CORE_B2B_MESSAGE_TEMPLATES } from '@/lib/communications/platform-core-b2b-message-templates';
import {
  factorySupplierMessagesWorkshop2ArticleContextHref,
  factorySupplierRfqInboxHref,
} from '@/lib/routes';
import { SUP_CM_ARTICLE_QUOTE_RFQ_INBOX_LINK_TESTID } from '@/lib/fashion/supplier-logistics-wave-vo';

/** sup-cm-article · quote card UI (не только template) на article context. */
export function SupplierArticleDevQuoteHonestStrip() {
  const demo = usePlatformCoreDemoContext();
  const { collectionId, demoArticleId: articleId, factoryId } = demo;

  const { snapshot } = usePillarSnapshot({
    collectionId,
    pillarId: 'development',
    roleId: 'supplier',
    factoryId,
  });

  const bomPreviews =
    snapshot?.pillarId === 'development' ? (snapshot.development.bomMaterialPreviews ?? []) : [];

  const quoteTemplate = PLATFORM_CORE_B2B_MESSAGE_TEMPLATES.find(
    (t) => t.id === 'article-price-quote'
  );
  const quotePreview = quoteTemplate?.buildBody({ collectionId, articleId }) ?? '';
  const rfqInboxHref = factorySupplierRfqInboxHref({ collectionId, articleId });

  if (!articleId.trim()) return null;

  return (
    <Card className="border-dashed" data-testid="sup-cm-article-quote-honest-strip">
      <CardContent className="space-y-2 px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase">
            Котировка
          </Badge>
          <span className="text-text-muted text-xs">{articleId}</span>
        </div>
        {bomPreviews.length > 0 ? (
          <ul className="text-text-secondary space-y-0.5 text-xs">
            {bomPreviews.slice(0, 3).map((line) => (
              <li key={line.name} data-testid="sup-cm-article-quote-bom-line">
                {line.name}
                {line.consumptionLabel ? ` · ${line.consumptionLabel}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted text-xs" data-testid="sup-cm-article-quote-empty-bom">
            BOM из dossier PG — уточните цену в чате.
          </p>
        )}
        <p
          className="text-text-muted line-clamp-2 text-[10px]"
          data-testid="sup-cm-article-quote-preview"
        >
          {quotePreview.slice(0, 160)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" asChild className="h-8 text-[11px]">
            <Link
              href={`${factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId)}&template=article-price-quote`}
              data-testid="sup-cm-article-quote-send-link"
            >
              Отправить котировку
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild className="h-8 text-[11px]">
            <Link href={rfqInboxHref} data-testid={SUP_CM_ARTICLE_QUOTE_RFQ_INBOX_LINK_TESTID}>
              Входящие RFQ
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
