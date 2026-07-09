import {
  PLATFORM_CORE_P0_IMPLEMENTATION_CUT,
  getPlatformCoreP0ImplementationCutActionIds,
  getPlatformCoreP0ImplementationCutByTrack,
  getPlatformCoreP0ImplementationCutSectionIds,
} from '@/lib/platform-core-p0-implementation-cut';
import { PLATFORM_CORE_UI_ACTION_CONTRACTS } from '@/lib/platform-core-ui-action-contracts';
import { PLATFORM_CORE_LIFECYCLE_ACTION_MAP } from '@/lib/platform-core-lifecycle-map';
import { getPlatformCoreP0RepairQueue } from '@/lib/platform-core-ui-repair-queue';

describe('Platform Core P0 implementation cut', () => {
  it('keeps the execution order focused on commercial blockers', () => {
    expect(PLATFORM_CORE_P0_IMPLEMENTATION_CUT.map((item) => item.track)).toEqual([
      'sample_collection_publish',
      'collection_order_revision',
      'order_production_tail',
      'communications_collection_thread',
    ]);
    expect(PLATFORM_CORE_P0_IMPLEMENTATION_CUT.map((item) => item.order)).toEqual([1, 2, 3, 4]);
  });

  it('references only known action contracts', () => {
    const knownActions = new Set(PLATFORM_CORE_UI_ACTION_CONTRACTS.map((action) => action.actionId));
    const unknown = getPlatformCoreP0ImplementationCutActionIds().filter(
      (actionId) => !knownActions.has(actionId)
    );
    expect(unknown).toEqual([]);
  });

  it('covers every P0 pending lifecycle action', () => {
    const cutActions = new Set(getPlatformCoreP0ImplementationCutActionIds());
    const pendingLifecycleActions = PLATFORM_CORE_LIFECYCLE_ACTION_MAP.filter((step) => step.isPending).map(
      (step) => step.actionId
    );
    const missing = pendingLifecycleActions.filter((actionId) => !cutActions.has(actionId));
    expect(missing).toEqual([]);
  });

  it('stays aligned with the P0 repair queue action scope', () => {
    const cutActions = new Set(getPlatformCoreP0ImplementationCutActionIds());
    const repairActions = new Set(getPlatformCoreP0RepairQueue().flatMap((item) => [...item.actionIds]));
    for (const actionId of cutActions) {
      expect(repairActions.has(actionId)).toBe(true);
    }
  });

  it('keeps Order Production tail as the largest implementation cut', () => {
    const orderProductionTail = getPlatformCoreP0ImplementationCutByTrack('order_production_tail');
    expect(orderProductionTail?.actionIds).toEqual(
      expect.arrayContaining(['write_qc_gate', 'create_packing_list', 'accept_delivery', 'close_order'])
    );
    expect(orderProductionTail?.sectionIds.length).toBeGreaterThanOrEqual(6);
  });

  it('has concrete acceptance criteria for every cut item', () => {
    for (const item of PLATFORM_CORE_P0_IMPLEMENTATION_CUT) {
      expect(item.whyFirstRu.length).toBeGreaterThan(60);
      expect(item.doneWhenRu.length).toBeGreaterThanOrEqual(3);
      expect(item.sectionIds.length).toBeGreaterThanOrEqual(2);
      expect(item.kind.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('exposes section ids for migration planning', () => {
    expect(getPlatformCoreP0ImplementationCutSectionIds()).toEqual(
      expect.arrayContaining([
        'brand-sc-publish',
        'brand-co-detail',
        'shop-co-detail',
        'brand-op-qc',
        'brand-op-packing',
        'shop-op-acceptance',
        'shop-op-closeout',
        'brand-cm-collection-chat',
      ])
    );
  });
});
