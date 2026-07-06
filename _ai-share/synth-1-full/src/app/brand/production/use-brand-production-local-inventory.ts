'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  exportInventoryJson,
  loadLocalCollectionInventory,
  mergeImportInventories,
  parseInventoryImportJson,
  registerUserCollection,
  saveLocalCollectionInventory,
  type LocalCollectionInventory,
} from '@/lib/production/local-collection-inventory';
import { shouldUseLocalStorageClientFallbackInCore } from '@/lib/production/workshop2-pg-read-path-policy';

function emptyLocalCollectionInventory(): LocalCollectionInventory {
  return {
    v: 1,
    articlesByCollection: {},
    userCollections: [],
    archivedUserCollections: [],
  };
}

export type ImportLocalInventoryResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/** Локальный инвентарь коллекций: `localStorage`, автосохранение, создание коллекции, импорт/экспорт JSON. */
export function useBrandProductionLocalInventory() {
  const router = useRouter();
  const [localInventory, setLocalInventory] = useState<LocalCollectionInventory>(
    emptyLocalCollectionInventory
  );
  const [localInventoryHydrated, setLocalInventoryHydrated] = useState(false);

  useEffect(() => {
    if (!shouldUseLocalStorageClientFallbackInCore()) {
      setLocalInventoryHydrated(true);
      return;
    }
    setLocalInventory(loadLocalCollectionInventory());
    setLocalInventoryHydrated(true);
  }, []);

  useEffect(() => {
    if (!shouldUseLocalStorageClientFallbackInCore()) return;
    saveLocalCollectionInventory(localInventory);
  }, [localInventory]);

  const pushUserCollection = useCallback(
    (rawId: string, displayName: string) => {
      const idRef = { current: '' };
      setLocalInventory((prev) => {
        const { inventory, id } = registerUserCollection(prev, rawId, displayName);
        idRef.current = id;
        return inventory;
      });
      queueMicrotask(() => {
        router.push(`/brand/production?collectionId=${encodeURIComponent(idRef.current)}`);
      });
    },
    [router]
  );

  const exportLocalInventory = useCallback(() => {
    if (typeof document === 'undefined') return;
    const blob = new Blob([exportInventoryJson(localInventory)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-local-inventory-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [localInventory]);

  const importLocalInventory = useCallback(
    (jsonText: string, replaceAll: boolean): ImportLocalInventoryResult => {
      const parsed = parseInventoryImportJson(jsonText);
      if (!parsed) {
        return { ok: false, message: 'Файл не похож на валидный экспорт (v1).' };
      }
      if (replaceAll) {
        setLocalInventory(parsed);
        return {
          ok: true,
          message: 'Данные заменены целиком. Обновите при необходимости flow по коллекциям.',
        };
      }
      setLocalInventory((base) => mergeImportInventories(base, parsed));
      return { ok: true, message: 'Импорт объединён с текущими черновиками.' };
    },
    []
  );

  return {
    localInventory,
    setLocalInventory,
    localInventoryHydrated,
    pushUserCollection,
    exportLocalInventory,
    importLocalInventory,
  };
}
