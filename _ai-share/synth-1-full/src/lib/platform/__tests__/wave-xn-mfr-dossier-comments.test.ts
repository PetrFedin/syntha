/** @jest-environment node */
import { NextRequest } from 'next/server';

jest.mock('@/lib/server/workshop2-route-auth', () => ({
  guardWorkshop2Route: jest.fn(async () => ({ actor: 'jest-wave-xn', actorLabel: 'jest-wave-xn' })),
  WORKSHOP2_READ_ROLES: [],
  WORKSHOP2_WRITE_ROLES: [],
}));

import {
  BRAND_DOSSIER_FACTORY_DIFF_MFR_COMMENTS_LINK_TESTID,
  BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR,
  FACTORY_DOSSIER_COMMENTS_API_PATH,
  MFR_DEV_DOSSIER_ANNOTATION_PANEL_ANCHOR,
  MFR_DOSSIER_COMMENTS_WAVE_XN_MIGRATION,
  brandDossierFactoryDiffViewerHref,
  buildMfrDossierCommentsPeerHrefs,
  factoryDossierCommentsApiPath,
  mfrDevDossierAnnotationPanelHref,
} from '@/lib/production/mfr-dossier-comments-wave-xn';
import {
  WAVE_XN_MFR_DOSSIER_ANNOTATION_PEER_STRIP_TESTID,
  WAVE_XN_MFR_DOSSIER_COMMENT_BRAND_DIFF_LINK_TESTID,
  WAVE_XN_MFR_DOSSIER_COMMENT_PEER_STRIP_TESTID,
  WAVE_XN_MFR_DOSSIER_COMMENT_PREFIX,
  WAVE_XN_MFR_DOSSIER_COMMENTS_API,
  WAVE_XN_MFR_DOSSIER_PEER_BRAND_DIFF_RU,
  WAVE_XN_MFR_DOSSIER_PEER_CHAT_RU,
  WAVE_XN_MFR_DOSSIER_PEER_MATERIALS_RU,
  WAVE_XN_MFR_DOSSIER_PEER_SAMPLE_QUEUE_RU,
  buildMfrDossierCommentMaterialsHref,
  buildMfrDossierCommentsApiHref,
  isWaveXnMfrDossierCommentId,
} from '@/lib/platform/wave-xn-mfr-dossier-comments';
import {
  appendFactoryDossierComment,
  listFactoryDossierComments,
} from '@/lib/server/workshop2-factory-dossier-comments';

const COLLECTION = 'SS27';
const ARTICLE = 'demo-ss27-01';

describe('wave XN — mfr factory dossier comments constants', () => {
  it('exports factory API path aligned with production wave module', () => {
    expect(FACTORY_DOSSIER_COMMENTS_API_PATH).toBe('/api/workshop2/factory/dossier/comments');
    expect(WAVE_XN_MFR_DOSSIER_COMMENTS_API).toBe(FACTORY_DOSSIER_COMMENTS_API_PATH);
    expect(MFR_DOSSIER_COMMENTS_WAVE_XN_MIGRATION).toContain('wave_xn');
    expect(factoryDossierCommentsApiPath(COLLECTION, ARTICLE)).toContain('collectionId=SS27');
    expect(buildMfrDossierCommentsApiHref(COLLECTION, ARTICLE)).toContain('articleId=demo-ss27-01');
  });

  it('RU peer strip labels + testids for mfr dev dossier', () => {
    expect(WAVE_XN_MFR_DOSSIER_COMMENT_PEER_STRIP_TESTID).toBe(
      'mfr-dev-dossier-comment-peer-strip'
    );
    expect(WAVE_XN_MFR_DOSSIER_ANNOTATION_PEER_STRIP_TESTID).toBe(
      'mfr-dev-dossier-annotation-peer-strip'
    );
    expect(WAVE_XN_MFR_DOSSIER_PEER_BRAND_DIFF_RU).toMatch(/сверка/i);
    expect(WAVE_XN_MFR_DOSSIER_COMMENT_BRAND_DIFF_LINK_TESTID).toContain('brand-diff');
    expect(WAVE_XN_MFR_DOSSIER_PEER_CHAT_RU).toMatch(/чат/i);
    expect(WAVE_XN_MFR_DOSSIER_PEER_SAMPLE_QUEUE_RU).toMatch(/образц/i);
    expect(WAVE_XN_MFR_DOSSIER_PEER_MATERIALS_RU).toBe('Материалы');
    expect(buildMfrDossierCommentMaterialsHref(COLLECTION)).toContain(
      '/factory/production/materials'
    );
  });

  it('cross-links brand diff viewer ↔ mfr annotation panel', () => {
    const peers = buildMfrDossierCommentsPeerHrefs({
      collectionId: COLLECTION,
      articleId: ARTICLE,
    });
    expect(peers.brandDiffViewerHref).toContain('#brand-dossier-factory-diff');
    expect(peers.brandDiffViewerHref).toContain('/brand/production/workshop2/');
    expect(peers.factoryAnnotationHref).toContain(`#${MFR_DEV_DOSSIER_ANNOTATION_PANEL_ANCHOR}`);
    expect(peers.factoryAnnotationHref).toContain('/factory/production/dossier/demo-ss27-01');
    expect(brandDossierFactoryDiffViewerHref(COLLECTION, ARTICLE)).toBe(peers.brandDiffViewerHref);
    expect(mfrDevDossierAnnotationPanelHref(ARTICLE, { collectionId: COLLECTION })).toBe(
      peers.factoryAnnotationHref
    );
    expect(BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR).toBe('brand-dossier-factory-diff');
    expect(BRAND_DOSSIER_FACTORY_DIFF_MFR_COMMENTS_LINK_TESTID).toContain('mfr-comments');
  });

  it('comment id prefix helper', () => {
    expect(isWaveXnMfrDossierCommentId(`${WAVE_XN_MFR_DOSSIER_COMMENT_PREFIX}abc`)).toBe(true);
    expect(isWaveXnMfrDossierCommentId('brand-fit-comment-1')).toBe(false);
  });
});

describe('wave XN — factory dossier comments PG stub', () => {
  it('list returns ok with storageMode when dossier exists or empty', async () => {
    const result = await listFactoryDossierComments({
      collectionId: COLLECTION,
      articleId: ARTICLE,
    });
    expect(result.ok).toBe(true);
    expect(Array.isArray(result.comments)).toBe(true);
    expect(['server_postgres', 'server_file_persist']).toContain(result.storageMode);
    expect(result.messageRu.length).toBeGreaterThan(0);
  });

  it('append rejects empty text', async () => {
    const result = await appendFactoryDossierComment({
      collectionId: COLLECTION,
      articleId: ARTICLE,
      text: '   ',
      actor: 'jest-wave-xn',
    });
    expect(result.ok).toBe(false);
    expect(result.messageRu).toMatch(/обязателен/i);
  });

  it('factory comments route POST + GET round-trip', async () => {
    const unique = `jest-xn-${Date.now()}`;
    const { POST, GET } = await import('@/app/api/workshop2/factory/dossier/comments/route');

    const postReq = new NextRequest('http://localhost/api/workshop2/factory/dossier/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionId: COLLECTION,
        articleId: ARTICLE,
        text: unique,
        actor: 'jest-wave-xn',
      }),
    });
    const postRes = await POST(postReq);
    const posted = (await postRes.json()) as {
      ok?: boolean;
      comment?: { commentId?: string; text?: string };
      apiPath?: string;
    };

    if (postRes.status === 409) {
      expect(posted.messageRu ?? '').toMatch(/досье|конфликт/i);
      return;
    }

    expect(postRes.status).toBe(200);
    expect(posted.ok).toBe(true);
    expect(posted.apiPath).toBe(FACTORY_DOSSIER_COMMENTS_API_PATH);
    expect(posted.comment?.commentId).toMatch(new RegExp(`^${WAVE_XN_MFR_DOSSIER_COMMENT_PREFIX}`));
    expect(posted.comment?.text).toBe(unique);

    const getReq = new NextRequest(
      `http://localhost/api/workshop2/factory/dossier/comments?collectionId=${COLLECTION}&articleId=${ARTICLE}`
    );
    const getRes = await GET(getReq);
    const listed = (await getRes.json()) as { comments?: Array<{ text?: string }> };
    expect(getRes.status).toBe(200);
    expect(listed.comments?.some((c) => c.text === unique)).toBe(true);
  });
});
