/** @jest-environment node */

/**
 * Platform Core wave 6 — supplier dossier materials batch API (file-store mode).
 */

import { NextRequest } from 'next/server';
import { POST as materialsBatchPost } from '@/app/api/factory/supplier/dossier-materials-batch/route';
import {
  batchWorkshop2DossierMaterialNames,
  extractWorkshop2DossierMaterialNames,
} from '@/lib/server/workshop2-dossier-materials-batch';
import { emptyWorkshop2DossierPhase1 } from '@/lib/production/workshop2-phase1-dossier-storage';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';

jest.mock('@/lib/server/workshop2-pg-pool', () => ({
  isWorkshop2PostgresEnabled: jest.fn(() => false),
  getWorkshop2PgPool: jest.fn(),
  getWorkshop2DatabaseUrl: jest.fn(() => ''),
}));

const W2_HEADERS = {
  'content-type': 'application/json',
  'x-w2-actor-id': 'wave6-supplier',
  'x-w2-actor-label': 'Wave 6 Supplier',
  'x-w2-actor-roles': 'production:edit',
};

describe('extractWorkshop2DossierMaterialNames', () => {
  it('returns trimmed material names up to limit', () => {
    const dossier = {
      ...emptyWorkshop2DossierPhase1(),
      productionModel: {
        materialLines: [
          { materialName: '  Хлопок  ' },
          { materialName: 'Пуговицы' },
          { materialName: '' },
          { materialName: 'Подклад' },
        ],
      },
    } as ReturnType<typeof emptyWorkshop2DossierPhase1>;

    expect(extractWorkshop2DossierMaterialNames(dossier, 2)).toEqual(['Хлопок', 'Пуговицы']);
    expect(extractWorkshop2DossierMaterialNames(null)).toEqual([]);
  });
});

describe('POST /api/factory/supplier/dossier-materials-batch', () => {
  it('returns materialNames[] per article for SS27 demo articles', async () => {
    await getWorkshop2ServerDossierRecord('SS27', 'demo-ss27-01');
    await getWorkshop2ServerDossierRecord('SS27', 'demo-ss27-02');

    const req = new NextRequest('http://localhost/api/factory/supplier/dossier-materials-batch', {
      method: 'POST',
      headers: W2_HEADERS,
      body: JSON.stringify({
        collectionId: 'SS27',
        articleIds: ['demo-ss27-01', 'demo-ss27-02'],
        limitPerArticle: 4,
      }),
    });
    const res = await materialsBatchPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.postgres).toBe(false);
    expect(json.storeMode).toBe('server_file_persist');
    expect(json.items).toHaveLength(2);
    expect(json.items.map((i: { articleId: string }) => i.articleId).sort()).toEqual([
      'demo-ss27-01',
      'demo-ss27-02',
    ]);
    for (const item of json.items) {
      expect(Array.isArray(item.materialNames)).toBe(true);
      expect(Array.isArray(item.materials)).toBe(true);
      if (item.materials.length > 0) {
        expect(item.materials[0]).toMatchObject({
          name: expect.any(String),
          unitLabelRu: expect.any(String),
        });
      }
    }
  });

  it('rejects empty articleIds', async () => {
    const req = new NextRequest('http://localhost/api/factory/supplier/dossier-materials-batch', {
      method: 'POST',
      headers: W2_HEADERS,
      body: JSON.stringify({ collectionId: 'SS27', articleIds: [] }),
    });
    const res = await materialsBatchPost(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe('invalid_body');
  });
});

describe('batchWorkshop2DossierMaterialNames (file-store)', () => {
  it('returns empty arrays for unknown articles', async () => {
    const items = await batchWorkshop2DossierMaterialNames({
      collectionId: 'SS27',
      articleIds: ['missing-article-xyz'],
    });
    expect(items).toEqual([{ articleId: 'missing-article-xyz', materialNames: [], materials: [] }]);
  });
});
