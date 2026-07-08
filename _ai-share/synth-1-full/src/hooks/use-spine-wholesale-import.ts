'use client';

import { useCallback, useState } from 'react';
import {
  importWholesaleOrdersToSpine,
  type SpineWholesaleImportPlatform,
} from '@/lib/integrations/spine/spine-wholesale-import-client';

export function useSpineWholesaleImport(platform: SpineWholesaleImportPlatform) {
  const [busy, setBusy] = useState(false);
  const [messageRu, setMessageRu] = useState<string | null>(null);
  const [lastWholesaleOrderId, setLastWholesaleOrderId] = useState<string | null>(null);

  const runImport = useCallback(async () => {
    setBusy(true);
    setMessageRu(null);
    try {
      const outcome = await importWholesaleOrdersToSpine(platform);
      setMessageRu(outcome.messageRu);
      setLastWholesaleOrderId(outcome.results[0]?.wholesaleOrderId ?? null);
      return outcome;
    } catch {
      setMessageRu(`Ошибка импорта ${platform}`);
      return { ok: false, results: [], messageRu: `Ошибка импорта ${platform}` };
    } finally {
      setBusy(false);
    }
  }, [platform]);

  return {
    busy,
    messageRu,
    lastWholesaleOrderId,
    runImport,
    clearMessage: () => setMessageRu(null),
  };
}
