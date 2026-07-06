import {
  BRAND_PRODUCTION_OPS_HANDOFF_PEER_LINK_RU,
  BRAND_PRODUCTION_OPS_LS_KEY,
  BRAND_PRODUCTION_OPS_OPERATIONS_PEER_LINK_RU,
  BRAND_PRODUCTION_OPS_PG_BADGE_RU,
  BRAND_PRODUCTION_OPS_STATE_API,
  BRAND_PRODUCTION_OPS_SPINE_API,
  brandProductionOpsHandoffPeerHref,
  brandProductionOpsOperationsPeerHref,
} from '@/lib/platform/brand-production-ops-pg';
import { buildPlatformCoreSpineStoreMatrix } from '@/lib/server/platform-core-spine-pg.server';
import {
  loadBrandProductionOpsWithMode,
  persistBrandProductionOpsState,
} from '@/lib/brand-production/brand-production-ops-client';
import { createSeedState } from '@/lib/brand-production/seed';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

describe('wave XI — brand production ops PG (fail-closed core)', () => {
  const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  afterEach(() => {
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
  });

  it('RU labels + operations ↔ handoff peer href helpers', () => {
    expect(BRAND_PRODUCTION_OPS_PG_BADGE_RU).toContain('PostgreSQL');
    expect(BRAND_PRODUCTION_OPS_OPERATIONS_PEER_LINK_RU).toContain('PO/BOM');
    expect(BRAND_PRODUCTION_OPS_HANDOFF_PEER_LINK_RU).toContain('Передача');
    const orderId = 'INT-SS27-001';
    const cid = 'SS27';
    expect(brandProductionOpsOperationsPeerHref(orderId, cid)).toContain('pcf=operations');
    expect(brandProductionOpsOperationsPeerHref(orderId, cid)).toContain(cid);
    expect(brandProductionOpsHandoffPeerHref(orderId, cid)).toContain('pcf=handoff');
  });

  it('PG BFF APIs + fail-closed LS policy', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(BRAND_PRODUCTION_OPS_STATE_API).toContain('operations-state');
    expect(BRAND_PRODUCTION_OPS_SPINE_API).toContain('/ops');
    expect(BRAND_PRODUCTION_OPS_LS_KEY).toContain('unified');
    expect('loadBrandProductionOpsWithMode').toContain('OpsWithMode');
    expect('brand-production-ops-storage-pg').toContain('storage-pg');
    expect(shouldUseLocalStorageClientFallbackInCore()).toBe(false);
    expect(shouldMirrorPgClientStoreToLocalStorage()).toBe(false);
  });

  it('operations ↔ handoff peer strip testids', () => {
    expect('brand-op-operations-handoff-peer-strip').toContain('peer-strip');
    expect('brand-op-handoff-operations-peer-link').toContain('operations-peer');
    expect('brand-op-handoff-peer-link').toContain('handoff-peer');
    expect('brand-op-handoff-factory-queue-peer-link').toContain('factory-queue');
  });

  it('brand_production_ops_state in spine PG matrix', () => {
    const spine = buildPlatformCoreSpineStoreMatrix();
    const ops = spine.find((s) => s.id === 'brand_production_ops');
    expect(ops?.pgTable).toBe('brand_production_ops_state');
    expect(['postgres', 'localStorage_client']).toContain(ops?.mode);
  });

  it('brand-production-ops-client GET/PUT operations-state in PG mode', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const seed = createSeedState();
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, state: seed, storageMode: 'pg' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, storageMode: 'pg' }),
      });
    global.fetch = fetchMock as typeof fetch;

    const loaded = await loadBrandProductionOpsWithMode();
    expect(loaded.storageMode).toBe('postgres');
    expect(loaded.state.collections.length).toBeGreaterThan(0);

    await persistBrandProductionOpsState(seed);
    expect(fetchMock).toHaveBeenCalledWith(
      BRAND_PRODUCTION_OPS_STATE_API,
      expect.objectContaining({ method: 'PUT' })
    );
  });
});
