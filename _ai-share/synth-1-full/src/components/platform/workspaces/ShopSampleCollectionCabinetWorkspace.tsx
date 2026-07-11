'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag, Store } from 'lucide-react';
import { PlatformCoreEmptyState } from '@/components/platform/shared';
import { ShopShowroomMini } from '@/components/platform/ShopShowroomMini';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';
import { roleCoreCabinetHref } from '@/lib/platform-core-cabinet-workspace';
import { SHOP_SC_SHOWROOM_SECTION } from '@/lib/platform-core-sample-collection-section';

const SHOP_SAMPLE_COLLECTION_SECTIONS = new Set([SHOP_SC_SHOWROOM_SECTION]);

type Props = {
  demo: PlatformCoreDemoContext;
  sectionId: string;
};

/** Shop · Sample Collection: buyer showroom as a first-class embedded workspace. */
export function ShopSampleCollectionCabinetWorkspace({ demo, sectionId }: Props) {
  if (!SHOP_SAMPLE_COLLECTION_SECTIONS.has(sectionId)) {
    return (
      <PlatformCoreEmptyState
        title="Раздел витрины не найден"
        reason="Ссылка устарела или вкладка больше не входит в рабочий buyer flow Sample Collection."
        nextActionLabel="Открыть витрину коллекции"
        nextActionHref={roleCoreCabinetHref({
          roleId: 'shop',
          pillarId: 'sample_collection',
          collectionId: demo.collectionId,
          sectionId: SHOP_SC_SHOWROOM_SECTION,
          orderId: demo.demoOrderId,
          articleId: demo.demoArticleId,
        })}
      />
    );
  }

  const matrixHref = roleCoreCabinetHref({
    roleId: 'shop',
    pillarId: 'collection_order',
    collectionId: demo.collectionId,
    sectionId: 'shop-co-matrix',
    orderId: demo.demoOrderId,
    articleId: demo.demoArticleId,
  });

  return (
    <div data-testid="shop-sample-collection-workspace" className="min-w-0 space-y-2.5">
      <header className="border-border-subtle flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <Store className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
            <h1 className="truncate text-[15px] font-semibold text-text-primary">
              Витрина коллекции
            </h1>
          </div>
          <p className="mt-0.5 max-w-3xl text-[12px] leading-5 text-text-secondary">
            Просмотрите опубликованные модели, проверьте ассортимент и перейдите к формированию заказа без выхода из кабинета.
          </p>
        </div>
        <Link
          href={matrixHref}
          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md bg-accent-primary px-2.5 text-[11px] font-semibold text-accent-primary-foreground transition-opacity hover:opacity-90"
          data-testid="shop-sc-primary-order-action"
        >
          <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
          Сформировать заказ
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </header>

      <ShopShowroomMini
        demo={demo}
        compact={false}
        minimalChrome
        sectionId={sectionId}
      />
    </div>
  );
}
