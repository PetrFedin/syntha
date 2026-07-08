'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildBrandLinesheetSyndicationSession } from '@/lib/fashion/brand-linesheet-syndication';
import { Workshop2HubShowroomPublishButton } from '@/components/brand/production/Workshop2HubShowroomPublishButton';
import { BrandReleasePublishAuditPanel } from '@/components/brand/merch/BrandReleasePublishAuditPanel';
import { BrandScReleaseGateBlockStrip } from '@/components/brand/sample/BrandScReleaseGateBlockStrip';
import { BrandScReleaseGateBlockPublishBanner } from '@/components/brand/sample/BrandScReleaseGateBlockPublishBanner';
import { useWorkshop2CollectionArticleIds } from '@/hooks/use-workshop2-collection-article-ids';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { Store } from 'lucide-react';

type Props = {
  collectionId?: string;
};

/** Release gate · showroom-publish tab — readiness + bulk publish (same API as W2 hub). */
export function BrandReleaseShowroomPublishPanel({ collectionId }: Props) {
  const resolvedCollectionId = collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const session = buildBrandLinesheetSyndicationSession({ collectionId: resolvedCollectionId });
  const { articleIds, loading, reload } = useWorkshop2CollectionArticleIds(resolvedCollectionId);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishReloadNonce, setPublishReloadNonce] = useState(0);

  const handlePublishMessage = (msg: string | null) => {
    setPublishMessage(msg);
    if (msg && /опублик|publish|готов|успеш|batch/i.test(msg)) {
      setPublishReloadNonce((n) => n + 1);
      reload();
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-release-showroom-publish-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Store className="h-4 w-4" />
            <CardTitle className="text-base">Публикация шоурума</CardTitle>
          </div>
          <CardDescription>
            Checklist → syndication → publish → shop buy. Golden path сверху; здесь — одна кнопка
            публикации в витрину.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <BrandScReleaseGateBlockStrip collectionId={resolvedCollectionId} compact />
          <BrandScReleaseGateBlockPublishBanner collectionId={resolvedCollectionId} />
          {loading ? (
            <p className="text-text-muted text-xs">Загрузка артикулов коллекции…</p>
          ) : articleIds.length === 0 ? (
            <p className="text-text-muted text-xs">
              Нет артикулов в PG — создайте SKU в W2 hub, затем вернитесь сюда.
            </p>
          ) : (
            <Workshop2HubShowroomPublishButton
              collectionId={resolvedCollectionId}
              articleIds={articleIds}
              onMessage={handlePublishMessage}
            />
          )}
          {publishMessage ? (
            <p
              className="text-text-secondary text-xs"
              role="status"
              data-testid="brand-release-showroom-publish-status"
            >
              {publishMessage}
            </p>
          ) : null}
          <BrandReleasePublishAuditPanel
            collectionId={resolvedCollectionId}
            reloadNonce={publishReloadNonce}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="outline" asChild>
              <Link
                href={session.brandShowroomHref}
                data-testid="brand-release-showroom-brand-preview-link"
              >
                Brand preview
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={session.shopShowroomHref} data-testid="brand-release-showroom-shop-link">
                Шоурум магазина
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
