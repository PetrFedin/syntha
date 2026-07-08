import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  BRAND_DOSSIER_FACTORY_DIFF_API_PATH,
  brandDossierFactoryDiffApiPath,
} from '@/lib/fashion/brand-dossier-factory-diff';
import {
  buildBrandDossierFactoryDiffStubRows,
  summarizeBrandDossierFactoryDiffRu,
} from '@/lib/fashion/brand-dossier-factory-diff-stub';
import {
  brandB2bOrderAttachTzPdfApiPath,
  brandB2bOrderAttachTzPdfPeerHref,
  BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT,
} from '@/lib/fashion/brand-op-attach-tz-pdf';
import { buildBrandOpAttachTzPoSession } from '@/lib/fashion/brand-op-attach-tz-po-session';
import { resolveBrandDossierFactoryDiff } from '@/lib/server/brand-dossier-factory-diff';
import { attachBrandB2bOrderTzPdfToPo } from '@/lib/server/brand-b2b-order-attach-tz-pdf';
import { WORKSHOP2_PHASE1_DOSSIER_STORAGE_KEY } from '@/lib/production/workshop2-phase1-dossier-storage';
import {
  shouldPersistPhase1DossierOfflineDualWrite,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

describe('wave UN — brand dossier factory diff live + attach TZ PDF', () => {
  it('dossier factory diff API path contract', () => {
    expect(BRAND_DOSSIER_FACTORY_DIFF_API_PATH).toBe('/api/brand/workshop2/dossier-factory-diff');
    expect(
      brandDossierFactoryDiffApiPath(
        PLATFORM_CORE_DEMO.collectionId,
        PLATFORM_CORE_DEMO.demoArticleId
      )
    ).toContain('collectionId=SS27');
    expect(
      brandDossierFactoryDiffApiPath(
        PLATFORM_CORE_DEMO.collectionId,
        PLATFORM_CORE_DEMO.demoArticleId
      )
    ).toContain('articleId=');
  });

  it('live diff UI testids', () => {
    expect('brand-dossier-factory-diff-live-badge').toContain('live-badge');
    expect('brand-dossier-factory-diff-panel').toContain('factory-diff');
    expect('brand-dossier-factory-diff-factory-col').toContain('factory-col');
    expect('brand-op-attach-tz-po-link').toContain('attach-tz');
  });

  it('attach TZ PDF API + peer link on B2B order record', () => {
    expect(BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT).toBe('attach-tz-pdf');
    expect(brandB2bOrderAttachTzPdfApiPath(PLATFORM_CORE_DEMO.demoOrderId)).toContain(
      '/api/brand/b2b/orders/'
    );
    expect(brandB2bOrderAttachTzPdfApiPath(PLATFORM_CORE_DEMO.demoOrderId)).toContain(
      'attach-tz-pdf'
    );
    const peer = brandB2bOrderAttachTzPdfPeerHref(PLATFORM_CORE_DEMO.demoOrderId, {
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
    });
    expect(peer).toContain('attachTzPdf=1');
    expect(peer).toContain('#brand-op-attach-tz-pdf-peer');
    expect('brand-op-attach-tz-pdf-peer-link').toContain('attach-tz-pdf');
  });

  it('attach TZ PO session includes PDF peer href', () => {
    const session = buildBrandOpAttachTzPoSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
    });
    expect(session.attachTzPdfPeerHref).toContain('attachTzPdf=1');
    expect(session.attachTzPoHref).toContain('#w2-tz-export');
  });

  it('phase1-dossier offline dual-write OFF in core (fail-closed LS)', () => {
    const prev = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(WORKSHOP2_PHASE1_DOSSIER_STORAGE_KEY).toContain('workshop2Phase1Dossier');
    expect('shouldPersistPhase1DossierOfflineDualWrite').toContain('OfflineDualWrite');
    expect(shouldUseLocalStorageClientFallbackInCore()).toBe(false);
    expect(shouldPersistPhase1DossierOfflineDualWrite()).toBe(false);
    if (prev === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prev;
  });
});

describe('wave UN — server helpers', () => {
  it('resolveBrandDossierFactoryDiff returns structured result', async () => {
    const result = await resolveBrandDossierFactoryDiff({
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
    });
    expect(typeof result.ok).toBe('boolean');
    expect(typeof result.live).toBe('boolean');
    expect(typeof result.summaryRu).toBe('string');
    expect(Array.isArray(result.rows)).toBe(true);
  });

  it('attachBrandB2bOrderTzPdfToPo handles missing order', async () => {
    const result = await attachBrandB2bOrderTzPdfToPo({ orderId: 'INT-NO-SUCH-ORDER-UN' });
    expect(result.ok).toBe(false);
    expect(result.messageRu).toMatch(/не найден/i);
  });

  it('stub rows still available as fallback', () => {
    const rows = buildBrandDossierFactoryDiffStubRows({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
    });
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(summarizeBrandDossierFactoryDiffRu(rows)).toContain('совпадают');
  });
});
