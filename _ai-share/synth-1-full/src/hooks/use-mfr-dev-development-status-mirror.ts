'use client';

import { useEffect, useState } from 'react';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

type Step = { id: string; labelRu: string; done: boolean };

type Result = {
  steps: Step[];
  articleCount: number;
  sampleQueueCount: number;
  loading: boolean;
  pgReachable: boolean;
};

/** PG mirror of brand development-status for mfr dev cabinet (Wave VL). */
export function useMfrDevDevelopmentStatusMirror(
  collectionId: string,
  factoryId: string | undefined,
  reloadNonce = 0
): Result {
  const [steps, setSteps] = useState<Step[]>([]);
  const [articleCount, setArticleCount] = useState(0);
  const [sampleQueueCount, setSampleQueueCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pgReachable, setPgReachable] = useState(false);
  const core = isPlatformCoreMode();

  useEffect(() => {
    const cid = collectionId.trim();
    if (!cid || !core) {
      setSteps([]);
      setArticleCount(0);
      setSampleQueueCount(0);
      setPgReachable(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const qs = new URLSearchParams({ skipRangePlanner: '1' });
        if (factoryId?.trim()) qs.set('factoryId', factoryId.trim());
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(cid)}/development-status?${qs.toString()}`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          status?: {
            steps?: Step[];
            articleCount?: number;
            sampleQueueCount?: number;
          };
        };
        if (cancelled) return;
        if (json.ok && json.status) {
          setSteps(Array.isArray(json.status.steps) ? json.status.steps : []);
          setArticleCount(json.status.articleCount ?? 0);
          setSampleQueueCount(json.status.sampleQueueCount ?? 0);
          setPgReachable(true);
        } else {
          setSteps([]);
          setArticleCount(0);
          setSampleQueueCount(0);
          setPgReachable(false);
        }
      } catch {
        if (!cancelled) {
          setSteps([]);
          setArticleCount(0);
          setSampleQueueCount(0);
          setPgReachable(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [collectionId, factoryId, core, reloadNonce]);

  return { steps, articleCount, sampleQueueCount, loading, pgReachable };
}
