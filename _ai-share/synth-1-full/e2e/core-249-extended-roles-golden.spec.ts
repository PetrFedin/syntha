import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import { buildPlatformCoreGoldenCrossRoleStops } from '../src/lib/platform-core-golden-cross-role-path';
import { visitGoldenCrossRoleStop } from './helpers/platform-core-golden-path';

/**
 * Extended roles (manufacturer + supplier) — только при `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`.
 * Dev: `PC_EXTENDED_ROLES_E2E=1 npm run test:e2e:core -- e2e/core-249-extended-roles-golden.spec.ts`
 */
test.describe.configure({ mode: 'serial' });

const extendedEnabled = process.env.PC_EXTENDED_ROLES_E2E === '1';

const demo = {
  collectionId: PLATFORM_CORE_DEMO.collectionId,
  demoOrderId: PLATFORM_CORE_DEMO.demoOrderId,
  demoArticleId: PLATFORM_CORE_DEMO.demoArticleId,
};

test.describe('core-249 extended roles golden (mfr + supplier)', () => {
  test.skip(!extendedEnabled, 'Set PC_EXTENDED_ROLES_E2E=1 and NEXT_PUBLIC_PC_EXTENDED_ROLES=1');

  test('manufacturer OP embedded: handoff queue → production orders', async ({ page }) => {
    const mfrStops = buildPlatformCoreGoldenCrossRoleStops(demo).filter(
      (s) => s.roleId === 'manufacturer'
    );
    for (const stop of mfrStops) {
      await visitGoldenCrossRoleStop(page, stop);
    }
  });

  test('supplier OP embedded: procurement under PO', async ({ page }) => {
    const stop = buildPlatformCoreGoldenCrossRoleStops(demo).find((s) => s.roleId === 'supplier');
    expect(stop).toBeTruthy();
    await visitGoldenCrossRoleStop(page, stop!);
  });
});
