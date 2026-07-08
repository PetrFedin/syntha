import { test, expect } from '@playwright/test';

/**
 * Интерактивный handoff: после `npm run db:core:bootstrap:interactive` на brand order
 * виден `b2b-chain-awaiting-handoff` и кнопка подтверждения активна.
 * В CI (полный bootstrap) — handoff уже выполнен, проверяем обратное состояние.
 */
const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

test.describe('Platform Core interactive handoff', () => {
  test('brand order: состояние handoff согласовано с chain-status API', async ({
    page,
    request,
  }) => {
    const chainRes = await request.get(
      `/api/workshop2/b2b/orders/${DEMO_ORDER}/chain-status`
    );
    expect(chainRes.ok()).toBeTruthy();
    const chainJson = (await chainRes.json()) as {
      ok?: boolean;
      chain?: {
        handedOff?: boolean;
        status?: string;
        steps?: Array<{ id: string; done: boolean }>;
      };
    };
    expect(chainJson.ok).toBe(true);
    const handedOff = chainJson.chain?.handedOff === true;

    const chainResponse = page.waitForResponse(
      (r) => r.url().includes('/chain-status') && r.ok(),
      { timeout: 60_000 }
    );
    const res = await page.goto(`/brand/b2b-orders/${DEMO_ORDER}`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await chainResponse;
    const chrome = page.getByTestId('platform-core-order-detail-chrome');
    await expect(chrome).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(new RegExp(DEMO_ORDER), { timeout: 30_000 });
    await expect(chrome.getByTestId('platform-core-context-entity')).toContainText('Оптовый заказ');
    await expect(chrome.getByTestId('platform-core-role-pillar-strip')).toHaveCount(0);
    await expect(chrome.getByTestId('role-pillar-link-order_production')).toBeVisible();

    const chainCard = page
      .getByTestId('brand-co-chain-card')
      .or(page.getByTestId('brand-co-detail-chain-card'))
      .or(page.getByTestId('brand-order-chain-status-card'))
      .or(page.getByTestId('brand-order-comms-detail-panel'))
      .or(page.getByTestId('platform-core-b2b-order-facts'));
    const legacyChainCard = page.getByTestId('brand-order-chain-status-card');
    if (await legacyChainCard.count()) {
      await expect(legacyChainCard).toHaveAttribute(
        'data-chain-handoff',
        handedOff ? 'done' : 'pending',
        { timeout: 30_000 }
      );
    } else {
      await expect(chainCard).toBeVisible({ timeout: 30_000 });
    }
    const contextStrip = page
      .getByTestId('brand-order-handoff-context-strip')
      .or(page.getByTestId('brand-co-chain-context-strip'))
      .or(page.getByTestId('brand-co-detail-context-strip'))
      .or(page.getByTestId('brand-order-comms-detail-summary-card'));
    if (await contextStrip.count()) {
      await expect(contextStrip.first()).toBeVisible({ timeout: 30_000 });
    }
    const chainSteps = page
      .getByTestId('brand-co-chain-steps')
      .or(page.getByTestId('platform-core-brand-chain-steps'));
    if (await chainSteps.count()) {
      await expect(chainSteps.first()).toBeVisible({ timeout: 30_000 });
    }
    if (handedOff) {
      const handoffBtn = page.getByTestId('brand-b2b-confirm-production-handoff');
      if (await handoffBtn.count()) {
        await expect(handoffBtn).toBeDisabled();
      }
      await expect(page.getByTestId('platform-core-order-po-card')).toBeVisible();
      await expect(page.getByTestId('platform-core-order-po')).toContainText('PO-B2B-');
    } else {
      const brandConfirmed =
        chainJson.chain?.steps?.find((s) => s.id === 'brand_confirmed')?.done === true;
      const confirmBtn = page.getByTestId('brand-b2b-confirm-order');
      const handoffBtn = page.getByTestId('brand-b2b-confirm-production-handoff');
      const hasLegacyHandoffUi = (await confirmBtn.count()) > 0 || (await handoffBtn.count()) > 0;

      if (hasLegacyHandoffUi) {
        if (!brandConfirmed) {
          await expect(confirmBtn).toBeEnabled();
          const confirmResponse = page.waitForResponse(
            (r) =>
              r.url().includes('/confirm-order') &&
              r.request().method() === 'POST' &&
              r.ok(),
            { timeout: 60_000 }
          );
          await confirmBtn.click();
          await confirmResponse;
        }
        await expect(handoffBtn).toBeEnabled();
        const handoffResponse = page.waitForResponse(
          (r) =>
            r.url().includes('/confirm-production-handoff') &&
            r.request().method() === 'POST' &&
            r.ok(),
          { timeout: 60_000 }
        );
        await handoffBtn.click();
        await handoffResponse;
      } else {
        if (!brandConfirmed) {
          const confirmRes = await request.post(
            `/api/workshop2/b2b/orders/${DEMO_ORDER}/confirm-order`
          );
          expect(confirmRes.ok()).toBeTruthy();
        }
        const handoffRes = await request.post(
          `/api/workshop2/b2b/orders/${DEMO_ORDER}/confirm-production-handoff`
        );
        expect(handoffRes.ok()).toBeTruthy();
      }

      const legacyAfter = page.getByTestId('brand-order-chain-status-card');
      if (await legacyAfter.count()) {
        await expect(legacyAfter).toHaveAttribute('data-chain-handoff', 'done', { timeout: 30_000 });
      }
      await expect(page.getByTestId('platform-core-order-po-card')).toBeVisible();
      await expect(page.getByTestId('platform-core-order-po')).toContainText('PO-B2B-');

      const chainAfter = await request.get(
        `/api/workshop2/b2b/orders/${DEMO_ORDER}/chain-status`
      );
      const chainAfterJson = (await chainAfter.json()) as {
        ok?: boolean;
        chain?: {
        handedOff?: boolean;
        productionOrderId?: string;
        inventoryReserved?: boolean;
        steps?: Array<{ id: string; done: boolean }>;
      };
      };
      expect(chainAfterJson.chain?.handedOff).toBe(true);
      expect(chainAfterJson.chain?.productionOrderId).toContain('PO-B2B-');
      const steps = (
        chainAfterJson.chain as { steps?: Array<{ id: string; done: boolean }> } | undefined
      )?.steps;
      const inventoryStep = steps?.find((s) => s.id === 'inventory_reserved');
      expect(inventoryStep).toBeTruthy();
      if (chainAfterJson.chain?.inventoryReserved === true) {
        expect(inventoryStep?.done).toBe(true);
      }

      const queueRes = await request.get(
        '/api/workshop2/factory/production-handoff-queue?factoryId=fact-1'
      );
      expect(queueRes.ok()).toBeTruthy();
      const queueJson = (await queueRes.json()) as {
        ok?: boolean;
        items?: Array<{ b2bOrderId: string }>;
      };
      expect(
        queueJson.items?.some((item) => item.b2bOrderId === DEMO_ORDER)
      ).toBe(true);

      // Bulk accept — только очередь передачи (реестр orders: поштучно + link)
      let ordersRes = await page.goto(`/factory/production?factoryId=fact-1#handoff-queue`, GOTO);
      expect(ordersRes?.status() ?? 599).toBeLessThan(500);
      await expect(page.getByTestId('factory-handoff-bulk-acknowledge')).toBeVisible({
        timeout: 30_000,
      });
      const registryAckRes = page.waitForResponse(
        (r) =>
          r.url().includes('/production-handoff-queue/bulk-acknowledge') &&
          r.request().method() === 'POST' &&
          r.ok(),
        { timeout: 60_000 }
      );
      await page.getByTestId('factory-handoff-bulk-acknowledge').click();
      await registryAckRes;
      await expect(page).toHaveURL(/\/factory\/production\/orders\?order=/, { timeout: 30_000 });
      const statusBadge = page.getByTestId(`factory-production-order-status-${DEMO_ORDER}`);
      await expect(statusBadge).toBeVisible({ timeout: 30_000 });
      await expect(statusBadge).not.toHaveText(/очереди цеха/i);

      const handoffPanel = page.getByTestId('mfr-op-handoff-queue-panel');
      await expect(handoffPanel).toBeVisible({ timeout: 30_000 });
      const row = handoffPanel.getByTestId(`factory-handoff-row-${DEMO_ORDER}`);
      await expect(row).toBeVisible({ timeout: 30_000 });
      await expect(row.getByTestId(`b2b-chain-factory-synced-${DEMO_ORDER}`)).toBeVisible({
        timeout: 30_000,
      });
    }
  });
});
