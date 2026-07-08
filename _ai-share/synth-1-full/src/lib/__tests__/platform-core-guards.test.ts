/**
 * Platform Core Phase 21 · contract/manifest/route guard tests.
 * Prevents re-introducing split-brain imports and doc drift.
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.join(__dirname, '..', '..', '..');
const docsRoot = path.join(repoRoot, 'docs');

function readRepo(relPath: string): string {
  const abs = path.join(repoRoot, relPath);
  expect(fs.existsSync(abs)).toBe(true);
  return fs.readFileSync(abs, 'utf8');
}

function readDoc(name: string): string {
  const abs = path.join(docsRoot, name);
  expect(fs.existsSync(abs)).toBe(true);
  return fs.readFileSync(abs, 'utf8');
}

function walkTsFiles(dirRel: string, out: string[] = []): string[] {
  const abs = path.join(repoRoot, dirRel);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dirRel, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      walkTsFiles(rel, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.test.tsx')) {
      out.push(rel);
    }
  }
  return out;
}

const PLATFORM_CORE_FORBIDDEN: ReadonlyArray<{ label: string; re: RegExp }> = [
  { label: '_archive', re: /from ['"]@\/.*_archive/ },
  { label: '_extended (direct UI)', re: /from ['"]@\/components\/_extended/ },
  { label: '@/components/client', re: /from ['"]@\/components\/client/ },
  { label: '@/components/factory (direct)', re: /from ['"]@\/components\/factory/ },
  { label: '@/lib/routes (full)', re: /from ['"]@\/lib\/routes['"]/ },
];

const EXTENDED_PLATFORM_FILE =
  /\/(Factory|Supplier|MfrEmpty|SupEmpty|Manufacturer|CommsPillarCardExtended|DevelopmentPillarCardManufacturer|OrderProductionPillarCardManufacturer|supplier-collection-order)/i;

function isBaselinePlatformFile(relPath: string): boolean {
  return !EXTENDED_PLATFORM_FILE.test(relPath);
}

function flattenSectionMap(map: Record<string, Record<string, readonly string[]> | undefined>): string[] {
  return Object.values(map).flatMap((pillarMap) =>
    Object.values(pillarMap ?? {}).flatMap((sectionIds) => [...sectionIds])
  );
}

describe('Platform Core contract docs', () => {
  it('PLATFORM_CORE_CONTRACT.md exists and declares single write-path', () => {
    const doc = readDoc('PLATFORM_CORE_CONTRACT.md');
    expect(doc).toMatch(/W2 Platform Core|Next\.js BFF|единственн/i);
    expect(doc).toMatch(/FastAPI/i);
  });

  it('PLATFORM_CORE_MANIFEST.md lists canonical paths', () => {
    const doc = readDoc('PLATFORM_CORE_MANIFEST.md');
    expect(doc).toMatch(/platform-core-routes/);
    expect(doc).toMatch(/components\/platform/);
  });

  it('PLATFORM_CORE_CANONICAL_AUDIT.md references Phase 21 stabilization', () => {
    const doc = readDoc('PLATFORM_CORE_CANONICAL_AUDIT.md');
    expect(doc.length).toBeGreaterThan(500);
  });
});

describe('Platform Core canonical routes', () => {
  it('shop b2b orders uses nested path', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const routes = require('@/lib/platform-core-routes') as typeof import('@/lib/platform-core-routes');
    expect(routes.ROUTES.shop.b2bOrders).toBe('/shop/b2b/orders');
    expect(routes.ROUTES.shop.b2bOrders).not.toContain('b2b-orders');
  });

  it('legacy b2b-message-templates route re-exports canonical handler', () => {
    const legacy = readRepo('src/app/api/platform-core/b2b-message-templates/route.ts');
    expect(legacy).toMatch(/b2b\/message-templates\/route/);
    expect(legacy).not.toMatch(/getPlatformCoreB2bMessageTemplatesServer/);
  });

  it('middleware redirects shop/b2b-orders and legacy message-templates API', () => {
    const mw = readRepo('src/middleware.ts');
    expect(mw).toMatch(/\/shop\/b2b-orders/);
    expect(mw).toMatch(/\/shop\/b2b\/orders/);
    expect(mw).toMatch(/\/api\/platform-core\/b2b-message-templates/);
    expect(mw).toMatch(/\/api\/platform-core\/b2b\/message-templates/);
  });
});

describe('Platform Core visible section allowlist', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sections = require('@/lib/platform-core-two-role-sections') as typeof import('@/lib/platform-core-two-role-sections');

  it('uses a strict visible allowlist instead of denylist-only filtering', () => {
    const src = readRepo('src/lib/platform-core-two-role-sections.ts');
    expect(src).toMatch(/PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST/);
    expect(src).toMatch(/getVisibleSectionIds/);
    expect(src).toMatch(/visibleIds\.has/);
  });

  it('does not overlap visible sections with pending backlog', () => {
    const visible = new Set(flattenSectionMap(sections.PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST as never));
    const pending = flattenSectionMap(sections.PLATFORM_CORE_TWO_ROLE_PENDING_SECTION_BACKLOG as never);
    const overlap = pending.filter((sectionId) => visible.has(sectionId));
    expect(overlap).toEqual([]);
  });

  it('keeps the current golden path inside visible baseline sections', () => {
    const visible = new Set(flattenSectionMap(sections.PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST as never));
    const hiddenGoldenStops = sections.PLATFORM_CORE_TWO_ROLE_WHOLESALE_FLOW
      .map((step) => step.sectionId)
      .filter((sectionId) => !visible.has(sectionId));
    expect(hiddenGoldenStops).toEqual([]);
  });

  it('keeps unfinished commercial P0 tabs hidden until implemented', () => {
    const visible = new Set(flattenSectionMap(sections.PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST as never));
    for (const sectionId of [
      'brand-co-revision',
      'brand-op-qc',
      'brand-op-packing',
      'brand-op-closeout',
      'brand-cm-collection-chat',
      'shop-op-acceptance',
      'shop-op-closeout',
      'shop-cm-collection-chat',
    ]) {
      expect(visible.has(sectionId)).toBe(false);
    }
  });

  it('keeps shop development out of visible tabs in the two-role baseline', () => {
    expect(sections.PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST.shop?.development).toBeUndefined();
    expect(sections.PLATFORM_CORE_TWO_ROLE_PENDING_SECTION_BACKLOG.shop?.development).toContain(
      'shop-dev-bridge'
    );
  });
});

describe('Platform Core UI surface manifest', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sections = require('@/lib/platform-core-two-role-sections') as typeof import('@/lib/platform-core-two-role-sections');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const manifest = require('@/lib/platform-core-ui-surface-manifest') as typeof import('@/lib/platform-core-ui-surface-manifest');

  it('documents the UI surface audit', () => {
    const doc = readDoc('PLATFORM_CORE_UI_SURFACE_AUDIT.md');
    expect(doc).toMatch(/strict visible allowlist/i);
    expect(doc).toMatch(/CORE_WORKING/);
    expect(doc).toMatch(/PENDING_P0/);
  });

  it('has exactly one manifest item for every visible baseline section', () => {
    const visible = [...new Set(flattenSectionMap(sections.PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST as never))].sort();
    const manifestIds = [...manifest.getPlatformCoreVisibleSurfaceIds()].sort();
    expect(manifestIds).toEqual(visible);
  });

  it('does not publish pending backlog sections as manifest-visible surfaces', () => {
    const manifestIds = new Set(manifest.getPlatformCoreVisibleSurfaceIds());
    const pending = manifest.flattenPendingBacklog();
    const leaked = pending.filter((sectionId) => manifestIds.has(sectionId));
    expect(leaked).toEqual([]);
  });

  it('requires every visible surface to declare user-facing expectation and decision', () => {
    for (const item of manifest.PLATFORM_CORE_UI_SURFACE_MANIFEST) {
      expect(item.sectionId).toBeTruthy();
      expect(item.labelRu).toBeTruthy();
      expect(item.primaryExpectation.length).toBeGreaterThan(20);
      expect(['KEEP', 'FIX', 'HIDE', 'MERGE', 'ARCHIVE']).toContain(item.decision);
      expect(['CORE_WORKING', 'CORE_PARTIAL']).toContain(item.status);
    }
  });

  it('keeps partial surfaces explicit so they can be repaired, not mistaken for done', () => {
    expect(manifest.getPlatformCorePartialSurfaceIds()).toEqual(
      expect.arrayContaining([
        'brand-dev-dossier',
        'brand-sc-publish',
        'shop-co-detail',
        'brand-co-detail',
        'brand-op-handoff',
        'brand-op-registry',
        'brand-op-dossier',
        'shop-co-buyer-tracking',
        'brand-cm-notes',
      ])
    );
  });
});

describe('Platform Core UI action contracts', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const actions = require('@/lib/platform-core-ui-action-contracts') as typeof import('@/lib/platform-core-ui-action-contracts');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const surfaceManifest = require('@/lib/platform-core-ui-surface-manifest') as typeof import('@/lib/platform-core-ui-surface-manifest');

  it('defines every action id exactly once', () => {
    const ids = actions.PLATFORM_CORE_UI_ACTION_CONTRACTS.map((action) => action.actionId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('requires every action to declare a primary section and concrete user result', () => {
    for (const action of actions.PLATFORM_CORE_UI_ACTION_CONTRACTS) {
      expect(action.primarySectionId).toBeTruthy();
      expect(action.userResultRu.length).toBeGreaterThan(30);
      expect(['single_primary', 'secondary_links_only']).toContain(action.duplicatePolicy);
    }
  });

  it('keeps active action primary sections inside the visible surface manifest', () => {
    const visible = new Set(surfaceManifest.getPlatformCoreVisibleSurfaceIds());
    const leaked = actions
      .getPlatformCoreActivePrimaryActionSectionIds()
      .filter((sectionId) => !visible.has(sectionId));
    expect(leaked).toEqual([]);
  });

  it('keeps pending action primary sections out of visible surfaces until implemented', () => {
    const visible = new Set(surfaceManifest.getPlatformCoreVisibleSurfaceIds());
    const leaked = actions
      .getPlatformCorePendingPrimaryActionSectionIds()
      .filter((sectionId) => visible.has(sectionId));
    expect(leaked).toEqual([]);
  });

  it('keeps commercial P0 actions explicit instead of hidden in generic backlog', () => {
    const pendingIds = actions.PLATFORM_CORE_UI_ACTION_CONTRACTS.filter(
      (action) => action.status === 'PENDING_P0'
    ).map((action) => action.actionId);
    expect(pendingIds).toEqual(
      expect.arrayContaining([
        'request_revision',
        'write_qc_gate',
        'create_packing_list',
        'accept_delivery',
        'close_order',
        'open_collection_chat',
      ])
    );
  });
});

describe('Platform Core lifecycle map', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const actions = require('@/lib/platform-core-ui-action-contracts') as typeof import('@/lib/platform-core-ui-action-contracts');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const lifecycle = require('@/lib/platform-core-lifecycle-map') as typeof import('@/lib/platform-core-lifecycle-map');

  it('has a strictly ordered lifecycle with no duplicate step numbers', () => {
    const steps = lifecycle.PLATFORM_CORE_LIFECYCLE_ACTION_MAP.map((step) => step.step);
    expect(new Set(steps).size).toBe(steps.length);
    expect([...steps].sort((a, b) => a - b)).toEqual(steps);
  });

  it('references only action contracts that exist', () => {
    const knownActionIds = new Set(actions.PLATFORM_CORE_UI_ACTION_CONTRACTS.map((action) => action.actionId));
    const missing = lifecycle.PLATFORM_CORE_LIFECYCLE_ACTION_MAP
      .map((step) => step.actionId)
      .filter((actionId) => !knownActionIds.has(actionId));
    expect(missing).toEqual([]);
  });

  it('keeps lifecycle pending flags in sync with action contract statuses', () => {
    const actionById = new Map(actions.PLATFORM_CORE_UI_ACTION_CONTRACTS.map((action) => [action.actionId, action]));
    const mismatches = lifecycle.PLATFORM_CORE_LIFECYCLE_ACTION_MAP.filter((step) => {
      const action = actionById.get(step.actionId);
      return Boolean(action) && step.isPending !== action.status.startsWith('PENDING');
    }).map((step) => step.actionId);
    expect(mismatches).toEqual([]);
  });

  it('keeps commercial rollout blockers explicit and countable', () => {
    expect(lifecycle.getPlatformCoreLifecycleCommercialGapCount()).toBeGreaterThan(0);
    expect(lifecycle.getPlatformCoreLifecyclePendingActionIds()).toEqual(
      expect.arrayContaining([
        'request_revision',
        'write_qc_gate',
        'create_packing_list',
        'accept_delivery',
        'close_order',
        'open_collection_chat',
      ])
    );
  });

  it('starts with article creation and ends with communications history', () => {
    const steps = lifecycle.PLATFORM_CORE_LIFECYCLE_ACTION_MAP;
    expect(steps[0]?.actionId).toBe('create_article');
    expect(steps.at(-1)?.actionId).toBe('open_order_chat');
  });
});

describe('Platform Core UI repair queue', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const actions = require('@/lib/platform-core-ui-action-contracts') as typeof import('@/lib/platform-core-ui-action-contracts');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const lifecycle = require('@/lib/platform-core-lifecycle-map') as typeof import('@/lib/platform-core-lifecycle-map');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const repairQueue = require('@/lib/platform-core-ui-repair-queue') as typeof import('@/lib/platform-core-ui-repair-queue');

  it('keeps every P0 commercial lifecycle gap represented in the repair queue', () => {
    const p0ActionIds = new Set(repairQueue.getPlatformCoreP0RepairQueue().flatMap((item) => [...item.actionIds]));
    const missing = lifecycle
      .getPlatformCoreLifecyclePendingActionIds()
      .filter((actionId) => !p0ActionIds.has(actionId));
    expect(missing).toEqual([]);
  });

  it('references only known action contracts', () => {
    const knownActionIds = new Set(actions.PLATFORM_CORE_UI_ACTION_CONTRACTS.map((action) => action.actionId));
    const unknown = repairQueue
      .getPlatformCoreRepairQueueActionIds()
      .filter((actionId) => !knownActionIds.has(actionId));
    expect(unknown).toEqual([]);
  });

  it('requires each repair item to have concrete acceptance criteria', () => {
    for (const item of repairQueue.PLATFORM_CORE_UI_REPAIR_QUEUE) {
      expect(item.repairId).toMatch(/^p[0-2]-/);
      expect(item.titleRu.length).toBeGreaterThan(10);
      expect(item.problemRu.length).toBeGreaterThan(30);
      expect(item.fixRu.length).toBeGreaterThan(30);
      expect(item.acceptanceRu.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('keeps the weakest product pillar prioritized in P0', () => {
    const p0OrderProduction = repairQueue
      .getPlatformCoreP0RepairQueue()
      .filter((item) => item.pillarId === 'order_production');
    expect(p0OrderProduction.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Platform Core canonical snapshot types', () => {
  it('chain snapshot types live in platform-core-chain-snapshot.types.ts', () => {
    const types = readRepo('src/lib/platform-core-chain-snapshot.types.ts');
    expect(types).toMatch(/PlatformCoreChainPillarSnapshot/);
    expect(types).toMatch(/PlatformCoreChainOverviewState/);
    expect(types).toMatch(/ChainPillarSnap/);
  });

  it('server chain-overview re-exports canonical chain types', () => {
    const server = readRepo('src/lib/server/platform-core-chain-overview.ts');
    expect(server).toMatch(/platform-core-chain-snapshot\.types/);
  });
});

describe('Platform Core components/platform import guards (baseline)', () => {
  const files = walkTsFiles('src/components/platform').filter(isBaselinePlatformFile);

  it.each(files)('%s has no forbidden imports', (relPath) => {
    const content = readRepo(relPath);
    const hits = PLATFORM_CORE_FORBIDDEN.filter(({ re }) => re.test(content)).map(({ label }) => label);
    expect(hits).toEqual([]);
  });
});

describe('Platform Core hub matrix modularization', () => {
  it('peers and demo-rewrite are extracted from hub-matrix.ts', () => {
    expect(fs.existsSync(path.join(repoRoot, 'src/lib/platform-core-hub-matrix-peers.ts'))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, 'src/lib/platform-core-hub-matrix-demo-rewrite.ts'))).toBe(true);
    const hub = readRepo('src/lib/platform-core-hub-matrix.ts');
    const lines = hub.split('\n').length;
    expect(lines).toBeLessThan(520);
  });
});

describe('FastAPI write-path registry doc', () => {
  it('documents spine entities as read-only via FastAPI in Platform Core mode', () => {
    const doc = readDoc('FASTAPI_PLATFORM_CORE_WRITE_REGISTRY.md');
    expect(doc).toMatch(/read-only|READ ONLY/i);
    expect(doc).toMatch(/orders\.py|collections\.py|collaboration/i);
  });
});
