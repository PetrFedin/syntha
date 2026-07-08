'use client';

import { useEffect, useState } from 'react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

export type Workshop2B2bDossierEditLock = {
  locked: boolean;
  messageRu: string | null;
  orderId: string | null;
};

/** PG handoff lock — read-only ТЗ в platform core после передачи в цех. */
export function useWorkshop2B2bDossierEditLock(
  collectionId: string,
  articleId: string
): Workshop2B2bDossierEditLock {
  const [state, setState] = useState<Workshop2B2bDossierEditLock>({
    locked: false,
    messageRu: null,
    orderId: null,
  });

  useEffect(() => {
    if (!isPlatformCoreMode() || !collectionId || !articleId) {
      setState({ locked: false, messageRu: null, orderId: null });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/dossier`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          b2bEditLock?: { locked?: boolean; messageRu?: string; orderId?: string };
        };
        if (cancelled || !json.ok) return;
        const lock = json.b2bEditLock;
        if (lock?.locked) {
          setState({
            locked: true,
            messageRu: lock.messageRu ?? `ТЗ зафиксировано · заказ ${lock.orderId ?? ''}`.trim(),
            orderId: lock.orderId ?? null,
          });
        } else {
          setState({ locked: false, messageRu: null, orderId: null });
        }
      } catch {
        if (!cancelled) setState({ locked: false, messageRu: null, orderId: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, articleId]);

  return state;
}
