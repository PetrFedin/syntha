'use client';

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { getWorkingOrderVersions } from '@/lib/b2b/working-order-store';
import { getConsolidatedDraft } from '@/lib/b2b/consolidated-order-draft';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

export default function B2BOrderDraftsPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bOrderDrafts} />;
  }

  const versions = getWorkingOrderVersions();
  const consolidated = getConsolidatedDraft();
  const draftVersions = versions.filter(
    (v) => v.status === 'draft' || v.status === 'pending_review'
  );

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader lead="Незавершённые заказы по коллекциям — продолжить в матрице или рабочем заказе." />

      {consolidated && consolidated.lines.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase">Сводный черновик агента</CardTitle>
            <CardDescription>
              Один черновик по нескольким брендам. MOV/MOQ проверяются по каждому бренду.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="default"
              size="sm"
              className="rounded-lg text-[10px] font-black uppercase"
            >
              <Link href={ROUTES.shop.b2bAgentConsolidatedOrder}>Открыть сводный заказ</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase">Working Order — черновики</CardTitle>
          <CardDescription>
            Загруженные файлы в статусе черновик или на согласовании.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {draftVersions.length === 0 ? (
            <p className="text-text-secondary text-sm">
              Нет черновиков. Создайте заказ в матрице или загрузите Working Order.
            </p>
          ) : (
            draftVersions.slice(0, 10).map((v) => (
              <div
                key={v.id}
                className="border-border-subtle bg-bg-surface2/80 flex items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div>
                  <p className="text-text-primary font-bold">{v.fileName}</p>
                  <p className="text-text-secondary text-xs">
                    {new Date(v.createdAt).toLocaleDateString('ru-RU')} · {v.uploadedBy} ·{' '}
                    {v.status}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-[10px] font-black uppercase"
                  asChild
                >
                  <Link href={`${ROUTES.shop.b2bWorkingOrder}?version=${encodeURIComponent(v.id)}`}>
                    Продолжить <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          asChild
          variant="default"
          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          <Link href={ROUTES.shop.b2bCreateOrder}>Создать заказ</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          <Link href={ROUTES.shop.b2bAiSmartOrder}>AI SmartOrder (PDF/email)</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          <Link href={ROUTES.shop.b2bWorkingOrder}>Working Order</Link>
        </Button>
      </div>

      <RelatedModulesBlock
        title="Связанные разделы"
        links={getShopB2BHubLinks().filter((l) =>
          [ROUTES.shop.b2bOrders, ROUTES.shop.b2bCreateOrder].includes(l.href as string)
        )}
      />
    </CabinetPageContent>
  );
}
