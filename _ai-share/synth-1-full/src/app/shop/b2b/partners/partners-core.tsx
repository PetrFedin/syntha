'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { ShopB2bPartnersRepConnectPanel } from '@/components/shop/b2b/ShopB2bPartnersWorkspacePanels';
import { ShopB2bPartnersDiscoverGrid } from '@/components/shop/b2b/ShopB2bPartnersDiscoverGrid';
import {
  ShopB2bPartnersGoldenPathStrip,
  shopB2bPartnersGoldenPathStepFromFeature,
} from '@/components/shop/b2b/ShopB2bPartnersGoldenPathStrip';
import { ShopScPartnersB2bPeerStrip } from '@/components/platform/ShopScPartnersB2bPeerStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { useShopB2bPartnerships } from '@/hooks/use-shop-b2b-partnerships';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { tid } from '@/lib/ui/test-ids';

function ShopB2bPartnersRosterPanel({ collectionId }: { collectionId: string }) {
  const { partnerships, loadState } = useShopB2bPartnerships({
    enabled: true,
    collectionId,
  });

  return (
    <div className="space-y-4" data-testid="shop-b2b-partners-roster-panel">
      <Card>
        <CardContent className="pt-6">
          {loadState === 'loading' ? (
            <p className="text-text-muted mb-4 text-xs">Загрузка партнёров…</p>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Бренд</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerships.map((brand) => {
                const connected = brand.status === 'connected';
                return (
                  <TableRow key={brand.brandId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {brand.logo || brand.coverImage ? (
                          <Image
                            src={brand.logo || brand.coverImage || ''}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-full border object-cover"
                          />
                        ) : null}
                        <div>
                          <p className="font-medium">{brand.name}</p>
                          <p className="text-text-muted text-xs">
                            {brand.segment}
                            {brand.orderCount > 0 ? ` · ${brand.orderCount} заказ(ов)` : null}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={connected ? 'default' : 'secondary'}>
                        {connected ? 'Активен' : 'Профиль'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {connected ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={brand.showroomHref}>Витрина</Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={brand.matrixHref}>Матрица</Link>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-text-muted text-xs">
                          Нет активного оптового контура
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ShopB2bPartnersWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const orderId =
    searchParams.get('order')?.trim() || searchParams.get('orderId')?.trim() || undefined;
  const ctx = { collectionId, orderId, role: 'shop' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('shop-b2b-partners');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="shop-b2b-partners"
      ctx={ctx}
      crossLinksTitle="Showroom · matrix · tracking"
    >
      <div className="mb-4">
        <ShopB2bPartnersGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={shopB2bPartnersGoldenPathStepFromFeature(activeFeatureId)}
        />
        <ShopScPartnersB2bPeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'roster' ? (
        <ShopB2bPartnersRosterPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'discover' ? (
        <ShopB2bPartnersDiscoverGrid collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'rep' ? (
        <ShopB2bPartnersRepConnectPanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export function ShopB2bPartnersCorePage() {
  return (
    <CabinetPageContent
      maxWidth="4xl"
      className="space-y-6 px-4 py-6 pb-24 sm:px-6"
      data-testid={tid.page('shop-b2b-partners')}
    >
      <PlatformCoreListChrome highlightRole="shop" pillarId="sample_collection">
        <Suspense fallback={null}>
          <ShopB2bPartnersWorkspaceBody />
        </Suspense>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
