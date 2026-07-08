'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Workshop2HubShowroomPublishButton } from '@/components/brand/production/Workshop2HubShowroomPublishButton';
import { BrandScReleaseGateBlockStrip } from '@/components/brand/sample/BrandScReleaseGateBlockStrip';
import { BrandScReleaseGateBlockPublishBanner } from '@/components/brand/sample/BrandScReleaseGateBlockPublishBanner';
import { buildBrandShowroomBuySession } from '@/lib/fashion/brand-showroom-buy';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

type Props = {
  collectionId: string;
};

/** Release checklist → readiness → bulk publish (one-click strip, без дубля release-gate tab). */
export function BrandShowroomPublishOneClickStrip({ collectionId }: Props) {
  const session = buildBrandShowroomBuySession({ collectionId });
  const [articleIds, setArticleIds] = useState<string[]>([PLATFORM_CORE_DEMO.demoArticleId]);
  const [message, setMessage] = useState<string | null>(null);

  const loadArticleIds = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/workshop2/collections/${encodeURIComponent(collectionId)}/development-status`,
        { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        status?: { articleIds?: string[] };
      };
      const ids = json.ok && Array.isArray(json.status?.articleIds) ? json.status!.articleIds! : [];
      if (ids.length > 0) setArticleIds(ids);
    } catch {
      setArticleIds([PLATFORM_CORE_DEMO.demoArticleId]);
    }
  }, [collectionId]);

  useEffect(() => {
    void loadArticleIds();
  }, [loadArticleIds]);

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 space-y-2 rounded-md border px-3 py-3"
      data-testid="brand-showroom-publish-one-click-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[9px] uppercase">
          One-click publish
        </Badge>
        <span className="text-text-secondary text-xs">
          Checklist gate → bulk-showroom-publish · {articleIds.length} SKU
        </span>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link
            href={session.launchReadinessHref}
            data-testid="brand-showroom-publish-one-click-checklist-link"
          >
            Release checklist
          </Link>
        </Button>
      </div>
      <BrandScReleaseGateBlockStrip collectionId={collectionId} compact />
      <BrandScReleaseGateBlockPublishBanner collectionId={collectionId} />
      <Workshop2HubShowroomPublishButton
        collectionId={collectionId}
        articleIds={articleIds}
        onMessage={setMessage}
      />
      {message ? (
        <p
          className="text-text-muted text-[10px]"
          data-testid="brand-showroom-publish-one-click-message"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
