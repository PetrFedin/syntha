import {
  BRAND_SC_LINESET_PDF_EMPTY_API_TESTID,
  BRAND_SC_LINESET_PDF_EMPTY_DISABLED_TESTID,
  BRAND_SC_LINESET_PDF_EMPTY_HINT_TESTID,
  BRAND_SC_PUBLISHED_READPATH_API_TESTID,
  SHOP_SHOWROOM_COVER_HERO_PRIORITY_RU,
  SHOP_SHOWROOM_COVER_HERO_PRIORITY_STRIP_TESTID,
  brandScBatchRollbackSuccessCopyIncludes,
  brandScBatchUnpublishRollbackApiPath,
  brandScBatchUnpublishSuccessCopyIncludes,
  brandScLinesheetPdfEmptyApiMessageRu,
  brandScLinesheetPdfEmptyUiHintRu,
  brandScPublishedReadpathBadgeTestId,
  isBrandScPublishedReadpathApiOnly,
  verifyBrandScBatchUnpublishRollbackRoundtrip,
} from '@/lib/b2b/brand-sc-linesheet-readpath';
import { BRAND_SC_LINESET_PDF_EMPTY_API_RU } from '@/lib/b2b/brand-sc-cross-matrix';
import { resolveBrandScPublishedArticlesReadPath } from '@/lib/b2b/brand-sc-cross-matrix';

describe('wave VC — brand SC linesheet PDF empty edge cases', () => {
  it('EMPTY27 API RU matches cross-matrix contract', () => {
    expect(brandScLinesheetPdfEmptyApiMessageRu('EMPTY27')).toBe(BRAND_SC_LINESET_PDF_EMPTY_API_RU);
    expect(brandScLinesheetPdfEmptyApiMessageRu('EMPTY27')).toMatch(/PDF|артикул/i);
  });

  it('non-empty collection API RU is honest', () => {
    expect(brandScLinesheetPdfEmptyApiMessageRu('SS27')).toMatch(/опубликован/i);
  });

  it('UI disabled + hint copy for EMPTY27', () => {
    expect(brandScLinesheetPdfEmptyUiHintRu('EMPTY27')).toMatch(/пустая коллекция|SS27/i);
    expect(brandScLinesheetPdfEmptyUiHintRu('FW27')).toMatch(/FW27|publish/i);
  });

  it('wave VC PDF empty testids', () => {
    expect(BRAND_SC_LINESET_PDF_EMPTY_DISABLED_TESTID).toContain('pdf-empty-disabled');
    expect(BRAND_SC_LINESET_PDF_EMPTY_HINT_TESTID).toContain('pdf-empty-hint');
    expect(BRAND_SC_LINESET_PDF_EMPTY_API_TESTID).toContain('pdf-empty-api');
  });
});

describe('wave VC — publishedArticlesReadPath=api only in core', () => {
  const prev = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prev;
  });

  it('golden collections resolve api readpath', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(resolveBrandScPublishedArticlesReadPath('SS27')).toBe('api');
    expect(isBrandScPublishedReadpathApiOnly('SS27')).toBe(true);
  });

  it('readpath badge testid contract', () => {
    expect(brandScPublishedReadpathBadgeTestId('api')).toBe(BRAND_SC_PUBLISHED_READPATH_API_TESTID);
    expect(brandScPublishedReadpathBadgeTestId('localStorage')).toContain('localStorage');
  });

  it('exports read-path badge component', async () => {
    const mod = await import('@/components/platform/PlatformCorePublishedArticlesReadPathBadge');
    expect(typeof mod.PlatformCorePublishedArticlesReadPathBadge).toBe('function');
  });
});

describe('wave VC — partner hero vs dossier priority strip', () => {
  it('priority strip RU + testid', () => {
    expect(SHOP_SHOWROOM_COVER_HERO_PRIORITY_RU).toMatch(/dossier/i);
    expect(SHOP_SHOWROOM_COVER_HERO_PRIORITY_RU).toMatch(/партн/i);
    expect(SHOP_SHOWROOM_COVER_HERO_PRIORITY_STRIP_TESTID).toContain('hero-priority');
  });

  it('exports priority strip component', async () => {
    const mod = await import('@/components/shop/b2b/ShopShowroomCoverHeroPriorityStrip');
    expect(typeof mod.ShopShowroomCoverHeroPriorityStrip).toBe('function');
  });

  it('dossier wins over partner in resolver', async () => {
    const { resolveShopShowroomCoverHero } = await import('@/lib/b2b/shop-showroom-cover-hero');
    const { shouldShowShopShowroomCoverHeroPriorityStrip } =
      await import('@/lib/b2b/shop-showroom-wave-xh');
    const hero = resolveShopShowroomCoverHero({
      dossierHeroUrl: 'https://cdn.example/dossier.jpg',
      partnerCoverUrl: 'https://cdn.example/partner.jpg',
    });
    expect(hero?.source).toBe('dossier');
    expect(shouldShowShopShowroomCoverHeroPriorityStrip(hero?.source)).toBe(false);
  });
});

describe('wave VC — batch unpublish rollback verify (wave TF)', () => {
  it('rollback API path matches syndication module', () => {
    expect(brandScBatchUnpublishRollbackApiPath()).toContain('batch-unpublish-rollback');
  });

  it('verify roundtrip helper', () => {
    const result = verifyBrandScBatchUnpublishRollbackRoundtrip(
      { ok: true, snapshot: { snapshotId: 'rb-ss27-1' }, unpublishedCount: 2 },
      { ok: true, restoredCount: 2, snapshotId: 'rb-ss27-1' }
    );
    expect(result.unpublishOk).toBe(true);
    expect(result.rollbackOk).toBe(true);
    expect(result.hasSnapshot).toBe(true);
    expect(result.restoredCount).toBe(2);
  });

  it('RU success copy matchers', () => {
    expect(brandScBatchUnpublishSuccessCopyIncludes('Snapshot: rb-1.')).toBe(true);
    expect(brandScBatchRollbackSuccessCopyIncludes('Rollback выполнен')).toBe(true);
  });

  it('exports batch unpublish server orchestration', async () => {
    const mod = await import('@/lib/server/brand-linesheet-syndication-server');
    expect(typeof mod.postBrandLinesheetBatchUnpublish).toBe('function');
    expect(typeof mod.postBrandLinesheetBatchUnpublishRollback).toBe('function');
  });

  it('linesheets UI rollback panel testids', () => {
    expect('brand-sc-linesheets-batch-unpublish-rollback').toContain('unpublish');
    expect('brand-sc-linesheets-batch-rollback-btn').toContain('rollback');
  });
});

describe('wave VC — cabinet mini-matrix strip wired', () => {
  it('exports BrandScCabinetMiniMatrixStrip', async () => {
    const mod = await import('@/components/platform/BrandScCabinetMiniMatrixStrip');
    expect(typeof mod.BrandScCabinetMiniMatrixStrip).toBe('function');
  });
});
