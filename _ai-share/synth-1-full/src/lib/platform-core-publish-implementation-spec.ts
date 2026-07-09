import type { PlatformCoreUiActionId } from '@/lib/platform-core-ui-action-contracts';
import type { PlatformCoreSharedUiComponentId } from '@/lib/platform-core-shared-ui-manifest';

export type PlatformCorePublishImplementationLayer = 'ui' | 'bff' | 'state' | 'test';

export type PlatformCorePublishImplementationSpec = {
  actionId: Extract<PlatformCoreUiActionId, 'publish_collection'>;
  primarySectionId: 'brand-sc-publish';
  entrySectionIds: readonly ['brand-sc-linesheets', 'brand-sc-showroom'];
  destinationSectionIds: readonly ['shop-sc-showroom', 'shop-co-matrix'];
  requiredSharedUi: readonly PlatformCoreSharedUiComponentId[];
  layers: readonly PlatformCorePublishImplementationLayer[];
  primaryCtaRu: string;
  stateContract: {
    beforePublish: 'draft' | 'ready_to_publish';
    afterPublish: 'published_to_shop';
    shopVisibility: 'visible_in_shop_showroom';
  };
  acceptanceRu: readonly string[];
};

/**
 * First P0 implementation spec.
 *
 * Publish is the smallest commercial handoff: Brand makes a collection visible,
 * Shop receives it in showroom and can continue to order matrix.
 */
export const PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC: PlatformCorePublishImplementationSpec = {
  actionId: 'publish_collection',
  primarySectionId: 'brand-sc-publish',
  entrySectionIds: ['brand-sc-linesheets', 'brand-sc-showroom'],
  destinationSectionIds: ['shop-sc-showroom', 'shop-co-matrix'],
  requiredSharedUi: ['section_header', 'empty_state'],
  layers: ['ui', 'bff', 'state', 'test'],
  primaryCtaRu: 'Опубликовать коллекцию для магазинов',
  stateContract: {
    beforePublish: 'ready_to_publish',
    afterPublish: 'published_to_shop',
    shopVisibility: 'visible_in_shop_showroom',
  },
  acceptanceRu: [
    'Brand Sample Collection показывает publish_collection как один primary CTA.',
    'Publish меняет состояние коллекции на published_to_shop через canonical write path.',
    'Shop showroom видит опубликованную коллекцию без ручного импорта/Excel.',
    'После publish следующий шаг ведёт в shop showroom или shop order matrix.',
  ],
};

export function getPlatformCorePublishPrimaryCtaLabel(): string {
  return PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.primaryCtaRu;
}

export function getPlatformCorePublishImplementationSectionIds(): string[] {
  return [
    PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.primarySectionId,
    ...PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.entrySectionIds,
    ...PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.destinationSectionIds,
  ];
}
