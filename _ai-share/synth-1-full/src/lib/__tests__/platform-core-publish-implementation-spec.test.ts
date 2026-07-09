import {
  PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC,
  getPlatformCorePublishImplementationSectionIds,
  getPlatformCorePublishPrimaryCtaLabel,
} from '@/lib/platform-core-publish-implementation-spec';
import { getPlatformCoreP0ImplementationCutByTrack } from '@/lib/platform-core-p0-implementation-cut';
import { PLATFORM_CORE_UI_ACTION_CONTRACTS } from '@/lib/platform-core-ui-action-contracts';
import { getPlatformCoreSharedUiManifestItem } from '@/lib/platform-core-shared-ui-manifest';

describe('Platform Core publish implementation spec', () => {
  it('stays aligned with the publish action contract', () => {
    const action = PLATFORM_CORE_UI_ACTION_CONTRACTS.find(
      (item) => item.actionId === PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.actionId
    );
    expect(action).toBeTruthy();
    expect(action?.primarySectionId).toBe(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.primarySectionId);
    expect(action?.duplicatePolicy).toBe('single_primary');
  });

  it('stays aligned with the first P0 implementation cut', () => {
    const cut = getPlatformCoreP0ImplementationCutByTrack('sample_collection_publish');
    expect(cut?.order).toBe(1);
    expect(cut?.actionIds).toContain(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.actionId);
    expect(cut?.sectionIds).toEqual(
      expect.arrayContaining(getPlatformCorePublishImplementationSectionIds())
    );
  });

  it('defines Brand entry points and Shop destinations for the publish handoff', () => {
    expect(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.entrySectionIds).toEqual([
      'brand-sc-linesheets',
      'brand-sc-showroom',
    ]);
    expect(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.destinationSectionIds).toEqual([
      'shop-sc-showroom',
      'shop-co-matrix',
    ]);
  });

  it('uses only known canonical shared UI components', () => {
    for (const componentId of PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.requiredSharedUi) {
      expect(getPlatformCoreSharedUiManifestItem(componentId)).toBeTruthy();
    }
    expect(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.requiredSharedUi).toEqual(
      expect.arrayContaining(['section_header', 'empty_state'])
    );
  });

  it('defines a clear state transition and CTA label', () => {
    expect(getPlatformCorePublishPrimaryCtaLabel()).toBe('Опубликовать коллекцию для магазинов');
    expect(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.stateContract).toEqual({
      beforePublish: 'ready_to_publish',
      afterPublish: 'published_to_shop',
      shopVisibility: 'visible_in_shop_showroom',
    });
  });

  it('requires implementation across UI, BFF, state and tests', () => {
    expect(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.layers).toEqual(['ui', 'bff', 'state', 'test']);
    expect(PLATFORM_CORE_PUBLISH_IMPLEMENTATION_SPEC.acceptanceRu.length).toBeGreaterThanOrEqual(4);
  });
});
