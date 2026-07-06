/** @jest-environment node */

import { GET as taGet, PATCH as taPatch } from '@/app/api/brand/workshop2/phase1-dossier/time-and-action/route';
import { GET as labGet } from '@/app/api/brand/workshop2/materials/lab-dips/route';
import { GET as testingGet } from '@/app/api/brand/workshop2/materials/testing/route';
import { POST as reqPost } from '@/app/api/brand/workshop2/phase1-dossier/requisitions/route';

jest.mock('@/lib/server/workshop2-phase1-dossier-server-store', () => ({
  getWorkshop2ServerDossierRecord: jest.fn(),
}));

import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';

const mockGetDossier = getWorkshop2ServerDossierRecord as jest.MockedFunction<
  typeof getWorkshop2ServerDossierRecord
>;

describe('workshop2 legacy mock routes removed', () => {
  beforeEach(() => {
    mockGetDossier.mockReset();
    mockGetDossier.mockResolvedValue(null);
  });

  it('time-and-action returns 503 without dossier params', async () => {
    const res = await taGet(new Request('http://localhost/api/ta'));
    expect(res.status).toBe(503);
    const json = (await res.json()) as { source?: string; error?: string };
    expect(json.error).toBe('dossier_required');
    expect(json.source).toBeUndefined();
  });

  it('time-and-action GET reads taMilestones from dossier store (not in-memory mock)', async () => {
    mockGetDossier.mockResolvedValue({
      collectionId: 'c1',
      articleId: 'a1',
      version: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
      dossier: {
        assignments: [],
        taMilestones: [
          {
            id: 'pg-ta-1',
            title: 'Cutting',
            targetDate: '2026-06-15',
            actualDate: null,
            status: 'pending',
          },
        ],
      },
    } as Awaited<ReturnType<typeof getWorkshop2ServerDossierRecord>>);

    const res = await taGet(
      new Request('http://localhost/api/ta?collectionId=c1&articleId=a1')
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { milestones: { id: string }[] };
    expect(json.milestones).toHaveLength(1);
    expect(json.milestones[0]?.id).toBe('pg-ta-1');
  });

  it('time-and-action PATCH is fail-closed to dossier PG mirror', async () => {
    const res = await taPatch(
      new Request('http://localhost/api/ta?collectionId=c1&articleId=a1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId: 'm1', status: 'completed' }),
      })
    );
    expect(res.status).toBe(503);
  });

  it('lab-dips GET reads colorways from dossier PG mirror', async () => {
    mockGetDossier.mockResolvedValue({
      collectionId: 'c1',
      articleId: 'a1',
      version: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
      dossier: {
        assignments: [
          {
            kind: 'canonical' as const,
            attributeId: 'color',
            values: [{ text: 'Navy', displayLabel: 'Navy' }],
          },
        ],
        colorLabDipStatuses: { NAV: 'pending' },
      },
    } as Awaited<ReturnType<typeof getWorkshop2ServerDossierRecord>>);

    const res = await labGet(
      new Request('http://localhost/api/lab-dips?collectionId=c1&articleId=a1')
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { labDips: { id: string; status: string }[] };
    expect(json.labDips.length).toBeGreaterThan(0);
    expect(json.labDips[0]?.status).toBe('pending');
  });

  it('lab-dips returns 503 without dossier params', async () => {
    const res = await labGet(new Request('http://localhost/api/lab-dips'));
    expect(res.status).toBe(503);
    const json = (await res.json()) as { source?: string };
    expect(json.source).not.toBe('legacy_mock');
  });

  it('material testing GET reads logs from dossier PG mirror', async () => {
    mockGetDossier.mockResolvedValue({
      collectionId: 'c1',
      articleId: 'a1',
      version: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
      dossier: {
        assignments: [],
        materialPhysicalTestLogs: [
          {
            id: 'mt-1',
            materialId: 'mat-1',
            testCategory: 'shrinkage',
            resultValue: '2%',
            isPass: true,
            testedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    } as Awaited<ReturnType<typeof getWorkshop2ServerDossierRecord>>);

    const res = await testingGet(
      new Request(
        'http://localhost/api/testing?collectionId=c1&articleId=a1&materialId=mat-1'
      )
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { testingLogs: { id: string }[] };
    expect(json.testingLogs).toHaveLength(1);
    expect(json.testingLogs[0]?.id).toBe('mt-1');
  });

  it('material testing returns 503 without dossier context', async () => {
    const res = await testingGet(new Request('http://localhost/api/testing?materialId=mat-1'));
    expect(res.status).toBe(503);
  });

  it('requisitions POST redirects to sample-material-request', async () => {
    const res = await reqPost(
      new Request('http://localhost/api/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: 'c1', articleId: 'a1' }),
      })
    );
    expect(res.status).toBe(308);
    expect(res.headers.get('Location')).toContain('sample-material-request');
  });
});
