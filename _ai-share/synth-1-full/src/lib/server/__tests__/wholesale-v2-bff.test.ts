import { buildWholesaleV2CorePath, createWholesaleV2CoreRequest } from '@/lib/server/wholesale-v2-bff';

describe('Wholesale V2 BFF route mapping', () => {
  it('maps public endpoints without a v2 prefix', () => {
    expect(buildWholesaleV2CorePath(['health'])).toBe('/health');
    expect(buildWholesaleV2CorePath(['openapi.json'])).toBe('/openapi.json');
  });

  it('maps business paths under the v2 transport contract', () => {
    expect(buildWholesaleV2CorePath(['workspace'])).toBe('/v2/workspace');
    expect(buildWholesaleV2CorePath(['orders', 'order-1', 'accept'])).toBe('/v2/orders/order-1/accept');
  });

  it('preserves method, authorization and idempotency headers', () => {
    const source = new Request('https://syntha.test/api/wholesale-v2/relationships', {
      method: 'POST',
      headers: { authorization: 'Bearer token', 'idempotency-key': 'command-1' },
      body: JSON.stringify({ brandId: 'brand-1', shopId: 'shop-1' }),
    });
    const mapped = createWholesaleV2CoreRequest(source, ['relationships']);
    expect(new URL(mapped.url).pathname).toBe('/v2/relationships');
    expect(mapped.method).toBe('POST');
    expect(mapped.headers.get('authorization')).toBe('Bearer token');
    expect(mapped.headers.get('idempotency-key')).toBe('command-1');
  });
});
