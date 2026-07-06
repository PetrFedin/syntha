'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ProductionPageOrderLike } from '@/app/brand/production/production-page-build-items-for-collection';
import { getProductionDataPort } from '@/lib/production-data';
import { STAGES_SKU_PARAM } from '@/lib/production/stages-url';
import {
  buildLocalDraftArticle,
  normalizeLocalSkuCode,
  removeArticleFromInventory,
  removeUserCollectionFromInventory,
  storageKeyForCollectionId,
  type LocalCollectionInventory,
  type LocalOrderLine,
} from '@/lib/production/local-collection-inventory';
import {
  removeSkuFromUnifiedDoc,
  type CollectionSkuFlowDoc,
} from '@/lib/production/unified-sku-flow-store';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

export function useBrandProductionLocalArticles({
  collectionIdFromQuery,
  collectionFlowKey,
  itemsForCollection,
  localInventory,
  setLocalInventory,
  setUnifiedDoc,
  pendingFocusLocalSkuRef,
  updateOverlayArticles,
}: {
  collectionIdFromQuery: string;
  collectionFlowKey: string;
  itemsForCollection: readonly ProductionPageOrderLike[];
  localInventory: LocalCollectionInventory;
  setLocalInventory: Dispatch<SetStateAction<LocalCollectionInventory>>;
  setUnifiedDoc: Dispatch<SetStateAction<CollectionSkuFlowDoc>>;
  pendingFocusLocalSkuRef: MutableRefObject<string | null>;
  updateOverlayArticles?: (updater: (prev: LocalOrderLine[]) => LocalOrderLine[]) => void;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams() ?? new URLSearchParams();

  const isLocalSkuDuplicate = useCallback(
    (raw: string) => {
      const n = normalizeLocalSkuCode(raw);
      if (n.length < 2) return false;
      return (itemsForCollection as { sku?: string; id?: string }[]).some(
        (it) => normalizeLocalSkuCode(String(it.sku ?? it.id ?? '')) === n
      );
    },
    [itemsForCollection]
  );

  const pushLocalArticle = useCallback(
    (skuCode: string, displayName?: string) => {
      if (isLocalSkuDuplicate(skuCode)) return false;
      const key = storageKeyForCollectionId(collectionIdFromQuery);
      const draft = buildLocalDraftArticle(collectionIdFromQuery, skuCode, displayName, {
        investorDemo: collectionIdFromQuery === 'Investor',
      });
      pendingFocusLocalSkuRef.current = draft.id;
      if (isPlatformCoreMode() && updateOverlayArticles) {
        updateOverlayArticles((articles) => [...articles, draft]);
      } else {
        setLocalInventory((inv) => ({
          ...inv,
          articlesByCollection: {
            ...inv.articlesByCollection,
            [key]: [...(inv.articlesByCollection[key] ?? []), draft],
          },
        }));
      }
      return true;
    },
    [
      collectionIdFromQuery,
      isLocalSkuDuplicate,
      pendingFocusLocalSkuRef,
      setLocalInventory,
      updateOverlayArticles,
    ]
  );

  const removeLocalArticle = useCallback(
    (articleId: string) => {
      const key = storageKeyForCollectionId(collectionIdFromQuery);
      if (isPlatformCoreMode() && updateOverlayArticles) {
        updateOverlayArticles((articles) => articles.filter((row) => row.id !== articleId));
      } else {
        setLocalInventory((inv) => removeArticleFromInventory(inv, key, articleId));
      }
      setUnifiedDoc((d) => {
        const next = removeSkuFromUnifiedDoc(d, articleId);
        void getProductionDataPort().saveSkuFlow(collectionFlowKey, next);
        return next;
      });
      const cur = searchParams.get('stagesSku');
      if (cur === articleId) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('stagesSku');
        const q = params.toString();
        router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
      }
    },
    [
      collectionFlowKey,
      collectionIdFromQuery,
      pathname,
      router,
      searchParams,
      setLocalInventory,
      setUnifiedDoc,
      updateOverlayArticles,
    ]
  );

  const removeCurrentUserCollection = useCallback(() => {
    const cid = collectionIdFromQuery.trim();
    if (!cid) return;
    if (!localInventory.userCollections.some((c) => c.id === cid)) return;
    const toRemove = localInventory.articlesByCollection[cid] ?? [];
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        `Удалить локальную коллекцию «${cid}» и все её артикулы (${toRemove.length} шт.)? Это действие нельзя отменить.`
      )
    )
      return;
    setLocalInventory((inv) => removeUserCollectionFromInventory(inv, cid));
    setUnifiedDoc((d) => {
      let next = d;
      for (const row of toRemove) {
        next = removeSkuFromUnifiedDoc(next, row.id);
      }
      void getProductionDataPort().saveSkuFlow(collectionFlowKey, next);
      return next;
    });
    router.push('/brand/production');
  }, [
    collectionFlowKey,
    collectionIdFromQuery,
    localInventory.articlesByCollection,
    localInventory.userCollections,
    router,
    setLocalInventory,
    setUnifiedDoc,
  ]);

  return {
    isLocalSkuDuplicate,
    pushLocalArticle,
    removeLocalArticle,
    removeCurrentUserCollection,
  };
}
