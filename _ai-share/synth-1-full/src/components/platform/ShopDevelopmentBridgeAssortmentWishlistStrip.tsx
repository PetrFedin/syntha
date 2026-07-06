'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { ROUTES } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import {
  addShopBuyerAssortmentWishlist,
  fetchShopBuyerAssortmentWishlist,
  removeShopBuyerAssortmentWishlist,
  requestShopDevelopmentSample,
  type ShopBuyerAssortmentWishlistEntry,
} from '@/lib/platform-core-ports/legacy/shop/shop-buyer-assortment-wishlist-client';

type Props = {
  collectionId: string;
  defaultArticleId?: string;
};

/** Shop dev bridge · PG wishlist ассортимента (не редактирование ТЗ). */
export function ShopDevelopmentBridgeAssortmentWishlistStrip({
  collectionId,
  defaultArticleId = 'demo-ss27-01',
}: Props) {
  const { buyerId } = useShopCoreBuyerId();
  const [items, setItems] = useState<ShopBuyerAssortmentWishlistEntry[]>([]);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [articleId, setArticleId] = useState(defaultArticleId);
  const [busy, setBusy] = useState(false);
  const [sampleMsg, setSampleMsg] = useState<string | null>(null);
  const [listErrorRu, setListErrorRu] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setListErrorRu(null);
    const { items: next, storageMode: mode } = await fetchShopBuyerAssortmentWishlist({
      buyerId,
      collectionId,
    });
    setItems(next);
    setStorageMode(mode ?? null);
  }, [buyerId, collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addArticle = async () => {
    const aid = articleId.trim();
    if (!aid) return;
    setBusy(true);
    setListErrorRu(null);
    try {
      const result = await addShopBuyerAssortmentWishlist({
        buyerId,
        collectionId,
        articleId: aid,
      });
      if (!result.ok) {
        setListErrorRu('Не удалось добавить в wishlist.');
        return;
      }
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const removeArticle = async (aid: string) => {
    setBusy(true);
    setListErrorRu(null);
    try {
      const result = await removeShopBuyerAssortmentWishlist({
        buyerId,
        collectionId,
        articleId: aid,
      });
      if (!result.ok) {
        setListErrorRu('Не удалось удалить из wishlist.');
        return;
      }
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const requestSample = async (aid: string) => {
    setSampleMsg(null);
    setBusy(true);
    try {
      const { messageRu } = await requestShopDevelopmentSample({
        buyerId,
        collectionId,
        articleId: aid,
      });
      setSampleMsg(messageRu ?? 'Запрос отправлен.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="border-border-subtle space-y-2 rounded-lg border bg-bg-surface2/30 px-3 py-2"
      data-testid="shop-dev-bridge-assortment-wishlist-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">
          Wishlist ассортимента
        </span>
        {storageMode === 'postgres' ? (
          <Badge variant="outline" className="text-[9px]" data-testid="shop-dev-bridge-wishlist-storage-pg">
            PG wishlist
          </Badge>
        ) : null}
        <Badge variant="secondary" className="text-[9px]">
          {items.length} арт.
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={articleId}
          onChange={(e) => setArticleId(e.target.value)}
          className="h-8 max-w-[180px] text-xs"
          placeholder="articleId"
          data-testid="shop-dev-bridge-wishlist-article-input"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          data-testid="shop-dev-bridge-wishlist-add-btn"
          onClick={() => void addArticle()}
        >
          Добавить
        </Button>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1 text-[11px]" data-testid="shop-dev-bridge-wishlist-list">
          {items.slice(0, 6).map((item) => (
            <li key={item.articleId} className="flex flex-wrap items-center gap-2">
              <span className="font-mono">{item.articleId}</span>
              {item.addedAt ? (
                <span className="text-text-muted text-[10px]" data-testid={`shop-dev-bridge-wishlist-added-${item.articleId}`}>
                  {new Date(item.addedAt).toLocaleDateString('ru-RU')}
                </span>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[10px]"
                disabled={busy}
                data-testid={`shop-dev-bridge-request-sample-${item.articleId}`}
                onClick={() => void requestSample(item.articleId)}
              >
                Запросить образец
              </Button>
              <Link
                href={platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(item.articleId)}`)}
                className={hubGadget.goldenLink}
                data-testid={`shop-dev-bridge-wishlist-matrix-${item.articleId}`}
              >
                Матрица
              </Link>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[10px] text-text-muted"
                disabled={busy}
                data-testid={`shop-dev-bridge-wishlist-remove-${item.articleId}`}
                onClick={() => void removeArticle(item.articleId)}
              >
                Убрать
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-muted text-[11px]">Пусто — добавьте артикул для отслеживания.</p>
      )}
      {listErrorRu ? (
        <p className="text-destructive text-[11px]" data-testid="shop-dev-bridge-wishlist-error">
          {listErrorRu}
        </p>
      ) : null}
      {sampleMsg ? (
        <p className="text-emerald-800 text-[11px]" data-testid="shop-dev-bridge-request-sample-wishlist-msg">
          {sampleMsg}
        </p>
      ) : null}
    </div>
  );
}
