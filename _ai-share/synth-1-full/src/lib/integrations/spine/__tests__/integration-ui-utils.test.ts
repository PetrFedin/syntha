import {
  mapOperationalStatusLabelRu,
  isIntegrationImportedWholesaleOrderId,
} from '../integration-ui-utils';

describe('integration-ui-utils', () => {
  it('detects INT-JOOR wholesale ids', () => {
    expect(isIntegrationImportedWholesaleOrderId('INT-JOOR-abc')).toBe(true);
    expect(isIntegrationImportedWholesaleOrderId('B2B-DEMO-1')).toBe(false);
  });

  it('maps pending_approval to RU label', () => {
    expect(mapOperationalStatusLabelRu('pending_approval')).toBe('На согласовании');
  });
});
