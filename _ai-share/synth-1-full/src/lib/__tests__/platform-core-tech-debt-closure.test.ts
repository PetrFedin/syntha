import fs from 'fs';
import path from 'path';
import { PLATFORM_CORE_PLACEHOLDER_SURFACES } from '@/lib/platform-core-placeholder-surfaces';
import { isPlatformCorePlannerAutoDoneTitle } from '@/lib/platform-core-planner-auto-done';
import { mergeCommsHubInboxThreadRows } from '@/lib/communications/comms-hub-inbox-rows';

const SRC = path.join(__dirname, '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('platform-core tech-debt closure (волна 52–53)', () => {
  it('brand tasks: core mode не пишет localStorage', () => {
    const store = read('lib/production-data/brand-tasks-store.ts');
    const client = read('lib/production-data/brand-tasks-client.ts');
    expect(store).toContain('isPlatformCoreMode()');
    expect(store).toMatch(/if \(isPlatformCoreMode\(\)\) return \[\]/);
    expect(store).toMatch(/if \(isPlatformCoreMode\(\)\) return;/);
    expect(client).toContain('corePgOnly');
    expect(client).toMatch(/persistMode: 'postgres'/);
  });

  it('auxiliary JSON mirrors: fail-closed policy', () => {
    const policy = read('lib/server/platform-core-pg-primary-file-policy.ts');
    expect(policy).toContain('shouldWorkshop2PersistAuxiliaryJsonToFile');
    expect(policy).toContain('isWorkshop2PgOnlyMode');
    expect(
      fs.existsSync(
        path.join(SRC, 'lib/server/__tests__/platform-core-pg-primary-file-policy.test.ts')
      )
    ).toBe(true);
  });

  it('comms inbox: пустые order-треды без synthetic placeholder merge', () => {
    const merged = mergeCommsHubInboxThreadRows([], ['B2B-X'], 'SS27');
    expect(merged).toHaveLength(1);
    expect(merged[0]?.messageCount).toBe(0);
    expect(merged[0]?.lastMessagePreview).toContain('Нет сообщений');
    const strip = read('components/platform/CommsPillarThreadStrip.tsx');
    expect(strip).not.toContain('synthetic placeholder');
    expect(strip).not.toContain('mergePlaceholderThreads');
  });

  it('placeholder surfaces: disclaimer registry + analytics badge', () => {
    expect(PLATFORM_CORE_PLACEHOLDER_SURFACES.some((s) => s.route === '/brand/analytics')).toBe(
      true
    );
    const analytics = read('app/brand/analytics/page.tsx');
    expect(analytics).toContain('PlatformCorePlaceholderSurfaceDisclaimer');
    expect(analytics).toContain('PlatformCoreDemoDataBadge');
  });

  it('planner auto-done: закрытые tech-debt заголовки', () => {
    const closed = [
      'Brand tasks Kanban — localStorage brand_tasks_kanban_v1 (закрыто: PG API)',
      'Auxiliary stores без PG — JSON mirrors (закрыто: pg-primary-file-policy)',
      'Create-article wizard — hub path (закрыто: core-37)',
      'Экраны на placeholder-data / статичных JSON (закрыто: demo badge)',
      'Незакрытые строки CROSS_ROLE_FLOWS §5.6 (закрыто: core-54)',
      'Дубли demo-id / handoff / cross-role на core-path (закрыто: audit 35/35)',
      'Dev-баннеры и recovery chrome на core-path (закрыто: golden path suppress)',
      'EMPTY27 / пустая цепочка без онбординга (закрыто: BrandDevEmptyChainOnboarding)',
    ];
    for (const title of closed) {
      expect(isPlatformCorePlannerAutoDoneTitle(title)).toBe(true);
    }
  });
});
