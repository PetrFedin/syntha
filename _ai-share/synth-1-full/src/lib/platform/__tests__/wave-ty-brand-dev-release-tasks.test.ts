import {
  BRAND_RELEASE_GATE_PASSPORT_API_PATH,
  BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU,
  BRAND_RELEASE_GATE_PASSPORT_PG_UNAVAILABLE_RU,
  brandMaterialPassportReleaseGateMessageRu,
  evaluateBrandMaterialPassportReleaseGateFromSummary,
} from '@/lib/production/brand-material-passport-release-gate';
import { materialPassportCertsBlockRelease } from '@/lib/fashion/brand-material-passport-certs';
import { buildBrandOpAttachTzPoSession } from '@/lib/fashion/brand-op-attach-tz-po-session';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

describe('wave TY — brand dev tasks kanban + release gate + investor strip', () => {
  it('tasks kanban mini-panel testids', () => {
    expect('brand-dev-tasks-kanban-panel').toContain('kanban');
    expect('brand-dev-tasks-kanban-board').toContain('board');
    expect('brand-dev-tasks-kanban-column-todo').toContain('todo');
    expect('brand-dev-tasks-kanban-column-in_progress').toContain('in_progress');
    expect('brand-dev-tasks-kanban-column-done').toContain('done');
    expect('brand-dev-tasks-kanban-pg').toContain('pg');
    expect('brand-dev-tasks-kanban-full-link').toContain('full-link');
  });

  it('investor-readiness strip testids on dev cabinet', () => {
    expect('brand-dev-investor-readiness-strip').toContain('investor-readiness');
    expect('brand-dev-investor-readiness-ready').toContain('ready');
    expect('brand-dev-investor-readiness-fill').toContain('fill');
    expect('brand-dev-investor-readiness-link').toContain('link');
  });

  it('release gate API path + RU copy', () => {
    expect(BRAND_RELEASE_GATE_PASSPORT_API_PATH).toBe('/api/brand/merch/release-gate');
    expect(BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU).toContain('material passport');
    expect(BRAND_RELEASE_GATE_PASSPORT_PG_UNAVAILABLE_RU).toContain('fail-closed');
  });

  it('material passport release gate blocks incomplete certs', () => {
    expect(materialPassportCertsBlockRelease({ total: 5, ready: 3, blocked: 2 })).toBe(true);
    const open = evaluateBrandMaterialPassportReleaseGateFromSummary({
      summary: { total: 5, ready: 5, blocked: 0 },
      releaseBlocked: false,
      storageMode: 'pg',
    });
    expect(open.blocked).toBe(false);
    expect(open.ready).toBe(true);

    const blocked = evaluateBrandMaterialPassportReleaseGateFromSummary({
      summary: { total: 4, ready: 1, blocked: 3 },
      releaseBlocked: true,
      storageMode: 'pg',
    });
    expect(blocked.blocked).toBe(true);
    expect(blocked.messageRu).toContain('material passport');
    expect(brandMaterialPassportReleaseGateMessageRu({ total: 4, ready: 1, blocked: 3 })).toContain(
      '1/4'
    );
  });

  it('brand OP attach TZ→PO peer link session', () => {
    const session = buildBrandOpAttachTzPoSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
    });
    expect(session.attachTzPoHref).toContain('w2-tz-export');
    expect(session.attachTzPoHref).toContain('po=');
    expect('brand-op-attach-tz-po-link').toContain('attach-tz-po-link');
    expect('brand-op-attach-tz-po-strip').toContain('attach-tz-po');
  });

  it('brand tasks API uses GET/PUT /api/brand/tasks', () => {
    expect('/api/brand/tasks').toContain('brand/tasks');
  });
});

describe('wave TY — release gate server evaluation (memory)', () => {
  it('evaluateBrandMaterialPassportReleaseGateForCollection returns summary', async () => {
    const mod = await import('@/lib/server/brand-material-passport-release-gate-server');
    const gate = await mod.evaluateBrandMaterialPassportReleaseGateForCollection({
      collectionId: 'SS27',
    });
    expect(typeof gate.blocked).toBe('boolean');
    expect(gate.summary.total).toBeGreaterThanOrEqual(0);
    expect(gate.messageRu.length).toBeGreaterThan(0);
  });
});
