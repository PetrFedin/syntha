import fs from 'node:fs';
import path from 'node:path';

import {
  BRAND_SKU_WIZARD_DRAFT_API,
  BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_RU,
  BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_TESTID,
  BRAND_SKU_WIZARD_DRAFT_LS_KEY_PREFIX,
  BRAND_SKU_WIZARD_DRAFT_PG_BADGE_RU,
  BRAND_SKU_WIZARD_DRAFT_PG_BADGE_TESTID,
  BRAND_SKU_WIZARD_DRAFT_PG_TABLE,
  BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_RU,
  BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_TESTID,
  brandSkuWizardDraftApiPath,
} from '@/lib/platform/wave-yd-brand-sku-wizard-draft-pg';
import {
  loadCreateArticleWizardDraftWithMode,
  resetCreateArticleWizardDraftPersistModeCacheForTests,
} from '@/lib/production/create-article-wizard-draft-client';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

const SRC = path.join(process.cwd(), 'src');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave YD — brand SKU wizard draft PG (fail-closed core)', () => {
  const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  beforeEach(() => {
    resetCreateArticleWizardDraftPersistModeCacheForTests();
  });

  afterEach(() => {
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
  });

  it('RU labels + PG badge / fail-closed banner testids', () => {
    expect(BRAND_SKU_WIZARD_DRAFT_PG_BADGE_RU).toContain('PostgreSQL');
    expect(BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_RU).toContain('PG');
    expect(BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_RU).toContain('core:bootstrap');
    expect(BRAND_SKU_WIZARD_DRAFT_PG_BADGE_TESTID).toContain('storage-pg');
    expect(BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_TESTID).toContain('unavailable');
    expect(BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_TESTID).toContain('fail-closed');
  });

  it('PG BFF API + migration table', () => {
    expect(BRAND_SKU_WIZARD_DRAFT_API).toContain('create-article-wizard-draft');
    expect(brandSkuWizardDraftApiPath('SS27')).toContain('SS27');
    expect('056_wave_ss_create_article_wizard_drafts').toContain('wizard_drafts');
    expect(BRAND_SKU_WIZARD_DRAFT_PG_TABLE).toBe('brand_create_article_wizard_drafts');
    expect(BRAND_SKU_WIZARD_DRAFT_LS_KEY_PREFIX).toContain('articleDraft');
  });

  it('fail-closed LS policy + client load/persist', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(shouldUseLocalStorageClientFallbackInCore()).toBe(false);
    expect(shouldMirrorPgClientStoreToLocalStorage()).toBe(false);

    const client = read('lib/production/create-article-wizard-draft-client.ts');
    expect(client).toContain('loadCreateArticleWizardDraftWithMode');
    expect(client).toContain('shouldMirrorPgClientStoreToLocalStorage');

    const store = read('lib/production/create-article-wizard-draft-store.ts');
    expect(store).toContain('shouldUseLocalStorageClientFallbackInCore');
  });

  it('Workshop2CreateArticleDialog PG badges + fail-closed banner', () => {
    const dialog = read('components/brand/production/Workshop2CreateArticleDialog.tsx');
    expect(dialog).toContain('BRAND_SKU_WIZARD_DRAFT_PG_BADGE_TESTID');
    expect(dialog).toContain('BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_TESTID');
    expect(dialog).toContain('BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_TESTID');
    expect(dialog).toContain('loadCreateArticleWizardDraftWithMode');
  });

  it('postgres repository + BFF route contract', () => {
    const repo = read('lib/server/brand-create-article-wizard-draft-repository.ts');
    expect(repo).toContain(BRAND_SKU_WIZARD_DRAFT_PG_TABLE);
    expect(repo).toContain("storageMode: 'postgres'");
    const route = read(
      'app/api/brand/production/create-article-wizard-draft/[collectionId]/route.ts'
    );
    expect(route).toContain('getBrandCreateArticleWizardDraftServer');
    expect(route).toContain('putBrandCreateArticleWizardDraftServer');
  });

  it('loadCreateArticleWizardDraftWithMode GET PG in core mode', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const draft = {
      v: 1,
      mode: 'new' as const,
      baseLineId: '',
      baseSearch: '',
      sku: 'YD-SKU-1',
      name: 'Wave YD',
      comment: '',
      audienceId: 'women',
      l1Name: '',
      l2Name: '',
      l3Name: '',
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, draft, storageMode: 'postgres' }),
    });
    global.fetch = fetchMock as typeof fetch;

    const loaded = await loadCreateArticleWizardDraftWithMode('SS27');
    expect(loaded.persistMode).toBe('postgres');
    expect(loaded.pgUnavailable).toBe(false);
    expect(loaded.draft?.sku).toBe('YD-SKU-1');
    expect(fetchMock).toHaveBeenCalledWith(
      brandSkuWizardDraftApiPath('SS27'),
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('loadCreateArticleWizardDraftWithMode fail-closed when PG down in core', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const fetchMock = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    global.fetch = fetchMock as typeof fetch;

    const loaded = await loadCreateArticleWizardDraftWithMode('SS27');
    expect(loaded.persistMode).toBe('postgres');
    expect(loaded.pgUnavailable).toBe(true);
    expect(loaded.draft).toBeNull();
  });
});
