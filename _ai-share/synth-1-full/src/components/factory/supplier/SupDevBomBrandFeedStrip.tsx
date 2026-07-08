'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildBrandSupplierBomSession } from '@/lib/fashion/brand-supplier-bom-workspace';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { RefreshCw } from 'lucide-react';

type Props = {
  collectionId: string;
  articleId: string;
};

/** Supplier dev BOM · PG feed from brand supplier-bom API (не только peer link). */
export function SupDevBomBrandFeedStrip({ collectionId, articleId }: Props) {
  const session = buildBrandSupplierBomSession({ collectionId, articleId });
  const [lineCount, setLineCount] = useState<number | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brand/merch/supplier-bom', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionId, articleId }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        rows?: unknown[];
        summary?: { total?: number };
        storageMode?: string;
      };
      if (!res.ok || !json.ok) {
        setLineCount(null);
        setStorageMode(null);
      } else {
        setLineCount(json.summary?.total ?? json.rows?.length ?? 0);
        setStorageMode(json.storageMode ?? null);
      }
    } catch {
      setLineCount(null);
      setStorageMode(null);
    } finally {
      setLoading(false);
    }
  }, [collectionId, articleId]);

  useEffect(() => {
    void reload();
  }, [reload, refreshNonce]);

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid="sup-dev-bom-brand-feed-strip"
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        Brand BOM PG
      </Badge>
      {loading ? (
        <span className="text-text-secondary">Загрузка BOM feed…</span>
      ) : lineCount != null ? (
        <>
          <Badge variant="secondary" data-testid="sup-dev-bom-brand-feed-count">
            {lineCount} lines
          </Badge>
          {storageMode ? (
            <Badge
              variant="outline"
              className="text-[9px]"
              data-testid="sup-dev-bom-brand-feed-source"
            >
              {storageMode}
            </Badge>
          ) : null}
        </>
      ) : (
        <span className="text-text-secondary">BOM feed недоступен</span>
      )}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 text-[10px]"
        data-testid="sup-dev-bom-brand-feed-refresh"
        onClick={() => setRefreshNonce((n) => n + 1)}
      >
        <RefreshCw className="mr-1 h-3 w-3" aria-hidden />
        Обновить
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
        <Link href={session.bomHref} data-testid="sup-dev-bom-brand-peer-link">
          Brand BOM workspace
        </Link>
      </Button>
      <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
        <Link href={session.procurementHref} data-testid="sup-dev-bom-brand-procurement-link">
          Procurement
        </Link>
      </Button>
    </div>
  );
}
