/**
 * @jest-environment node
 */
import {
  resolveWorkshop2SewingContractorsPayload,
  resolveWorkshop2SewingPlanReferencePayload,
} from '@/lib/production/workshop2-sewing-plan-reference-data';

describe('workshop2-sewing-plan-reference-data', () => {
  it('returns contractors payload with partners and source', () => {
    const payload = resolveWorkshop2SewingContractorsPayload();
    expect(payload.source.partners).toMatch(/b2b_json|catalog_and_demo|enterprise_and_b2b/);
    expect(Array.isArray(payload.partners)).toBe(true);
    expect(payload.partners.length).toBeGreaterThan(0);
  });

  it('returns full reference payload with rf subjects', () => {
    const payload = resolveWorkshop2SewingPlanReferencePayload();
    expect(Array.isArray(payload.partners)).toBe(true);
    expect(Array.isArray(payload.rfSubjects)).toBe(true);
    expect(Array.isArray(payload.rfSubjectExtras)).toBe(true);
    expect(payload.rfSubjects.length).toBeGreaterThan(0);
  });
});
