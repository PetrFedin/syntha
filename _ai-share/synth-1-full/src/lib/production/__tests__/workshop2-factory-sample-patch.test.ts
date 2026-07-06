import {
  FACTORY_SAMPLE_PATCH_STATUSES,
  validateFactorySamplePatch,
  validateFactorySampleStatusTransition,
} from '@/lib/production/workshop2-factory-sample-patch';

describe('workshop2-factory-sample-patch', () => {
  it('allows only factory statuses', () => {
    expect(FACTORY_SAMPLE_PATCH_STATUSES).toEqual(['in_progress', 'received']);
    expect(validateFactorySamplePatch({ status: 'draft' }).ok).toBe(false);
    expect(validateFactorySamplePatch({ note: 'ok' }).ok).toBe(true);
    expect(validateFactorySamplePatch({ status: 'received' }).ok).toBe(true);
  });

  it('validates transitions', () => {
    expect(validateFactorySampleStatusTransition('sent', 'in_progress').allowed).toBe(true);
    expect(validateFactorySampleStatusTransition('draft', 'received').allowed).toBe(false);
  });
});
