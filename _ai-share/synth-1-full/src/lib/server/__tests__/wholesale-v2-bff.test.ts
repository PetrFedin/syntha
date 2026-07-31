import { buildWholesaleV2CorePath, createWholesaleV2CoreRequest } from '@/lib/server/wholesale-v2-bff';

class TestHeaders {
  private readonly values = new Map<string, string>();
  constructor(init: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(init)) this.values.set(key.toLowerCase(), value);
  }
  get(name: string): string | null { return this.values.get(name.toLowerCase()) ?? null; }
}

class TestRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: TestHeaders;
  constructor(input: string | URL | TestRequest, init: { method?: string; headers?: Record<string, string> } | TestRequest = {}) {
    const inherited = init instanceof TestRequest ? init : input instanceof TestRequest ? input : null;
    this.url = String(input instanceof TestRequest ? input.url : input);
    this.method = inherited?.method ?? ('method' in init ? init.method : undefined) ?? 'GET';
    this.headers = inherited?.headers ?? new TestHeaders('headers' in init ? init.headers : undefined);
  }
}

describe('Wholesale V2 BFF route mapping', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'Request', { value: TestRequest, configurable: true });
  });

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
    });
    const mapped = createWholesaleV2CoreRequest(source, ['relationships']);
    expect(new URL(mapped.url).pathname).toBe('/v2/relationships');
    expect(mapped.method).toBe('POST');
    expect(mapped.headers.get('authorization')).toBe('Bearer token');
    expect(mapped.headers.get('idempotency-key')).toBe('command-1');
  });
});
