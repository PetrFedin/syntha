'use client';

import Link from 'next/link';
import { ArrowRight, FileText, Send, Store } from 'lucide-react';
import { BrandSampleCollectionMini } from '@/components/platform/BrandSampleCollectionMini';
import { PlatformCoreEmptyState } from '@/components/platform/shared';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';
import {
  BRAND_SC_LINESHEETS_SECTION,
  BRAND_SC_PUBLISH_SECTION,
  BRAND_SC_SHOWROOM_SECTION,
} from '@/lib/platform-core-sample-collection-section';
import { roleCoreCabinetHref } from '@/lib/platform-core-cabinet-workspace';

const SECTION_META = {
  [BRAND_SC_LINESHEETS_SECTION]: {
    title: 'Лайншит коллекции',
    description: 'Соберите коммерческую структуру коллекции, проверьте артикулы и подготовьте материалы для байеров.',
    actionLabel: 'Перейти к витрине',
    nextSection: BRAND_SC_SHOWROOM_SECTION,
    icon: FileText,
  },
  [BRAND_SC_SHOWROOM_SECTION]: {
    title: 'Витрина бренда',
    description: 'Проверьте, как коллекция выглядит для магазина перед публикацией и передачей в buyer flow.',
    actionLabel: 'Перейти к публикации',
    nextSection: BRAND_SC_PUBLISH_SECTION,
    icon: Store,
  },
  [BRAND_SC_PUBLISH_SECTION]: {
    title: 'Публикация и release',
    description: 'Опубликуйте готовую коллекцию и передайте её в витрину магазина без выхода из кабинета.',
    actionLabel: 'Открыть лайншит',
    nextSection: BRAND_SC_LINESHEETS_SECTION,
    icon: Send,
  },
} as const;

type Props = {
  demo: PlatformCoreDemoContext;
  sectionId: string;
};

/** Brand · Sample Collection: полноценный section-aware workspace внутри core cabinet. */
export function BrandSampleCollectionCabinetWorkspace({ demo, sectionId }: Props) {
  const meta = SECTION_META[sectionId as keyof typeof SECTION_META];

  if (!meta) {
    return (
      <PlatformCoreEmptyState
        title="Раздел коллекции не найден"
        reason="Ссылка устарела или вкладка больше не входит в рабочий контур Sample Collection."
        nextActionLabel="Открыть лайншит"
        nextActionHref={roleCoreCabinetHref({
          roleId: 'brand',
          pillarId: 'sample_collection',
          collectionId: demo.collectionId,
          sectionId: BRAND_SC_LINESHEETS_SECTION,
          orderId: demo.demoOrderId,
          articleId: demo.demoArticleId,
        })}
      />
    );
  }

  const Icon = meta.icon;
  const nextHref = roleCoreCabinetHref({
    roleId: 'brand',
    pillarId: 'sample_collection',
    collectionId: demo.collectionId,
    sectionId: meta.nextSection,
    orderId: demo.demoOrderId,
    articleId: demo.demoArticleId,
  });

  return (
    <div data-testid="brand-sample-collection-workspace" className="min-w-0 space-y-2.5">
      <header className="border-border-subtle flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
            <h1 className="truncate text-[15px] font-semibold text-text-primary">{meta.title}</h1>
          </div>
          <p className="mt-0.5 max-w-3xl text-[12px] leading-5 text-text-secondary">
            {meta.description}
          </p>
        </div>
        <Link
          href={nextHref}
          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-border-subtle px-2.5 text-[11px] font-medium text-text-primary transition-colors hover:bg-bg-surface2"
        >
          {meta.actionLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </header>

      <BrandSampleCollectionMini
        demo={demo}
        compact={false}
        minimalChrome
        sectionId={sectionId}
      />
    </div>
  );
}
