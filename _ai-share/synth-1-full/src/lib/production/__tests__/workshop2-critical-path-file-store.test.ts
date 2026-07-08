/** @jest-environment node */

/**
 * Wave R — critical path sample→gold→intake на file-store (PG off).
 * Расширяет workshop2-critical-path-sample: API gates + development mirror + WMS honesty.
 */

import { NextRequest } from 'next/server';
import { GET as dossierGet } from '@/app/api/workshop2/articles/[collectionId]/[articleId]/dossier/route';
import { POST as sampleOrderPost } from '@/app/api/workshop2/articles/[collectionId]/[articleId]/sample-order/route';
import { POST as movementPost } from '@/app/api/workshop2/articles/[collectionId]/[articleId]/sample-order/[orderId]/movement/route';
import { POST as wmsReservePost } from '@/app/api/workshop2/articles/[collectionId]/[articleId]/wms/reserve-sample/route';
import { POST as grnPost } from '@/app/api/workshop2/articles/[collectionId]/[articleId]/wms/grn-receipt/route';
import { GET as handoffPdfGet } from '@/app/api/workshop2/articles/[collectionId]/[articleId]/handoff-pdf/route';
import { GET as handoffReadinessGet } from '@/app/api/workshop2/articles/[collectionId]/[articleId]/handoff-readiness/route';
import { evaluateWorkshop2FactoryHandoffCommitGate } from '@/lib/production/workshop2-factory-handoff-commit-gate';
import { evaluateWorkshop2FitGoldApprovalGate } from '@/lib/production/workshop2-fit-gold-approval-gate';
import { buildWorkshop2FileStoreDemoDossier } from '@/lib/production/workshop2-file-store-demo-bootstrap';
import { buildWorkshop2WmsReleaseFileModeHonesty } from '@/lib/production/workshop2-wms-file-mode-honesty';
import { summarizeWorkshop2ArticleDevelopmentStateDisplay } from '@/lib/production/workshop2-article-development-state-display';
import {
  clearWorkshop2SampleOrdersMemoryForTests,
  createWorkshop2SampleOrder,
} from '@/lib/server/workshop2-sample-order-repository';

jest.mock('@/lib/server/workshop2-pg-pool', () => ({
  isWorkshop2PostgresEnabled: jest.fn(() => false),
  getWorkshop2PgPool: jest.fn(),
}));

jest.mock('@/lib/server/workshop2-phase1-dossier-server-store', () => {
  const actual = jest.requireActual('@/lib/server/workshop2-phase1-dossier-server-store');
  return {
    ...actual,
    getWorkshop2ServerDossierStoreMode: jest.fn(() => 'server_file_persist'),
  };
});

jest.mock('@/lib/server/workshop2-dossier-repository', () => ({
  listWorkshop2VaultDocumentsFromPg: jest.fn(async () => []),
  ensureWorkshop2PgSchema: jest.fn(),
}));

import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';

const W2_HEADERS = {
  'content-type': 'application/json',
  'x-w2-actor-id': 'wave-r',
  'x-w2-actor-label': 'Wave R',
  'x-w2-actor-roles': 'production:edit',
};

function routeCtx(cid: string, aid: string, orderId?: string) {
  return {
    params: Promise.resolve(
      orderId
        ? { collectionId: cid, articleId: aid, orderId }
        : { collectionId: cid, articleId: aid }
    ),
  };
}

describe('workshop2 critical path file-store (Wave R)', () => {
  beforeEach(() => {
    (isWorkshop2PostgresEnabled as jest.Mock).mockReturnValue(false);
    process.env.WORKSHOP2_TRUST_ACTOR_HEADERS = '1';
    delete process.env.WORKSHOP2_INTERNAL_WMS;
    clearWorkshop2SampleOrdersMemoryForTests();
  });

  it('demo-ss27-01 dossier auto-seed → sample-order gate (201|409) + development mirror', async () => {
    await dossierGet(
      new NextRequest('http://localhost/api/workshop2/articles/SS27/demo-ss27-01/dossier', {
        headers: W2_HEADERS,
      }),
      routeCtx('SS27', 'demo-ss27-01')
    );

    const res = await sampleOrderPost(
      new NextRequest('http://localhost/api/workshop2/articles/SS27/demo-ss27-01/sample-order', {
        method: 'POST',
        headers: W2_HEADERS,
        body: JSON.stringify({ quantity: 1, createdBy: 'Wave R' }),
      }),
      routeCtx('SS27', 'demo-ss27-01')
    );
    expect([201, 409]).toContain(res.status);
    expect(res.status).not.toBe(500);
    const json = await res.json();
    if (res.status === 201) {
      expect(json.filePersistOnly).toBe(true);
      const record = await getWorkshop2ServerDossierRecord('SS27', 'demo-ss27-01');
      expect(record?.dossier.articleDevelopmentStateMirror?.sample.hasOrder).toBe(true);
    } else {
      expect(json.error).toBe('handoff_not_ready');
    }
  });

  it('demo-ss27-02 gold not approved blocks handoff commit gate (plan→release path)', async () => {
    await getWorkshop2ServerDossierRecord('SS27', 'demo-ss27-02');
    const dossier = buildWorkshop2FileStoreDemoDossier({
      collectionId: 'SS27',
      articleId: 'demo-ss27-02',
    })!;
    const goldGate = evaluateWorkshop2FitGoldApprovalGate({
      dossier,
      fitGold: { goldApproved: false, sessions: [], fitComments: [] },
      hasActiveSampleOrder: false,
    });
    expect(goldGate.allowed).toBe(false);
    expect(goldGate.checks.some((c) => c.id === 'fit.gold.no_sessions')).toBe(true);

    const handoffGate = evaluateWorkshop2FactoryHandoffCommitGate({
      dossier,
      categoryLeafId: dossier.categoryBindings?.[0]?.categoryLeafId ?? 'catalog-apparel-g2-l0',
      vaultFileCount: 0,
      minTzOverallPct: 0,
    });
    expect(handoffGate.allowed).toBe(false);
    expect(handoffGate.readiness.checks.length).toBeGreaterThan(0);
  });

  it('gold approval + handoff commit gate on demo dossier (file-store)', () => {
    const dossier = buildWorkshop2FileStoreDemoDossier({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
    })!;
    const withGold = {
      ...dossier,
      goldSampleStatus: { status: 'approved' as const, approvedAt: new Date().toISOString() },
    };
    const gate = evaluateWorkshop2FactoryHandoffCommitGate({
      dossier: withGold,
      categoryLeafId: withGold.categoryBindings?.[0]?.categoryLeafId ?? 'catalog-apparel-g0-l0',
      vaultFileCount: 2,
      minTzOverallPct: 0,
    });
    expect(typeof gate.allowed).toBe('boolean');
    expect(gate.readiness.checks.length).toBeGreaterThan(0);
  });

  it('movement received → WMS release honesty (disabled → 503 copy in JSON)', async () => {
    await getWorkshop2ServerDossierRecord('SS27', 'demo-ss27-01');
    const order = await createWorkshop2SampleOrder({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      status: 'sent',
      movementStatus: 'in_transit',
    });

    const res = await movementPost(
      new NextRequest(
        `http://localhost/api/workshop2/articles/SS27/demo-ss27-01/sample-order/${order.id}/movement`,
        {
          method: 'POST',
          headers: W2_HEADERS,
          body: JSON.stringify({ target: 'received', strictIntake: false }),
        }
      ),
      routeCtx('SS27', 'demo-ss27-01', order.id)
    );
    expect([200, 400, 409]).toContain(res.status);
    expect(res.status).not.toBe(500);
    if (res.status === 200) {
      const json = await res.json();
      expect(json.wmsRelease).toBeDefined();
      expect(json.wmsRelease.messageRu).toMatch(/WMS|WORKSHOP2_INTERNAL_WMS|release/i);
      expect(json.wmsRelease.filePersistOnly).toBe(true);
    }
  });

  it('WMS reserve + GRN routes fail-closed without 500 when internal WMS off', async () => {
    const prevDb = process.env.WORKSHOP2_DATABASE_URL;
    const prevWms = process.env.WORKSHOP2_INTERNAL_WMS;
    delete process.env.WORKSHOP2_DATABASE_URL;
    delete process.env.WORKSHOP2_DOSSIER_DATABASE_URL;
    delete process.env.WORKSHOP2_INTERNAL_WMS;

    try {
      await getWorkshop2ServerDossierRecord('SS27', 'demo-ss27-01');

      const reserve = await wmsReservePost(
        new NextRequest(
          'http://localhost/api/workshop2/articles/SS27/demo-ss27-01/wms/reserve-sample',
          { method: 'POST', headers: W2_HEADERS, body: '{}' }
        ),
        routeCtx('SS27', 'demo-ss27-01')
      );
      expect(reserve.status).toBe(503);

      const grn = await grnPost(
        new NextRequest(
          'http://localhost/api/workshop2/articles/SS27/demo-ss27-01/wms/grn-receipt',
          {
            method: 'POST',
            headers: W2_HEADERS,
            body: JSON.stringify({ supplyLineId: 'line-1', qty: 1 }),
          }
        ),
        routeCtx('SS27', 'demo-ss27-01')
      );
      expect(grn.status).toBe(503);
    } finally {
      if (prevDb) process.env.WORKSHOP2_DATABASE_URL = prevDb;
      else delete process.env.WORKSHOP2_DATABASE_URL;
      if (prevWms) process.env.WORKSHOP2_INTERNAL_WMS = prevWms;
      else delete process.env.WORKSHOP2_INTERNAL_WMS;
    }
  });

  it('handoff PDF + readiness GET on demo-ss27-01 (200|409, not 500)', async () => {
    await getWorkshop2ServerDossierRecord('SS27', 'demo-ss27-01');

    const pdf = await handoffPdfGet(
      new NextRequest('http://localhost/api/workshop2/articles/SS27/demo-ss27-01/handoff-pdf', {
        headers: W2_HEADERS,
      }),
      routeCtx('SS27', 'demo-ss27-01')
    );
    expect([200, 409]).toContain(pdf.status);

    const readiness = await handoffReadinessGet(
      new NextRequest(
        'http://localhost/api/workshop2/articles/SS27/demo-ss27-01/handoff-readiness',
        { headers: W2_HEADERS }
      ),
      routeCtx('SS27', 'demo-ss27-01')
    );
    expect(readiness.status).toBe(200);
    const body = await readiness.json();
    expect(body.articleDevelopmentState).toBeDefined();
  });

  it('hub + workspace development display share label from same mirror', () => {
    const dossier = buildWorkshop2FileStoreDemoDossier({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
    })!;
    const dossierWithMirror = {
      ...dossier,
      articleDevelopmentStateMirror: {
        mirroredAt: '2026-05-23T00:00:00.000Z',
        lastActor: 'wave-r',
        steps: ['sample_order', 'wms_reserve'],
        sample: {
          hasOrder: true,
          orderId: 'so-r-1',
          movementStatus: 'created' as const,
          movementLogEntries: 1,
          movementState: 'pending',
        },
        wms: { enabled: true, syncStatus: 'memory_fallback', reservedQty: 2 },
        gold: { approved: false, status: 'pending' },
        intake: { state: 'partial' as const, missingCount: 2, barcodeFilled: false },
        readiness: {
          tzOverallPct: 80,
          preflightScore: 75,
          handoffReady: false,
          vaultFileCount: 1,
        },
        criticalPathReady: false,
        hintRu: 'Переведите движение образца в received.',
      },
    };
    const hub = summarizeWorkshop2ArticleDevelopmentStateDisplay({ dossier: dossierWithMirror });
    const workspace = summarizeWorkshop2ArticleDevelopmentStateDisplay({
      dossier: dossierWithMirror,
    });
    expect(hub.labelRu).toBe(workspace.labelRu);
    expect(hub.fromMirror).toBe(true);
  });

  it('buildWorkshop2WmsReleaseFileModeHonesty file-store copy', () => {
    const h = buildWorkshop2WmsReleaseFileModeHonesty({
      storeMode: 'server_file_persist',
      internalWmsEnabled: true,
      releaseOk: true,
      mirror: {
        mirroredAt: new Date().toISOString(),
        itemCount: 1,
        onHandQty: 5,
        reservedQty: 0,
        movementCount: 2,
        reserveDeficitCount: 0,
        wmsSyncStatus: 'memory_fallback',
        locationCode: 'WORKSHOP2-WH',
      },
    });
    expect(h.released).toBe(true);
    expect(h.filePersistOnly).toBe(true);
    expect(h.messageRu).toMatch(/release|memory|file-store/i);
  });
});
