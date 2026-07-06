'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LocalOrderLine } from '@/lib/production/local-collection-inventory';
import {
  loadCollectionInventoryOverlayWithMode,
  saveCollectionInventoryOverlay,
  type CollectionInventoryOverlayDoc,
  type CollectionInventoryOverlayLoadResult,
} from '@/lib/production/collection-inventory-overlay-store';

export function useBrandProductionCollectionInventoryOverlay(collectionId: string) {
  const [loaded, setLoaded] = useState<CollectionInventoryOverlayLoadResult>({
    doc: { v: 1, articles: [] },
    persistMode: 'localStorage',
    pgUnavailable: false,
  });
  const [hydrated, setHydrated] = useState(false);

  const reload = useCallback(async () => {
    const next = await loadCollectionInventoryOverlayWithMode(collectionId);
    setLoaded(next);
    setHydrated(true);
    return next;
  }, [collectionId]);

  useEffect(() => {
    let cancelled = false;
    void loadCollectionInventoryOverlayWithMode(collectionId).then((next) => {
      if (cancelled) return;
      setLoaded(next);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  const setOverlayDoc = useCallback((doc: CollectionInventoryOverlayDoc) => {
    setLoaded((prev) => ({ ...prev, doc }));
  }, []);

  const updateOverlayArticles = useCallback(
    (updater: (prev: LocalOrderLine[]) => LocalOrderLine[]) => {
      setLoaded((prev) => {
        const nextDoc: CollectionInventoryOverlayDoc = {
          v: 1,
          articles: updater(prev.doc.articles),
        };
        void saveCollectionInventoryOverlay(collectionId, nextDoc);
        return { ...prev, doc: nextDoc };
      });
    },
    [collectionId]
  );

  return {
    overlayDoc: loaded.doc,
    overlayArticles: loaded.doc.articles,
    persistMode: loaded.persistMode,
    pgUnavailable: loaded.pgUnavailable,
    overlayHydrated: hydrated,
    reload,
    setOverlayDoc,
    updateOverlayArticles,
  };
}
