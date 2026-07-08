import fs from 'node:fs';
import path from 'node:path';

import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LABEL_RU,
  BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LINK_TESTID,
  BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID,
  BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_PEER_LABEL_RU,
  WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_RU,
  WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_TESTID,
  buildBrandDossierDiffAttachTzPoCrossLinks,
} from '@/lib/platform/wave-xq-brand-dossier-dual-write-off';
import { WORKSHOP2_PHASE1_DOSSIER_STORAGE_KEY } from '@/lib/production/workshop2-phase1-dossier-storage';
import {
  shouldPersistPhase1DossierOfflineDualWrite,
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

const SRC = path.join(process.cwd(), 'src');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave XQ — brand dossier/ТЗ offline dual-write OFF in core', () => {
  const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  afterEach(() => {
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
  });

  it('RU offline-blocked banner + testid', () => {
    expect(WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_RU).toMatch(/офлайн/i);
    expect(WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_RU).toContain('PostgreSQL');
    expect(WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_TESTID).toContain(
      'offline-blocked-banner'
    );
  });

  it('fail-closed LS read/write + offline dual-write policy in core', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(WORKSHOP2_PHASE1_DOSSIER_STORAGE_KEY).toContain('workshop2Phase1Dossier');
    expect(shouldUseLocalStorageClientFallbackInCore()).toBe(false);
    expect(shouldMirrorPgClientStoreToLocalStorage()).toBe(false);
    expect(shouldPersistPhase1DossierOfflineDualWrite()).toBe(false);
  });

  it('phase1-dossier persist/hydrate skip LS mirror in core', () => {
    const persist = read('components/brand/production/use-workshop2-phase1-dossier-persist.ts');
    const hydrate = read(
      'components/brand/production/use-workshop2-phase1-dossier-hydrate-from-storage.ts'
    );
    expect(persist).toContain('shouldPersistPhase1DossierOfflineDualWrite');
    expect(hydrate).toContain('shouldPersistPhase1DossierOfflineDualWrite');
    expect(persist).not.toContain('allowLocalMirror');
  });

  it('cross-link dossier diff viewer ↔ attach TZ PO peer', () => {
    const links = buildBrandDossierDiffAttachTzPoCrossLinks({
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
    });
    expect(links.diffViewerHref).toContain('#brand-dossier-factory-diff');
    expect(links.attachTzPoHref).toContain('#w2-tz-export');
    expect(links.attachTzPdfPeerHref).toContain('attachTzPdf=1');
    expect(BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID).toContain('cross-strip');
    expect(BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LINK_TESTID).toContain('diff-viewer');
    expect(BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_PEER_LABEL_RU).toContain('PO');
    expect(BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LABEL_RU).toMatch(/сверка/i);
  });

  it('W2 article wayfinding mounts offline-blocked banner in core', () => {
    const wayfinding = read(
      'app/brand/production/workshop2/(w2-enterprise)/c/[collectionId]/a/[articleId]/workshop2-article-core-wayfinding.tsx'
    );
    const banner = read(
      'components/brand/production/Workshop2Phase1DossierCoreOfflineBlockedBanner.tsx'
    );
    expect(wayfinding).toContain('Workshop2Phase1DossierCoreOfflineBlockedBanner');
    expect(banner).toContain('WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_TESTID');
    expect(banner).toContain('data-offline-blocked');
  });
});
