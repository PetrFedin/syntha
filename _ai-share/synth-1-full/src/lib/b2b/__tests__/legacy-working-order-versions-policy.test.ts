import { canUseLegacyB2bWorkingOrderVersionsStore } from '@/lib/b2b/legacy-working-order-versions-policy';

describe('B2B v1 legacy working order production guard', () => {
  it('rejects production even when the legacy client knows the endpoint', () => {
    expect(canUseLegacyB2bWorkingOrderVersionsStore('production')).toBe(false);
  });

  it('rejects missing and unrecognized runtime modes', () => {
    expect(canUseLegacyB2bWorkingOrderVersionsStore(undefined)).toBe(false);
    expect(canUseLegacyB2bWorkingOrderVersionsStore('staging')).toBe(false);
  });

  it('allows explicit local development and tests for demo compatibility', () => {
    expect(canUseLegacyB2bWorkingOrderVersionsStore('development')).toBe(true);
    expect(canUseLegacyB2bWorkingOrderVersionsStore('test')).toBe(true);
  });
});
