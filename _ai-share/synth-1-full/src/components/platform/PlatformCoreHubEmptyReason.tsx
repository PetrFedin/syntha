'use client';

import type { ReactNode } from 'react';
import { PlatformCoreTerm } from '@/components/platform/PlatformCoreTerm';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';

type Props = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  /** Plain fallback from hub matrix (peers, audit). */
  fallback: string;
  className?: string;
};

const RICH_EMPTY_REASONS: Partial<
  Record<CoreChainRoleId, Partial<Record<CoreHubPillarId, ReactNode>>>
> = {
  shop: {
    development: (
      <>
        Разработку артикула ведёт бренд (<PlatformCoreTerm term="W2" />
        ). Магазин подключается к опубликованной коллекции в showroom.
      </>
    ),
  },
  manufacturer: {
    sample_collection: (
      <>Linesheet и showroom ведёт бренд — цех видит статус коллекции после одобрения образца.</>
    ),
    collection_order: (
      <>
        Оптовый заказ (<PlatformCoreTerm term="B2B" />) формируют магазин и бренд. Цех получает{' '}
        <PlatformCoreTerm term="PO" /> после <PlatformCoreTerm term="Handoff" />.
      </>
    ),
  },
  supplier: {
    sample_collection: (
      <>
        Документацию коллекции для магазинов ведёт бренд; поставщик подключается через{' '}
        <PlatformCoreTerm term="BOM" /> образца.
      </>
    ),
    collection_order: (
      <>
        Оптовый заказ (<PlatformCoreTerm term="B2B" />) коллекции — между брендом и магазином;
        поставщик ждёт <PlatformCoreTerm term="PO" /> под закупку.
      </>
    ),
  },
};

/** Empty-ячейка матрицы: единый RU-тон + подсказки по терминам Platform Core. */
export function PlatformCoreHubEmptyReason({ roleId, pillarId, fallback, className }: Props) {
  const rich = RICH_EMPTY_REASONS[roleId]?.[pillarId];
  return <p className={className}>{rich ?? fallback}</p>;
}
