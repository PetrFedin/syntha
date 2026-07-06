import { expect, type APIRequestContext, type Page } from '@playwright/test';
import type { GoldenCrossRoleStop } from '../../src/lib/platform-core-golden-cross-role-path';
import { gotoRoleCoreCabinet } from './core-chain-overview';

const LEGACY_URL = /\/shop\/b2b\/|\/brand\/b2b-orders/;

export async function readPlatformCoreHealth(request: APIRequestContext): Promise<{
  demoSeeded?: boolean;
}> {
  try {
    const res = await request.get('/api/workshop2/platform-core/health');
    if (!res.ok()) return { demoSeeded: false };
    return (await res.json()) as { demoSeeded?: boolean };
  } catch {
    return { demoSeeded: false };
  }
}

/** Без PG detail-панели зависают на загрузке заказа — пропускаем `-detail` в smoke. */
export function filterGoldenStopsForHealth(
  stops: GoldenCrossRoleStop[],
  demoSeeded: boolean
): GoldenCrossRoleStop[] {
  if (demoSeeded) return stops;
  return stops.filter((s) => !s.sectionId.endsWith('-detail'));
}

async function expectGoldenPanelVisible(page: Page, stop: GoldenCrossRoleStop): Promise<void> {
  const panel = page.getByTestId(stop.panelTestId);
  const isDetail = stop.sectionId.endsWith('-detail');

  if (isDetail) {
    for (const loadingId of [
      'platform-core-order-facts-loading',
      'brand-order-comms-detail-loading',
    ]) {
      const loading = page.getByTestId(loadingId);
      if (await loading.isVisible().catch(() => false)) {
        await expect(loading).toBeHidden({ timeout: 120_000 });
      }
    }
    // Вложенные testid (core → panel → facts) — один panelTestId, без .or() (strict mode).
    await expect(panel).toBeVisible({ timeout: 60_000 });
    return;
  }

  await expect(panel).toBeVisible({ timeout: 90_000 });
}

export async function visitGoldenCrossRoleStop(
  page: Page,
  stop: GoldenCrossRoleStop
): Promise<void> {
  const res = await gotoRoleCoreCabinet(page, stop.href);
  expect(res?.status() ?? 599).toBeLessThan(500);
  expect(page.url()).not.toMatch(LEGACY_URL);
  await expect(page.getByTestId(stop.workspaceTestId)).toBeVisible({ timeout: 120_000 });
  await expectGoldenPanelVisible(page, stop);
}

export async function clickCabinetSectionLink(
  page: Page,
  sectionId: string,
  expectedPanelTestId: string
): Promise<void> {
  const link = page.getByTestId(`role-pillar-section-${sectionId}`);
  await expect(link).toBeVisible({ timeout: 30_000 });
  await link.click();
  await expect(page).toHaveURL(new RegExp(`section=${sectionId}`), { timeout: 30_000 });
  expect(page.url()).not.toMatch(LEGACY_URL);
  await expect(page.getByTestId(expectedPanelTestId)).toBeVisible({ timeout: 60_000 });
}
