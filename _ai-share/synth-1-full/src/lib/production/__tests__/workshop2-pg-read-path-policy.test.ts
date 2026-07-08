import {
  isWorkshop2CorePgReadPathOnly,
  resolveWorkshop2HubPublishedArticlesReadPath,
  shouldMirrorPgClientStoreToLocalStorage,
  shouldMirrorWorkshop2DossierToLocalStorage,
  shouldPersistPhase1DossierOfflineDualWrite,
  shouldPersistWorkshop2ClientOverlayToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

describe('workshop2-pg-read-path-policy', () => {
  const prev = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prev;
  });

  it('golden SS27 in core mode: api when PG live, localStorage when PG down', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(isWorkshop2CorePgReadPathOnly('SS27')).toBe(true);
    expect(
      resolveWorkshop2HubPublishedArticlesReadPath({ collectionId: 'SS27', preferApi: true })
    ).toBe('api');
    expect(
      resolveWorkshop2HubPublishedArticlesReadPath({ collectionId: 'SS27', preferApi: false })
    ).toBe('localStorage');
    expect(shouldMirrorWorkshop2DossierToLocalStorage('SS27')).toBe(false);
    expect(shouldPersistWorkshop2ClientOverlayToLocalStorage()).toBe(false);
    expect(shouldUseLocalStorageClientFallbackInCore()).toBe(false);
    expect(shouldPersistPhase1DossierOfflineDualWrite()).toBe(false);
    expect(shouldMirrorPgClientStoreToLocalStorage()).toBe(false);
  });

  it('non-golden EMPTY27 in core mode: localStorage when PG down', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(
      resolveWorkshop2HubPublishedArticlesReadPath({ collectionId: 'EMPTY27', preferApi: false })
    ).toBe('localStorage');
  });

  it('non-core mode keeps localStorage read path when API unavailable', () => {
    delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    expect(
      resolveWorkshop2HubPublishedArticlesReadPath({ collectionId: 'SS27', preferApi: false })
    ).toBe('localStorage');
    expect(shouldPersistWorkshop2ClientOverlayToLocalStorage()).toBe(true);
  });
});
