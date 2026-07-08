import {
  isPlatformCoreDemoPinOrderId,
  isPlatformCorePgCheckoutOrderId,
  isPlatformCorePgLogisticsWholesaleOrderId,
  pickPreferredRegistryOrderId,
  pickPreferredHandoffQueueOrderId,
  resolveActiveWholesaleOrderId,
  resolvePlatformCoreCabinetOrderId,
  resolveSpineFallbackOrderId,
} from '@/lib/platform-core-spine-active-order-fallback';

describe('platform-core-spine-active-order-fallback', () => {
  it('detects demo pin order ids', () => {
    expect(isPlatformCoreDemoPinOrderId('B2B-DEMO-SHOP1-SS27')).toBe(true);
    expect(isPlatformCorePgCheckoutOrderId('B2B-1781275919974')).toBe(true);
    expect(isPlatformCorePgLogisticsWholesaleOrderId('B2B-DEMO-SHOP1-SS27')).toBe(true);
    expect(isPlatformCorePgLogisticsWholesaleOrderId('B2B-1781275919974')).toBe(true);
    expect(isPlatformCorePgLogisticsWholesaleOrderId('INT-JOOR-golden-joor-123')).toBe(false);
    expect(isPlatformCoreDemoPinOrderId('B2B-1781275919974')).toBe(false);
  });

  it('suppresses B2B-DEMO fallback when registry empty', () => {
    expect(
      resolveActiveWholesaleOrderId({
        fallbackOrderId: 'B2B-DEMO-SHOP1-SS27',
        registryQueriedEmpty: true,
        resolveFromIncludesRegistry: true,
      })
    ).toBe('');
  });

  it('keeps PG order fallback when registry empty', () => {
    expect(
      resolveActiveWholesaleOrderId({
        fallbackOrderId: 'B2B-123',
        registryQueriedEmpty: true,
        resolveFromIncludesRegistry: true,
      })
    ).toBe('B2B-123');
  });

  it('prefers PG checkout fallback over INT spine overlay', () => {
    expect(
      resolveActiveWholesaleOrderId({
        spineWholesaleOrderId: 'INT-JOOR-golden-joor-123',
        fallbackOrderId: 'B2B-1781275919974',
        registryQueriedEmpty: false,
        resolveFromIncludesRegistry: false,
      })
    ).toBe('B2B-1781275919974');
  });

  it('pickPreferredHandoffQueueOrderId prefers newest PG over older PG and INT', () => {
    expect(
      pickPreferredHandoffQueueOrderId([
        { b2bOrderId: 'INT-JOOR-golden-joor-123' },
        { b2bOrderId: 'B2B-100', handoffAt: '2026-01-01T00:00:00.000Z' },
        { b2bOrderId: 'B2B-200', handoffAt: '2026-06-01T00:00:00.000Z' },
      ])
    ).toBe('B2B-200');
  });

  it('prefers spine hit over fallback', () => {
    expect(
      resolveActiveWholesaleOrderId({
        spineWholesaleOrderId: 'B2B-99',
        fallbackOrderId: 'B2B-DEMO-SHOP1-SS27',
        registryQueriedEmpty: false,
        resolveFromIncludesRegistry: true,
      })
    ).toBe('B2B-99');
  });

  it('pickPreferredRegistryOrderId prefers PG checkout over demo pin', () => {
    expect(
      pickPreferredRegistryOrderId([{ id: 'B2B-DEMO-SHOP1-SS27' }, { id: 'B2B-1781275919974' }])
    ).toBe('B2B-1781275919974');
  });

  it('pickPreferredRegistryOrderId prefers newest PG checkout when several exist', () => {
    expect(
      pickPreferredRegistryOrderId([
        { id: 'B2B-100' },
        { id: 'B2B-200' },
        { id: 'B2B-DEMO-SHOP1-SS27' },
      ])
    ).toBe('B2B-200');
  });

  it('resolveSpineFallbackOrderId suppresses demo when registry empty', () => {
    expect(resolveSpineFallbackOrderId('B2B-DEMO-SHOP1-SS27', true)).toBe('');
    expect(resolveSpineFallbackOrderId('B2B-123', true)).toBe('B2B-123');
  });

  it('resolvePlatformCoreCabinetOrderId prefers demo pin over ephemeral PG checkout', () => {
    expect(resolvePlatformCoreCabinetOrderId('B2B-1781562585152', 'B2B-DEMO-SHOP1-SS27')).toBe(
      'B2B-DEMO-SHOP1-SS27'
    );
    expect(resolvePlatformCoreCabinetOrderId('B2B-DEMO-SHOP1-SS27', 'B2B-1781562585152')).toBe(
      'B2B-DEMO-SHOP1-SS27'
    );
    expect(resolvePlatformCoreCabinetOrderId('B2B-200', 'B2B-100')).toBe('B2B-200');
  });
});
