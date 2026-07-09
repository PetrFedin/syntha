import {
  getPlatformCorePublishCtaModel,
  isPlatformCorePublishCtaEnabled,
} from '@/lib/platform-core-publish-cta-model';
import { PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC } from '@/lib/platform-core-publish-implementation-spec';

describe('Platform Core publish CTA model', () => {
  it('disables publish for draft collections and keeps user in publish section', () => {
    const model = getPlatformCorePublishCtaModel('draft');
    expect(model).toMatchObject({
      actionId: 'publish_collection',
      disabled: true,
      state: 'draft',
      primarySectionId: 'brand-sc-publish',
      nextSectionId: 'brand-sc-publish',
    });
    expect(model.label).toBe(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.primaryCtaRu);
    expect(model.helperTextRu).toMatch(/лайншит|showroom/i);
    expect(isPlatformCorePublishCtaEnabled('draft')).toBe(false);
  });

  it('enables publish only when collection is ready_to_publish', () => {
    const model = getPlatformCorePublishCtaModel('ready_to_publish');
    expect(model.disabled).toBe(false);
    expect(model.label).toBe('Опубликовать коллекцию для магазинов');
    expect(model.nextSectionId).toBe('shop-sc-showroom');
    expect(model.helperTextRu).toMatch(/готова к публикации/i);
    expect(isPlatformCorePublishCtaEnabled('ready_to_publish')).toBe(true);
  });

  it('turns publish into a status after collection is visible to shop', () => {
    const model = getPlatformCorePublishCtaModel('published_to_shop');
    expect(model.disabled).toBe(true);
    expect(model.label).toBe('Коллекция опубликована');
    expect(model.nextSectionId).toBe('shop-sc-showroom');
    expect(model.helperTextRu).toMatch(/доступна магазину/i);
    expect(isPlatformCorePublishCtaEnabled('published_to_shop')).toBe(false);
  });

  it('uses the same state names as the publish implementation spec', () => {
    expect(isPlatformCorePublishCtaEnabled(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.stateContract.beforePublish)).toBe(
      true
    );
    expect(getPlatformCorePublishCtaModel(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.stateContract.afterPublish).label).toBe(
      'Коллекция опубликована'
    );
  });
});
