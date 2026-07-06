import fs from 'node:fs';
import path from 'node:path';

import { resolveBrandScPublishedArticlesReadPath } from '@/lib/b2b/brand-sc-cross-matrix';
import {
  shouldShowWorkshop2CoreHubReadPathBanner,
  shouldSuppressWorkshop2CorePgSyncHintForReadPathBanner,
  WORKSHOP2_CORE_HUB_READPATH_BOOTSTRAP_CMD,
  WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_RU,
  WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID,
} from '@/lib/platform/wave-xs-brand-w2-readpath-banner';
import {
  resolveWorkshop2HubPublishedArticlesReadPath,
  shouldPersistWorkshop2ClientOverlayToLocalStorage,
} from '@/lib/production/workshop2-pg-read-path-policy';

const SRC = path.join(process.cwd(), 'src');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave XS — brand W2 readPath banner + api-only in core', () => {
  const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  afterEach(() => {
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
  });

  it('RU banner + testid contract', () => {
    expect(WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_RU).toMatch(/PostgreSQL/i);
    expect(WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_RU).toMatch(/localStorage/i);
    expect(WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_RU).toMatch(/API/i);
    expect(WORKSHOP2_CORE_HUB_READPATH_BOOTSTRAP_CMD).toBe('npm run core:bootstrap');
    expect(WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID).toContain('readpath');
  });

  it('banner suppressed — offline demo uses localStorage readPath', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(shouldShowWorkshop2CoreHubReadPathBanner(true)).toBe(false);
    expect(shouldShowWorkshop2CoreHubReadPathBanner(false)).toBe(false);

    delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    expect(shouldShowWorkshop2CoreHubReadPathBanner(false)).toBe(false);
  });

  it('publishedArticlesReadPath: api when PG live, localStorage offline in core', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(
      resolveWorkshop2HubPublishedArticlesReadPath({ collectionId: 'SS27', preferApi: true })
    ).toBe('api');
    expect(
      resolveWorkshop2HubPublishedArticlesReadPath({ collectionId: 'SS27', preferApi: false })
    ).toBe('localStorage');
    expect(
      resolveWorkshop2HubPublishedArticlesReadPath({ collectionId: 'EMPTY27', preferApi: false })
    ).toBe('localStorage');
    expect(resolveBrandScPublishedArticlesReadPath('SS27')).toBe('api');
    expect(shouldPersistWorkshop2ClientOverlayToLocalStorage()).toBe(false);
  });

  it('pg-sync hint not suppressed by readPath banner (banner off)', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(shouldSuppressWorkshop2CorePgSyncHintForReadPathBanner(false)).toBe(false);
    expect(shouldSuppressWorkshop2CorePgSyncHintForReadPathBanner(true)).toBe(false);
  });

  it('W2 hub dedupes pg-sync hint (banner lives in provider)', () => {
    const hub = read('app/brand/production/workshop2/workshop2-hub-core.tsx');
    expect(hub).toContain('shouldSuppressWorkshop2CorePgSyncHintForReadPathBanner');
    expect(hub).toContain('preferPgApiForPublishedArticles');
    expect(hub).not.toContain('Workshop2CoreHubReadPathBanner');
  });

  it('local-state provider renders readPath banner + policy', () => {
    const provider = read('app/brand/production/workshop2/workshop2-local-state-provider.tsx');
    expect(provider).toContain('Workshop2CoreHubReadPathBanner');
    expect(provider).toContain('workshop2-core-readpath-banner-slot');
    expect(provider).toContain('resolveWorkshop2HubPublishedArticlesReadPath');
    expect(provider).toContain('publishedArticlesReadPath: readPath');
    expect(provider).toContain('preferPgApiForPublishedArticles');
    expect(provider).toContain('authoritativeOnly: true');
  });
});
