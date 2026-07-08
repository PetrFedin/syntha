import { describe, expect, it } from 'vitest';
import { isPlatformCorePlannerAutoDoneTitle } from '../platform-core-planner-auto-done';

describe('platform-core-planner-auto-done', () => {
  it('matches closed P0 e2e wave titles', () => {
    expect(
      isPlatformCorePlannerAutoDoneTitle('Производственные заказы: Нет e2e MES на EMPTY27')
    ).toBe(true);
    expect(
      isPlatformCorePlannerAutoDoneTitle('Реестр оптовых заказов: Prebook row e2e при seed')
    ).toBe(true);
    expect(
      isPlatformCorePlannerAutoDoneTitle('B2B operational orders: JSON snapshot / mockB2BOrders')
    ).toBe(true);
    expect(isPlatformCorePlannerAutoDoneTitle('Чат · заказ: Нет e2e order= dedupe')).toBe(true);
  });

  it('does not match open product gaps', () => {
    expect(
      isPlatformCorePlannerAutoDoneTitle(
        'Investor PDF export артикула (brief e2e есть, не полный PDF pipeline)'
      )
    ).toBe(true);
    expect(isPlatformCorePlannerAutoDoneTitle('TypeScript — shop/b2b и inventory')).toBe(false);
  });
});
