/**
 * Метаданные пяти столпов Platform Core hub.
 */
import { DEVELOPMENT_PILLAR_ENTITY_LABEL } from '@/lib/platform-core-canonical-labels';
import {
  getPlatformCoreCollectionLabel,
  PLATFORM_CORE_DEMO,
  type PlatformCoreDemoContext,
} from '@/lib/platform-core-demo-context';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';
import { PLATFORM_CORE_ARTICLE_SPINE_LEAD } from '@/lib/platform-core-article-spine';

export const PLATFORM_CORE_PILLARS: readonly {
  id: CoreHubPillarId;
  title: string;
  subtitle: string;
}[] = [
  {
    id: 'development',
    title: 'Разработка',
    subtitle: 'Артикул · ТЗ · образец',
  },
  {
    id: 'sample_collection',
    title: 'Коллекция',
    subtitle: 'Сэмплы → лайншит и витрина',
  },
  {
    id: 'collection_order',
    title: 'Оптовый заказ',
    subtitle: 'Матрица и подтверждение',
  },
  {
    id: 'order_production',
    title: 'Исполнение',
    subtitle: 'Выпуск под заказ · PO',
  },
  {
    id: 'comms',
    title: 'Связь',
    subtitle: 'Чат и календарь',
  },
];

export const PLATFORM_CORE_CHAIN_LEAD = PLATFORM_CORE_ARTICLE_SPINE_LEAD;

export const PLATFORM_CORE_HUB_HEADING = 'Бренд и магазин · article spine';

/** Подписи столпов без технических id заказов/PO (investor UI). */
export function buildPillarEntityLabels(
  demo: PlatformCoreDemoContext
): Record<CoreHubPillarId, string> {
  const col = getPlatformCoreCollectionLabel(demo.collectionId);
  return {
    development: DEVELOPMENT_PILLAR_ENTITY_LABEL,
    sample_collection: col,
    collection_order: `Оптовый заказ · ${col}`,
    order_production: `Выпуск · ${col}`,
    comms: `Связь · ${col}`,
  };
}

export const PLATFORM_CORE_PILLAR_DEMO_ENTITY: Record<CoreHubPillarId, string> =
  buildPillarEntityLabels(PLATFORM_CORE_DEMO);
