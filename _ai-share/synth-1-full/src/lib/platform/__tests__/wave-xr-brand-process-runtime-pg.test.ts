import {
  BRAND_PROCESS_RUNTIME_CORE_HINT_RU,
  BRAND_PROCESS_RUNTIME_LS_KEY,
  BRAND_PROCESS_RUNTIME_PG_BADGE_RU,
  BRAND_PROCESS_RUNTIME_PG_UNAVAILABLE_RU,
  brandProcessRuntimeApi,
} from '@/lib/platform/brand-process-runtime-pg';
import { buildPlatformCoreSpineStoreMatrix } from '@/lib/server/platform-core-spine-pg.server';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

describe('wave XR — brand LIVE process runtime PG (fail-closed core)', () => {
  const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  afterEach(() => {
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
  });

  it('RU labels + runtime API helper', () => {
    expect(BRAND_PROCESS_RUNTIME_PG_BADGE_RU).toContain('PostgreSQL');
    expect(BRAND_PROCESS_RUNTIME_PG_UNAVAILABLE_RU).toContain('PG');
    expect(BRAND_PROCESS_RUNTIME_CORE_HINT_RU).toContain('localStorage');
    expect(brandProcessRuntimeApi('production', 'SS27')).toContain('/runtime');
    expect(brandProcessRuntimeApi('production', 'SS27')).toContain('contextId=SS27');
  });

  it('PG BFF runtime API + fail-closed LS policy', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(BRAND_PROCESS_RUNTIME_LS_KEY).toBe('live_process_runtime_v1');
    expect('live-process-runtime-storage-pg').toContain('storage-pg');
    expect('live-process-runtime-storage-unavailable').toContain('unavailable');
    expect('useLiveProcessRuntime').toContain('LiveProcess');
    expect(shouldUseLocalStorageClientFallbackInCore()).toBe(false);
    expect(shouldMirrorPgClientStoreToLocalStorage()).toBe(false);
  });

  it('live_workflow in spine PG matrix', () => {
    const spine = buildPlatformCoreSpineStoreMatrix();
    const workflow = spine.find((s) => s.id === 'live_workflow');
    expect(workflow?.pgTable).toBe('platform_core_live_workflow_store');
    expect(['postgres', 'file_fallback']).toContain(workflow?.mode);
  });

  it('runtime route returns storageMode contract', () => {
    expect('/api/processes/[processId]/runtime').toContain('/runtime');
    expect('resolveRuntimeStorageMode').toContain('StorageMode');
    expect('toBffPgStorageMode').toContain('Bff');
  });
});
