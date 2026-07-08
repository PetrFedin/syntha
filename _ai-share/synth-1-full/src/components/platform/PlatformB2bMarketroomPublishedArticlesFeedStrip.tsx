'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildPlatformB2bMarketroomSession } from '@/lib/platform-core-ports/b2b/platform-b2b-marketroom';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { ROUTES } from '@/lib/platform-core-routes';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

type ArticleRow = {
  articleId: string;
  title: string;
};

type Props = {
  collectionId: string;
  maxRows?: number;
};

function shopMatrixArticleHref(collectionId: string, articleId: string): string {
  return platformCoreUiHref(
    `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`
  );
}

function shopBuyArticleHref(collectionId: string, articleId: string): string {
  return platformCoreUiHref(
    `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}&tab=buy`
  );
}

/** PG published-articles feed with matrix/buy deep-links (Platform B2B depth). */
export function PlatformB2bMarketroomPublishedArticlesFeedStrip({
  collectionId,
  maxRows = 6,
}: Props) {
  const session = buildPlatformB2bMarketroomSession({ collectionId });
  const shopMatrixHref = platformCoreUiHref(session.shopMatrixHref);
  const shopBuyHref = platformCoreUiHref(session.shopBuyHref);
  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pgRead, setPgRead] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/published-articles`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          articles?: Array<{ articleId?: string; id?: string; title?: string; name?: string }>;
        };
        if (cancelled) return;
        if (json.ok && Array.isArray(json.articles)) {
          setPgRead(true);
          setTotal(json.articles.length);
          const mapped = json.articles.flatMap((row) => {
            const articleId = (row.articleId ?? row.id ?? '').trim();
            if (!articleId) return [];
            return [
              {
                articleId,
                title: row.title?.trim() || row.name?.trim() || articleId,
              },
            ];
          });
          setRows(mapped.slice(0, maxRows));
        } else {
          setPgRead(false);
          setTotal(0);
          setRows([]);
        }
      } catch {
        if (!cancelled) {
          setPgRead(false);
          setTotal(0);
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, maxRows]);

  return (
    <div
      className="border-border-subtle bg-bg-surface2/50 space-y-2 rounded-md border px-3 py-2 text-xs"
      data-testid="platform-b2b-marketroom-published-articles-feed-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[9px] uppercase">
          PG feed
        </Badge>
        {loading ? (
          <span className="text-text-muted">Загрузка артикулов…</span>
        ) : (
          <>
            <Badge
              variant="secondary"
              data-testid="platform-b2b-marketroom-published-articles-feed-count"
            >
              {total} published
            </Badge>
            {pgRead ? (
              <Badge variant="outline" className="text-[9px] text-emerald-800">
                API
              </Badge>
            ) : null}
          </>
        )}
        <Button size="sm" variant="ghost" className="ml-auto h-7 text-[10px]" asChild>
          <Link href={shopMatrixHref} data-testid="platform-b2b-marketroom-feed-matrix-link">
            Матрица магазина
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link href={shopBuyHref} data-testid="platform-b2b-marketroom-feed-buy-link">
            Shop buy
          </Link>
        </Button>
      </div>
      {!loading && rows.length > 0 ? (
        <ul
          className="flex flex-wrap gap-1.5"
          data-testid="platform-b2b-marketroom-published-articles-feed-list"
        >
          {rows.map((row) => (
            <li key={row.articleId}>
              <Link
                href={shopMatrixArticleHref(collectionId, row.articleId)}
                data-testid={`platform-b2b-marketroom-feed-article-${row.articleId}`}
                className="border-border-subtle hover:bg-bg-surface2/80 inline-flex items-center gap-1 rounded-md border bg-white px-2 py-1 text-[10px] font-medium"
              >
                <span className="max-w-[120px] truncate">{row.title}</span>
                <span className="text-text-muted">→ matrix</span>
              </Link>
              <Link
                href={shopBuyArticleHref(collectionId, row.articleId)}
                data-testid={`platform-b2b-marketroom-feed-buy-article-${row.articleId}`}
                className="text-accent-primary ml-1 text-[9px] hover:underline"
              >
                buy
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {!loading && total === 0 ? (
        <p
          className="text-text-muted text-[10px]"
          data-testid="platform-b2b-marketroom-published-articles-feed-empty"
        >
          Нет опубликованных артикулов — brand publish → shop showroom.
        </p>
      ) : null}
    </div>
  );
}
