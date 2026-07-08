/** @jest-environment node */

/**
 * Smoke shop/b2b spine routes — status ≠ 500 (Platform Core wholesale path).
 */

import { NextRequest } from 'next/server';

jest.mock('@/lib/server/shop-b2b-checkout-route-auth', () => ({
  guardShopB2bCheckoutRoute: jest.fn(async () => ({
    ok: true,
    mode: 'dev',
    buyerId: 'shop1',
  })),
}));

jest.mock('@/lib/server/workshop2-b2b-wishlist-repository', () => ({
  issueWorkshop2B2bRepShareToken: jest.fn(async () => ({
    token: 'smoke-share-token',
    campaignId: 'SS27::demo-ss27-01',
    repId: 'rep-demo',
    createdAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2026-01-08T00:00:00.000Z',
  })),
}));

jest.mock('@/lib/server/workshop2-phase1-dossier-server-store', () => ({
  getWorkshop2ServerDossierRecord: jest.fn(async () => null),
  putWorkshop2ServerDossierRecord: jest.fn(),
}));

jest.mock('@/lib/server/workshop2-material-requisition-repository', () => ({
  createWorkshop2MaterialRequisition: jest.fn(async () => ({ id: 'req-smoke' })),
}));

jest.mock('@/lib/server/workshop2-contextual-messages-repository', () => ({
  appendWorkshop2ContextualMessage: jest.fn(async () => ({ id: 'msg-smoke' })),
}));

jest.mock('@/lib/server/workshop2-b2b-orders-repository', () => ({
  listWorkshop2B2bOrdersForBuyer: jest.fn(async () => []),
}));

jest.mock('@/lib/server/workshop2-b2b-3d-metrics', () => ({
  recordWorkshop2B2b3dViewEvent: jest.fn(async () => ({ ok: true })),
  recordWorkshop2B2b3dSessionEvent: jest.fn(async () => ({ ok: true, durationSec: 12 })),
}));

import { POST as linesheetSharePost } from '@/app/api/shop/b2b/linesheet/share/route';
import { POST as sampleRequestPost } from '@/app/api/shop/b2b/sample-request/route';
import { GET as partnershipsGet } from '@/app/api/shop/b2b/partnerships/route';
import { GET as cartLinesGet } from '@/app/api/shop/b2b/cart/lines/route';
import { GET as shopOrdersGet } from '@/app/api/shop/b2b/orders/route';
import { GET as brandRegistryGet } from '@/app/api/shop/b2b/brand-registry/route';
import { GET as commissionsGet } from '@/app/api/shop/b2b/commissions/route';
import { GET as showroomStreamTokenGet } from '@/app/api/shop/b2b/showroom/stream-token/route';
import { POST as showroom3dViewPost } from '@/app/api/shop/b2b/showroom/3d-view/route';
import { POST as showroom3dSessionPost } from '@/app/api/shop/b2b/showroom/3d-session/route';

type SmokeCase = {
  name: string;
  run: () => Promise<Response>;
  allowed: number[];
};

describe('shop/b2b API routes smoke', () => {
  const cases: SmokeCase[] = [
    {
      name: 'GET /shop/b2b/partnerships',
      run: () =>
        partnershipsGet(
          new NextRequest('http://localhost/api/shop/b2b/partnerships?buyerId=shop1')
        ),
      allowed: [200],
    },
    {
      name: 'GET /shop/b2b/orders',
      run: () =>
        shopOrdersGet(
          new NextRequest('http://localhost/api/shop/b2b/orders?buyerId=shop1&collectionId=SS27')
        ),
      allowed: [200],
    },
    {
      name: 'GET /shop/b2b/cart/lines',
      run: () =>
        cartLinesGet(
          new NextRequest(
            'http://localhost/api/shop/b2b/cart/lines?buyerId=shop1&collectionId=SS27'
          )
        ),
      allowed: [200],
    },
    {
      name: 'POST /shop/b2b/linesheet/share',
      run: () =>
        linesheetSharePost(
          new NextRequest('http://localhost/api/shop/b2b/linesheet/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectionId: 'SS27',
              articleId: 'demo-ss27-01',
              repId: 'rep-demo',
            }),
          })
        ),
      allowed: [200],
    },
    {
      name: 'POST /shop/b2b/sample-request (no dossier)',
      run: () =>
        sampleRequestPost(
          new NextRequest('http://localhost/api/shop/b2b/sample-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectionId: 'SS27',
              articleId: 'demo-ss27-01',
              buyerId: 'shop1',
            }),
          })
        ),
      allowed: [404],
    },
    {
      name: 'POST /shop/b2b/sample-request (missing fields)',
      run: () =>
        sampleRequestPost(
          new NextRequest('http://localhost/api/shop/b2b/sample-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buyerId: 'shop1' }),
          })
        ),
      allowed: [400],
    },
    {
      name: 'GET /shop/b2b/brand-registry',
      run: () => brandRegistryGet(new NextRequest('http://localhost/api/shop/b2b/brand-registry')),
      allowed: [200],
    },
    {
      name: 'GET /shop/b2b/commissions',
      run: () =>
        commissionsGet(new NextRequest('http://localhost/api/shop/b2b/commissions?repId=rep-demo')),
      allowed: [200],
    },
    {
      name: 'GET /shop/b2b/showroom/stream-token',
      run: () =>
        showroomStreamTokenGet(
          new NextRequest(
            'http://localhost/api/shop/b2b/showroom/stream-token?collectionId=SS27&articleId=demo-ss27-01'
          )
        ),
      allowed: [200],
    },
    {
      name: 'POST /shop/b2b/showroom/3d-view',
      run: () =>
        showroom3dViewPost(
          new NextRequest('http://localhost/api/shop/b2b/showroom/3d-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectionId: 'SS27',
              articleId: 'demo-ss27-01',
              embedMode: 'sdk-stub',
            }),
          })
        ),
      allowed: [200],
    },
    {
      name: 'POST /shop/b2b/showroom/3d-session',
      run: () =>
        showroom3dSessionPost(
          new NextRequest('http://localhost/api/shop/b2b/showroom/3d-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectionId: 'SS27',
              articleId: 'demo-ss27-01',
              durationMs: 12000,
            }),
          })
        ),
      allowed: [200],
    },
  ];

  it.each(cases.map((c) => [c.name, c]))('%s — not 500', async (_name, c) => {
    const res = await c.run();
    expect(res.status).not.toBe(500);
    expect(c.allowed).toContain(res.status);
  });
});
