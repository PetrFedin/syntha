import { PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC } from '@/lib/platform-core-publish-implementation-spec';

export type PlatformCorePublishCtaState =
  | 'draft'
  | 'ready_to_publish'
  | 'published_to_shop';

export type PlatformCorePublishCtaModel = {
  actionId: 'publish_collection';
  label: string;
  disabled: boolean;
  state: PlatformCorePublishCtaState;
  primarySectionId: 'brand-sc-publish';
  nextSectionId: 'shop-sc-showroom' | 'brand-sc-publish';
  helperTextRu: string;
};

export function getPlatformCorePublishCtaModel(
  state: PlatformCorePublishCtaState
): PlatformCorePublishCtaModel {
  const isReady = state === PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.stateContract.beforePublish;
  const isPublished = state === PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.stateContract.afterPublish;

  if (isPublished) {
    return {
      actionId: 'publish_collection',
      label: 'Коллекция опубликована',
      disabled: true,
      state,
      primarySectionId: PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.primarySectionId,
      nextSectionId: 'shop-sc-showroom',
      helperTextRu: 'Коллекция уже доступна магазину в showroom. Следующий шаг — проверить видимость и перейти к матрице заказа.',
    };
  }

  return {
    actionId: 'publish_collection',
    label: PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.primaryCtaRu,
    disabled: !isReady,
    state,
    primarySectionId: PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.primarySectionId,
    nextSectionId: isReady ? 'shop-sc-showroom' : 'brand-sc-publish',
    helperTextRu: isReady
      ? 'Коллекция готова к публикации для магазинов.'
      : 'Перед публикацией нужно довести лайншит и showroom до статуса ready_to_publish.',
  };
}

export function isPlatformCorePublishCtaEnabled(state: PlatformCorePublishCtaState): boolean {
  return !getPlatformCorePublishCtaModel(state).disabled;
}
