import { test, expect } from '@playwright/test';
import { gotoPlatformCoreWorkspace, waitForChainOverview } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 120_000 };

const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

/** M3 · один smoke на столп / representative workspace (§ core-95 backlog). */
const REPRESENTATIVE = [
  {
    id: 'brand-w2-hub',
    url: '/brand/production/workshop2?w2col=SS27&pcf=hub',
    anchor: 'brand-dev-w2-hub-panel',
    needsChain: false,
  },
  {
    id: 'shop-matrix',
    url: '/shop/b2b/matrix?collection=SS27',
    anchor: 'shop-co-matrix-shell',
    needsChain: true,
  },
  {
    id: 'brand-co-registry',
    url: '/brand/b2b-orders?collection=SS27',
    anchor: 'brand-co-registry-panel',
    needsChain: false,
  },
  {
    id: 'factory-dossier',
    url: '/factory/production/dossier/demo-ss27-01?collection=SS27',
    anchor: 'mfr-dev-dossier-panel',
    needsChain: false,
  },
  {
    id: 'brand-order-messages',
    url: `/brand/messages?contextType=b2b_order&contextId=${DEMO_ORDER}&order=${DEMO_ORDER}&orderId=${DEMO_ORDER}`,
    anchor: 'platform-core-comms-inbox-shell',
    needsChain: false,
  },
] as const;

async function expectNoPageOverflow(page: import('@playwright/test').Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      { timeout: 30_000 }
    )
    .toBe(true);
}

async function openWorkspace(
  page: import('@playwright/test').Page,
  spec: (typeof REPRESENTATIVE)[number]
): Promise<void> {
  const chain = spec.needsChain
    ? waitForChainOverview(page, { collectionId: 'SS27' })
    : null;
  const res = spec.needsChain
    ? await page.goto(spec.url, GOTO)
    : await gotoPlatformCoreWorkspace(page, spec.url);
  expect(res?.status() ?? 599).toBeLessThan(500);
  if (chain) await chain.catch(() => undefined);
}

test.describe('core-109: representative workspaces M3 overflow', () => {
  for (const spec of REPRESENTATIVE) {
    test(`iPhone 393 — ${spec.id}`, async ({ page }) => {
      test.setTimeout(240_000);
      await page.setViewportSize({ width: 393, height: 812 });
      await openWorkspace(page, spec);
      await expect(page.getByTestId(spec.anchor)).toBeVisible({ timeout: 120_000 });
      await expectNoPageOverflow(page);
    });

    test(`iPad 834 — ${spec.id}`, async ({ page }) => {
      test.setTimeout(240_000);
      await page.setViewportSize({ width: 834, height: 1194 });
      await openWorkspace(page, spec);
      await expect(page.getByTestId(spec.anchor)).toBeVisible({ timeout: 120_000 });
      await expectNoPageOverflow(page);
    });
  }
});
