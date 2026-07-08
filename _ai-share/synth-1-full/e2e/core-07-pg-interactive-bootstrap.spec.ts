import { test, expect } from '@playwright/test';
import { gotoPlatformHubAudit } from './helpers/core-chain-overview';

/**
 * PG без auto-handoff seed: `npm run db:core:bootstrap:interactive`
 * (CORE_BOOTSTRAP_SKIP_HANDOFF=1 — handoff через UI, не через seed).
 *
 * В CI с полным `db:core:bootstrap` тесты всё равно проходят (handedOff может быть true).
 * Отдельный job: `npm run core:verify:interactive`.
 */
const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

test.describe('Platform Core PG interactive bootstrap', () => {
  test('hub: матрица без bootstrap-banner при живом chain-overview', async ({ page, request }) => {
    const overviewRes = await request.get(
      '/api/workshop2/platform-core/chain-overview?collectionId=SS27'
    );
    const overviewOk = overviewRes.ok();
    const overviewJson = overviewOk
      ? ((await overviewRes.json()) as { ok?: boolean; overview?: unknown })
      : null;
    const hasLiveOverview = overviewJson?.ok === true && overviewJson.overview != null;

    test.skip(
      !hasLiveOverview,
      'PG/seed недоступен — пропуск (нужен db:core:bootstrap:interactive)'
    );

    const res = await gotoPlatformHubAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-bootstrap-banner')).toHaveCount(0);
  });

  test('W2 + showroom: PG без полного handoff seed', async ({ page, request }) => {
    const w2Res = await request.get('/api/brand/production/workshop2/articles?collectionId=SS27');
    test.skip(!w2Res.ok(), 'W2 API недоступен без PG');

    let res = await page.goto('/brand/production/workshop2?w2col=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 30_000 });

    res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('sample-collection-pillar-card')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('chain-status: заказ в PG, handoff согласован с UI', async ({ page, request }) => {
    const chainRes = await request.get(`/api/workshop2/b2b/orders/${DEMO_ORDER}/chain-status`);
    test.skip(!chainRes.ok(), 'B2B order API недоступен без PG seed');

    const chainJson = (await chainRes.json()) as {
      ok?: boolean;
      chain?: { handedOff?: boolean; status?: string };
    };
    expect(chainJson.ok).toBe(true);
    expect(chainJson.chain?.status).toBeTruthy();

    const res = await page.goto(`/shop/b2b/orders/${DEMO_ORDER}`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-order-detail-chrome')).toBeVisible({
      timeout: 30_000,
    });
    const chainCard = page
      .getByTestId('shop-co-chain-card')
      .or(page.getByTestId('shop-op-order-status-chain-card'))
      .or(page.getByTestId('shop-co-detail-chain-card'))
      .or(page.getByTestId('brand-order-chain-status-card'))
      .or(page.getByTestId('platform-core-b2b-order-facts'))
      .or(page.getByTestId('shop-order-comms-golden-path-strip'));
    const legacyChain = page
      .getByTestId('shop-co-chain-card')
      .or(page.getByTestId('shop-co-detail-chain-card'))
      .or(page.getByTestId('brand-order-chain-status-card'));
    if (await legacyChain.count()) {
      await expect(legacyChain.first()).toHaveAttribute(
        'data-chain-handoff',
        chainJson.chain?.handedOff ? 'done' : 'pending',
        { timeout: 30_000 }
      );
    } else {
      await expect(chainCard.first()).toBeVisible({ timeout: 30_000 });
    }
  });
});
