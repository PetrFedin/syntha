import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import { gotoPlatformCoreWorkspace, gotoPlatformHubAudit } from './helpers/core-chain-overview';
import {
  WAVE_YU_E2E_SPEC,
  WAVE_YU_SUP_OP_AUDIT_STATIC_SCORE,
  WAVE_YU_SUP_OP_PROCUREMENT_SECTION_ID,
} from '../src/lib/platform/wave-yu-sup-op-80-bump';
import { waveYzReadinessScoreCellTestId } from '../src/lib/platform/wave-yz-cell-score-export';
import {
  WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_STEPS_TESTID,
  WAVE_YJ_SUP_OP_PROCUREMENT_HONEST_CHAIN_ATTR,
} from '../src/lib/platform/wave-yj-sup-op-procurement-chain';
import {
  WAVE_WP_SUP_BOM_PO_PROGRESS_TESTID,
  WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_TESTID,
} from '../src/lib/platform/wave-wp-sup-bom-po-progress';
import { WAVE_WI_SUP_PARTIAL_SHIP_STRIP_TESTID } from '../src/lib/platform/wave-wi-supplier-partial-ship';

const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;
const PO = PLATFORM_CORE_DEMO.productionOrderId;

const PROCUREMENT_URL =
  `/factory/production/materials?collection=${COLLECTION}&article=${ARTICLE}` +
  `&view=procurement&role=supplier&order=${DEMO_ORDER}&po=${PO}`;

const CABINET_URL = `/factory/supplier/core?pillar=order_production&collection=${COLLECTION}`;

/**
 * Wave YU: supplier OP audit 7.5→8.0 — YJ/YI/WP/WI chain + hub score spot check.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-236-wave-yu-sup-op-80.spec.ts
 */
test.describe('core-236: wave YU supplier OP audit 8.0', () => {
  test('procurement workspace — YJ chain + WP BOM×PO + WI partial host', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoPlatformCoreWorkspace(page, PROCUREMENT_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('sup-op-procurement-panel')).toBeVisible({ timeout: 30_000 });

    const chain = page.getByTestId(WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_STEPS_TESTID);
    await expect(chain).toBeVisible({ timeout: 15_000 });
    await expect(chain).toHaveAttribute(WAVE_YJ_SUP_OP_PROCUREMENT_HONEST_CHAIN_ATTR, '1');
    await expect(chain).toContainText(/Резерв WMS/i);

    await expect(page.getByTestId(WAVE_WP_SUP_BOM_PO_PROGRESS_TESTID)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId(WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_TESTID)).toBeVisible();

    const partialHost = page.getByTestId('sup-op-procurement-partial-ship-host');
    const partialStrip = page.getByTestId(WAVE_WI_SUP_PARTIAL_SHIP_STRIP_TESTID);
    await expect(partialHost.or(partialStrip)).toBeVisible({ timeout: 15_000 });
  });

  test('supplier OP cabinet — spine nav + chain steps mirror', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await gotoPlatformCoreWorkspace(page, CABINET_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('sup-op-cabinet-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sup-op-cabinet-spine-nav-strip')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('sup-op-chain-steps')).toBeVisible({ timeout: 15_000 });
  });

  test('hub audit — supplier OP cell score 8.0 + export API', async ({ page, request }) => {
    const scoresRes = await request.get(
      `/api/workshop2/platform-core/readiness-scores?collectionId=${COLLECTION}&mode=static`
    );
    expect(scoresRes.ok()).toBeTruthy();
    const scoresJson = (await scoresRes.json()) as {
      cells?: Array<{
        roleId: string;
        pillarId: string;
        staticScore: number | null;
        active: boolean;
      }>;
    };
    const supOp = scoresJson.cells?.find(
      (c) => c.roleId === 'supplier' && c.pillarId === 'order_production' && c.active
    );
    expect(supOp?.staticScore).toBe(WAVE_YU_SUP_OP_AUDIT_STATIC_SCORE);

    const res = await gotoPlatformHubAudit(page, '/platform', { collectionId: COLLECTION });
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('platform-core-readiness-matrix')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId(waveYzReadinessScoreCellTestId('supplier', 'order_production'))).toBeVisible({
      timeout: 30_000,
    });
  });

  test('WI/WP APIs respond on procurement spine', async ({ request }) => {
    const bulkRes = await request.post('/api/workshop2/supplier/material-request/bulk-confirm', {
      data: {
        collectionId: COLLECTION,
        articleId: ARTICLE,
        b2bOrderId: DEMO_ORDER,
        productionOrderId: PO,
        updatedBy: 'e2e-yu',
      },
    });
    expect(bulkRes.status()).toBeLessThan(500);

    const wmsRes = await request.post('/api/workshop2/supplier/wms-confirm', {
      data: {
        b2bOrderId: DEMO_ORDER,
        productionOrderId: PO,
        collectionId: COLLECTION,
        articleId: ARTICLE,
      },
    });
    expect(wmsRes.status()).toBeLessThan(500);
  });

  test('meta — core-236 registered + section id SoT', () => {
    expect(WAVE_YU_E2E_SPEC).toBe('core-236-wave-yu-sup-op-80.spec.ts');
    expect(WAVE_YU_SUP_OP_PROCUREMENT_SECTION_ID).toBe('sup-op-procurement');
    expect(WAVE_YU_SUP_OP_AUDIT_STATIC_SCORE).toBe(8.0);
  });
});
