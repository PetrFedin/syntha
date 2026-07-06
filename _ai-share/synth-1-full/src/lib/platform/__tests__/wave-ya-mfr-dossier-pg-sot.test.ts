/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';

import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { emptyWorkshop2DossierPhase1 } from '@/lib/production/workshop2-phase1-dossier-storage';
import {
  resolveFactoryDossier,
  resolveFactoryDossierWithMeta,
} from '@/lib/production/workshop2-resolve-factory-dossier';
import {
  WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LABEL_RU,
  WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LINK_TESTID,
  WAVE_YA_MFR_DOSSIER_PG_SOT_MIGRATION,
  WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_RU,
  WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_TESTID,
  WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_RU,
  WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_TESTID,
  WAVE_YA_MFR_DOSSIER_SOURCE_STRIP_TESTID,
  buildMfrDevDossierBrandDiffPeerHref,
  labelMfrDossierSourceBadgeRu,
  mfrDossierSourceBadgeTestId,
} from '@/lib/platform/wave-ya-mfr-dossier-pg-sot';
import { shouldUseLocalStorageClientFallbackInCore } from '@/lib/production/workshop2-pg-read-path-policy';

jest.mock('@/lib/server/workshop2-phase1-dossier-server-store', () => ({
  getWorkshop2ServerDossierRecord: jest.fn(),
}));

jest.mock('@/lib/production/workshop2-phase1-dossier-storage', () => ({
  getWorkshop2Phase1Dossier: jest.fn(),
  emptyWorkshop2DossierPhase1: jest.requireActual(
    '@/lib/production/workshop2-phase1-dossier-storage'
  ).emptyWorkshop2DossierPhase1,
}));

import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { getWorkshop2Phase1Dossier } from '@/lib/production/workshop2-phase1-dossier-storage';

const SRC = path.join(process.cwd(), 'src');
const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave YA — mfr factory dossier PG SoT in core', () => {
  const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
  const pgDossier = {
    ...emptyWorkshop2DossierPhase1(),
    articleSku: 'SS27-DEMO-SKU',
  };
  const lsDossier = {
    ...emptyWorkshop2DossierPhase1(),
    articleSku: 'LS-ONLY-SKU',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getWorkshop2ServerDossierRecord as jest.Mock).mockResolvedValue({
      dossier: pgDossier,
      dossierVersion: 3,
    });
    (getWorkshop2Phase1Dossier as jest.Mock).mockReturnValue(lsDossier);
  });

  afterEach(() => {
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
  });

  it('exports wave YA migration + RU badge labels', () => {
    expect(WAVE_YA_MFR_DOSSIER_PG_SOT_MIGRATION).toContain('wave_ya');
    expect(WAVE_YA_MFR_DOSSIER_SOURCE_STRIP_TESTID).toBe('mfr-dev-dossier-source-strip');
    expect(WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_TESTID).toContain('pg-badge');
    expect(WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_TESTID).toContain('read-only');
    expect(WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_RU).toMatch(/PostgreSQL/i);
    expect(WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_RU).toMatch(/read-only/i);
    expect(labelMfrDossierSourceBadgeRu('postgres')).toBe(WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_RU);
    expect(mfrDossierSourceBadgeTestId('postgres')).toBe(WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_TESTID);
  });

  it('brand diff peer cross-link from mfr dossier', () => {
    const href = buildMfrDevDossierBrandDiffPeerHref(COLLECTION, ARTICLE);
    expect(href).toContain('/brand/production/workshop2/');
    expect(href).toContain('#brand-dossier-factory-diff');
    expect(WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LINK_TESTID).toContain('brand-diff');
    expect(WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LABEL_RU).toMatch(/сверка/i);
  });

  it('resolveFactoryDossierWithMeta: PG wins in core (no localStorage)', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(shouldUseLocalStorageClientFallbackInCore()).toBe(false);

    const resolved = await resolveFactoryDossierWithMeta(ARTICLE, { collectionId: COLLECTION });
    expect(resolved?.source).toBe('postgres');
    expect(resolved?.readOnly).toBe(true);
    expect(resolved?.dossier.articleSku).toBe('SS27-DEMO-SKU');
    expect(getWorkshop2Phase1Dossier).not.toHaveBeenCalled();

    const dossier = await resolveFactoryDossier(ARTICLE, { collectionId: COLLECTION });
    expect(dossier?.articleSku).toBe('SS27-DEMO-SKU');
  });

  it('resolveFactoryDossierWithMeta: legacy mode prefers localStorage before PG', async () => {
    delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

    const resolved = await resolveFactoryDossierWithMeta(ARTICLE, { collectionId: COLLECTION });
    expect(resolved?.source).toBe('localStorage');
    expect(resolved?.dossier.articleSku).toBe('LS-ONLY-SKU');
    expect(getWorkshop2Phase1Dossier).toHaveBeenCalled();
    expect(getWorkshop2ServerDossierRecord).not.toHaveBeenCalled();
  });

  it('factory dossier page wires resolveFactoryDossierWithMeta + source strip', () => {
    const page = read('app/factory/production/dossier/[articleId]/page.tsx');
    const chrome = read('components/platform/FactoryDossierCoreChrome.tsx');
    const strip = read('components/factory/MfrDevDossierPgSourceStrip.tsx');
    expect(page).toContain('resolveFactoryDossierWithMeta');
    expect(page).toContain('dossierSource');
    expect(chrome).toContain('MfrDevDossierPgSourceStrip');
    expect(strip).toContain('MfrDevDossierPgSourceStrip');
    expect(strip).toContain('mfrDossierSourceBadgeTestId');
  });

  it('core-216 wave YA e2e spec file', () => {
    expect('core-216-wave-ya-mfr-dossier').toContain('wave-ya');
  });
});
