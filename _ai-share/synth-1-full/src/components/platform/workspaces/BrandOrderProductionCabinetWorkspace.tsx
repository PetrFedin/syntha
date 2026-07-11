'use client';

import Link from 'next/link';
import { ArrowRight, ClipboardCheck, Factory, PackageCheck } from 'lucide-react';
import { PlatformCoreEmptyState } from '@/components/platform/shared';
import { OrderProductionPillarCardBrand } from '@/components/platform/pillars/OrderProductionPillarCardBrand';
import { roleCoreCabinetHref } from '@/lib/platform-core-cabinet-workspace';

const SECTION_META = {
  'brand-op-handoff': {
    title: 'Передача заказа в исполнение',
    description: 'Проверьте подтверждённый заказ, маршрут исполнения и готовность к запуску производства или закупки.',
    actionLabel: 'Открыть реестр исполнения',
    nextSection: 'brand-op-registry',
    icon: Factory,
  },
  'brand-op-registry': {
    title: 'Реестр исполнения',
    description: 'Контролируйте активные производственные и sourcing-заказы, статусы, сроки и отклонения.',
    actionLabel: 'Открыть досье серии',
    nextSection: 'brand-op-dossier',
    icon: ClipboardCheck,
  },
  'brand-op-dossier': {
    title: 'Досье серии и отгрузки',
    description: 'Сверьте PO, этапы исполнения, документы, готовность к упаковке и передаче магазину.',
    actionLabel: 'Вернуться к передаче',
    nextSection: 'brand-op-handoff',
    icon: PackageCheck,
  },
} as const;

type Props = {
  collectionId: string;
  sectionId: string;
  orderId?: string | null;
  articleId?: string | null;
};

/** Brand · Order Production: section-aware fulfillment workspace. */
export function BrandOrderProductionCabinetWorkspace({
  collectionId,
  sectionId,
  orderId,
  articleId,
}: Props) {
  const meta = SECTION_META[sectionId as keyof typeof SECTION_META];

  if (!meta) {
    return (
      <PlatformCoreEmptyState
        title="Раздел исполнения не найден"
        reason="Ссылка устарела или вкладка больше не входит в рабочий контур Order Production."
        nextActionLabel="Открыть передачу заказа"
        nextActionHref={roleCoreCabinetHref({
          roleId: 'brand',
          pillarId: 'order_production',
          collectionId,
          sectionId: 'brand-op-handoff',
          orderId,
          articleId,
        })}
      />
    );
  }

  const Icon = meta.icon;
  const nextHref = roleCoreCabinetHref({
    roleId: 'brand',
    pillarId: 'order_production',
    collectionId,
    sectionId: meta.nextSection,
    orderId,
    articleId,
  });

  return (
    <div data-testid="brand-order-production-workspace" className="min-w-0 space-y-2.5">
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

      <OrderProductionPillarCardBrand compact={false} minimalChrome />
    </div>
  );
}
