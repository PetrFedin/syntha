import { loadWholesaleWorkspace } from '@/lib/wholesale-v2/client';

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('Wholesale V2 client', () => {
  it('uses Firebase bearer token and normalizes workspace arrays', async () => {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const workspace = await loadWholesaleWorkspace(
      { getIdToken: async () => 'token-1' },
      async (input, init) => {
        calls.push({ input, init });
        return response(200, { data: { organisations: [{ id: 'brand-1' }], cycles: [] } });
      },
    );
    expect(calls[0].input).toBe('/api/wholesale-v2/workspace');
    expect((calls[0].init?.headers as Record<string, string>).authorization).toBe('Bearer token-1');
    expect(workspace.organisations).toEqual([{ id: 'brand-1' }]);
    expect(workspace.orders).toEqual([]);
  });

  it('surfaces stable API error codes', async () => {
    await expect(
      loadWholesaleWorkspace(
        { getIdToken: async () => 'token-1' },
        async () => response(403, { error: { code: 'CAPABILITY_DENIED', message: 'Denied' } }),
      ),
    ).rejects.toThrow('CAPABILITY_DENIED: Denied');
  });
});
