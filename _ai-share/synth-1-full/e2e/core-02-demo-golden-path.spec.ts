import { test, expect } from '@playwright/test';
import {
  cabinetPillarButton,
  clickCabinetPillar,
  clickCabinetPrimaryCta,
  expectCabinetPillarNav,
  expectWorkspacePillarStrip,
  gotoPlatformHub,
  gotoPlatformHubAudit,
  gotoPlatformPageAudit,
  gotoRoleCoreCabinet,
  clickReadinessScoreExpand,
  openReadinessWorkspaceFromScore,
  waitForChainOverview,
} from './helpers/core-chain-overview';

/**
 * Investor-style golden path: все маршруты из `npm run core:demo`.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core
 */
const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };
const FW27_COLLECTION_LABEL = 'Осень–зима 2027';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

const W2_DEV_HEADERS = {
  'content-type': 'application/json',
  'x-w2-actor-label': 'e2e-golden',
  'x-w2-actor-id': 'brand-001',
  'x-w2-actor-roles': 'production:edit',
  'x-w2-organization-id': 'org-brand-001',
};

async function isInternalWmsEnabled(
  request: import('@playwright/test').APIRequestContext
): Promise<boolean> {
  const res = await request.get('/api/workshop2/articles/SS27/demo-ss27-01/wms/balances', {
    headers: W2_DEV_HEADERS,
  });
  if (!res.ok()) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    return json.error !== 'internal_wms_disabled';
  }
  return true;
}

test.describe.configure({ mode: 'serial' });

test.describe('Platform Core golden path', () => {
  test('столп 1: hub → W2 → range → factory', async ({ page }) => {
    let res = await gotoPlatformHub(page);
    expect(res?.status() ?? 599).toBeLessThan(500);

    res = await page.goto('/brand/production/workshop2?w2col=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByText('Разработка: от артикула до образца')).toBeVisible({
      timeout: 30_000,
    });
    const w2Chrome = page.getByTestId('platform-core-development-chrome');
    await expect(w2Chrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, w2Chrome);
    await expect(page.getByTestId('platform-core-list-chrome')).toBeVisible();
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    expect(healthRes.ok()).toBeTruthy();
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    expect(health.pgReachable).toBe(true);

    res = await page.goto('/brand/range-planner', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByRole('heading', { name: 'Планировщик ассортимента' })).toBeVisible({
      timeout: 30_000,
    });
    const rangeChrome = page.getByTestId('platform-core-development-chrome');
    await expect(rangeChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, rangeChrome);

    res = await page.goto('/brand/factories/f1', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-development-chrome')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('heading', { name: 'Очередь образцов' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('SAMPLE-DEMO-SS27-01')).toBeVisible({ timeout: 30_000 });
  });

  test('W2 hub: UI create article round-trip', async ({ page }) => {
    test.setTimeout(240_000);
    const sku = `E2E-W2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    const res = await page.goto('/brand/production/workshop2?w2col=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-w2-create-article-btn')).toBeVisible({ timeout: 60_000 });
    await page.getByTestId('brand-w2-create-article-btn').click();
    await expect(page.getByTestId('brand-w2-create-article-dialog')).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId('brand-w2-create-article-sku').fill(sku);
    await page.getByTestId('brand-w2-create-article-name').fill('E2E smoke article');
    // Диалог сам выставляет L1→L2→L3 (useEffect); ждём enabled submit, не selectOption по index.
    const submit = page.getByTestId('brand-w2-create-article-submit');
    await expect(submit).toBeEnabled({ timeout: 30_000 });
    const createdNav = page.waitForURL(/\/brand\/production\/workshop2\/c\/SS27\/a\//, {
      timeout: 120_000,
      waitUntil: 'domcontentloaded',
    });
    await submit.click();
    await createdNav;
  });

  test('W2: UI dossier general — PG chip + passport поля + save chrome', async ({ page }) => {
    test.setTimeout(180_000);
    const articleId = 'demo-ss27-01';
    let res = await page.goto('/brand/production/workshop2?w2col=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-w2-create-article-btn')).toBeVisible({ timeout: 60_000 });
    res = await page.goto(
      `/brand/production/workshop2/c/SS27/a/${articleId}?w2pane=tz&w2sec=general`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('workshop2-dossier-save-draft')).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByTestId('workshop2-tz-general-pg-chip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('workshop2-dossier-planned-launch-note')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('workshop2-dossier-packaging-note')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('workshop2-dossier-weight-dimensions-note')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('W2: UI dossier секции assignment (PG chip + ворота передачи)', async ({ page }) => {
    let res = await page.goto('/brand/production/workshop2?w2col=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 60_000 });
    res = await page.goto(
      '/brand/production/workshop2/c/SS27/a/demo-ss27-01?w2pane=tz&w2sec=assignment',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('workshop2-tz-assignment-pg-chip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('workshop2-factory-handoff-probe-gate')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('workshop2-factory-handoff-gate-checks')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('workshop2-dossier-save-draft')).toBeVisible({ timeout: 30_000 });
  });

  test('W2: UI round-trip construction smartRoutingSequence (equipment)', async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);
    const articleId = 'demo-ss27-02';
    const equipment = `e2e-equip-${Date.now()}`;
    let res = await page.goto(
      `/brand/production/workshop2/c/SS27/a/${articleId}?w2pane=tz&w2sec=construction`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('workshop2-dossier-save-draft')).toBeVisible({
      timeout: 60_000,
    });
    const smartRouting = page.getByTestId('workshop2-smart-routing-panel');
    await smartRouting.scrollIntoViewIfNeeded();
    await expect(smartRouting).toBeVisible({ timeout: 60_000 });

    const equipInput = page.getByTestId('workshop2-dossier-construction-routing-equipment-0');
    if ((await equipInput.count()) === 0) {
      const loadBtn = page.getByTestId('workshop2-smart-routing-load-template');
      if (await loadBtn.isEnabled().catch(() => false)) {
        await loadBtn.click({ force: true });
      }
      if ((await equipInput.count()) === 0) {
        await page.getByRole('button', { name: 'Добавить операцию' }).click({ force: true });
      }
      await expect(equipInput).toBeVisible({ timeout: 45_000 });
    }

    await equipInput.fill(equipment, { force: true });
    await expect(equipInput).toHaveValue(equipment, { timeout: 5_000 });

    const saveBtn = page.getByTestId('workshop2-dossier-save-draft');
    await saveBtn.scrollIntoViewIfNeeded();
    const dossierPut = page.waitForResponse(
      (r) =>
        r.request().method() === 'PUT' &&
        r.url().includes(`/api/workshop2/articles/SS27/${articleId}/dossier`),
      { timeout: 90_000 }
    );
    await saveBtn.click();
    const putRes = await dossierPut;
    expect(putRes.ok()).toBeTruthy();
  });

  test('W2: API dossier round-trip smartRoutingSequence (equipment)', async ({ request }) => {
    const articleId = 'demo-ss27-02';
    const getRes = await request.get(`/api/workshop2/articles/SS27/${articleId}/dossier`, {
      headers: W2_DEV_HEADERS,
    });
    expect(getRes.ok()).toBeTruthy();
    const body = (await getRes.json()) as {
      ok?: boolean;
      dossier?: {
        smartRoutingSequence?: Array<{
          id: string;
          category: string;
          name: string;
          equipment: string;
          sash: number;
        }>;
      };
      version?: number;
    };
    expect(body.ok).toBe(true);
    const equipment = `e2e-api-equip-${Date.now()}`;
    const sequence = [
      {
        id: 'e2e-op-1',
        category: 'Сборка',
        name: 'E2E операция',
        equipment,
        sash: 2.5,
      },
    ];
    const putRes = await request.put(`/api/workshop2/articles/SS27/${articleId}/dossier`, {
      headers: W2_DEV_HEADERS,
      data: {
        dossier: {
          ...body.dossier,
          smartRoutingSequence: sequence,
        },
        baseVersion: body.version,
      },
    });
    expect(putRes.ok()).toBeTruthy();
    const get2 = await request.get(`/api/workshop2/articles/SS27/${articleId}/dossier`, {
      headers: W2_DEV_HEADERS,
    });
    const body2 = (await get2.json()) as {
      dossier?: { smartRoutingSequence?: typeof sequence };
    };
    expect(body2.dossier?.smartRoutingSequence?.[0]?.equipment).toBe(equipment);
  });

  test('W2: UI round-trip material BOM (materialName)', async ({ page }) => {
    test.setTimeout(180_000);
    const materialName = `e2e-mat-${Date.now()}`;
    const res = await page.goto(
      '/brand/production/workshop2/c/SS27/a/demo-ss27-02?w2sec=material',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('workshop2-dossier-save-draft')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('workshop2-dossier-material-hub')).toBeVisible({
      timeout: 30_000,
    });
    const bomPanel = page.getByTestId('workshop2-dossier-material-bom-panel');
    await bomPanel.scrollIntoViewIfNeeded();
    await expect(bomPanel).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('workshop2-bom-pg-chip')).toBeVisible({ timeout: 30_000 });

    const nameInput = page.getByTestId('workshop2-dossier-material-bom-name-0');
    if ((await nameInput.count()) === 0) {
      await page.getByRole('button', { name: '+ Материал' }).first().click({ force: true });
    }
    await expect(nameInput).toBeVisible({ timeout: 45_000 });
    await nameInput.fill(materialName, { force: true });
    await expect(nameInput).toHaveValue(materialName, { timeout: 5_000 });

    const saveBtn = page.getByTestId('workshop2-dossier-save-draft');
    await saveBtn.scrollIntoViewIfNeeded();
    const dossierPut = page.waitForResponse(
      (r) =>
        r.request().method() === 'PUT' &&
        r.url().includes('/api/workshop2/articles/SS27/demo-ss27-02/dossier'),
      { timeout: 90_000 }
    );
    await saveBtn.click();
    const putRes = await dossierPut;
    expect(putRes.ok()).toBeTruthy();
  });

  test('W2: API dossier round-trip productionModel materialName', async ({ request }) => {
    const getRes = await request.get('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
    });
    expect(getRes.ok()).toBeTruthy();
    const body = (await getRes.json()) as {
      ok?: boolean;
      dossier?: {
        productionModel?: {
          version?: number;
          nodes?: Array<{ id: string; label?: string }>;
          materialLines?: Array<{
            id: string;
            nodeId: string;
            role?: string;
            materialName?: string;
          }>;
          trimLines?: unknown[];
        };
      };
      version?: number;
    };
    expect(body.ok).toBe(true);
    const materialName = `e2e-api-mat-${Date.now()}`;
    const model = body.dossier?.productionModel ?? { version: 1 as const, nodes: [], materialLines: [], trimLines: [] };
    const nodes =
      model.nodes && model.nodes.length > 0
        ? model.nodes
        : [{ id: 'e2e-node-1', label: 'Корпус', kind: 'body' as const, sortOrder: 1, status: 'draft' as const }];
    const nodeId = nodes[0]!.id;
    const materialLines =
      model.materialLines && model.materialLines.length > 0
        ? model.materialLines.map((line, idx) =>
            idx === 0 ? { ...line, materialName } : line
          )
        : [{ id: 'e2e-mat-1', nodeId, role: 'main' as const, materialName }];
    const putRes = await request.put('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
      data: {
        dossier: {
          ...body.dossier,
          productionModel: {
            ...model,
            version: 1,
            nodes,
            materialLines,
            trimLines: model.trimLines ?? [],
          },
        },
        baseVersion: body.version,
      },
    });
    expect(putRes.ok()).toBeTruthy();
    const get2 = await request.get('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
    });
    const body2 = (await get2.json()) as {
      dossier?: { productionModel?: { materialLines?: Array<{ materialName?: string }> } };
    };
    expect(body2.dossier?.productionModel?.materialLines?.[0]?.materialName).toBe(materialName);
  });

  test('W2: UI composition label technologistNotes — wizard + save', async ({ page }) => {
    const notes = `e2e-comp-${Date.now()}`;
    const res = await page.goto(
      '/brand/production/workshop2/c/SS27/a/demo-ss27-02?w2pane=tz&w2sec=material',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('workshop2-dossier-save-draft')).toBeVisible({
      timeout: 60_000,
    });
    const compositionPanel = page.getByTestId('workshop2-dossier-composition-label-panel');
    await compositionPanel.scrollIntoViewIfNeeded();
    await expect(compositionPanel).toBeVisible({ timeout: 60_000 });
    const step1Btn = compositionPanel.getByRole('button', {
      name: /Габариты, полотно и источники из ТЗ/,
    });
    await step1Btn.scrollIntoViewIfNeeded();
    await step1Btn.click({ force: true });
    const notesInput = compositionPanel.getByTestId('workshop2-dossier-composition-technologist-notes');
    await expect(notesInput).toBeVisible({ timeout: 15_000 });
    await notesInput.fill(notes, { force: true });
    await expect(notesInput).toHaveValue(notes, { timeout: 5_000 });

    const dossierPut = page.waitForResponse(
      (r) =>
        r.request().method() === 'PUT' &&
        r.url().includes('/api/workshop2/articles/SS27/demo-ss27-02/dossier'),
      { timeout: 90_000 }
    );
    await page.getByTestId('workshop2-dossier-save-draft').click();
    const putRes = await dossierPut;
    expect(putRes.ok()).toBeTruthy();
  });

  test('W2: API dossier round-trip compositionLabelSpec (technologistNotes)', async ({ request }) => {
    const getRes = await request.get('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
    });
    expect(getRes.ok()).toBeTruthy();
    const body = (await getRes.json()) as {
      ok?: boolean;
      dossier?: { compositionLabelSpec?: { technologistNotes?: string } };
      version?: number;
    };
    expect(body.ok).toBe(true);
    const technologistNotes = `e2e-api-comp-${Date.now()}`;
    const putRes = await request.put('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
      data: {
        dossier: {
          ...body.dossier,
          compositionLabelSpec: {
            ...(body.dossier?.compositionLabelSpec ?? {}),
            technologistNotes,
          },
        },
        baseVersion: body.version,
      },
    });
    expect(putRes.ok()).toBeTruthy();
    const get2 = await request.get('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
    });
    const body2 = (await get2.json()) as {
      dossier?: { compositionLabelSpec?: { technologistNotes?: string } };
    };
    expect(body2.dossier?.compositionLabelSpec?.technologistNotes).toBe(technologistNotes);
  });

  test('W2: UI composition label steps 2–4 — wizard chrome + save', async ({ page }) => {
    const res = await page.goto(
      '/brand/production/workshop2/c/SS27/a/demo-ss27-02?w2pane=tz&w2sec=material',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('workshop2-dossier-save-draft')).toBeVisible({
      timeout: 60_000,
    });
    const compositionPanel = page.getByTestId('workshop2-dossier-composition-label-panel');
    await compositionPanel.scrollIntoViewIfNeeded();
    await expect(compositionPanel).toBeVisible({ timeout: 60_000 });

    for (const stepName of [
      /Состав волокон и уход/,
      /Печать и данные на бирке/,
      /Оформление, черновик и макет/,
    ]) {
      const stepBtn = compositionPanel.getByRole('button', { name: stepName });
      await stepBtn.scrollIntoViewIfNeeded();
      await stepBtn.click({ force: true });
    }
    await expect(
      compositionPanel.getByTestId('workshop2-dossier-composition-care-supplement')
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      compositionPanel.getByTestId('workshop2-dossier-composition-label-size')
    ).toBeVisible({ timeout: 15_000 });
    const draftManual = compositionPanel.getByTestId('workshop2-dossier-composition-draft-manual');
    await expect(draftManual).toBeVisible({ timeout: 15_000 });
    await draftManual.fill(`e2e-draft-${Date.now()}`, { force: true });

    const saveBtn = page.getByTestId('workshop2-dossier-save-draft');
    await saveBtn.scrollIntoViewIfNeeded();
    await expect(saveBtn).toBeEnabled({ timeout: 15_000 });
    await saveBtn.click();
    await expect(saveBtn).toBeVisible({ timeout: 15_000 });
  });

  test('W2: UI composition fiber constructor — chrome + save', async ({ page }) => {
    const res = await page.goto(
      '/brand/production/workshop2/c/SS27/a/demo-ss27-02?w2pane=tz&w2sec=material',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('workshop2-dossier-save-draft')).toBeVisible({
      timeout: 60_000,
    });
    const compositionPanel = page.getByTestId('workshop2-dossier-composition-label-panel');
    await compositionPanel.scrollIntoViewIfNeeded();
    const step2Btn = compositionPanel.getByRole('button', { name: /Состав волокон и уход/ });
    await step2Btn.scrollIntoViewIfNeeded();
    await step2Btn.click({ force: true });
    await expect(
      compositionPanel.getByTestId('workshop2-dossier-composition-fiber-id-0')
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      compositionPanel.getByTestId('workshop2-dossier-composition-fiber-percent-0')
    ).toBeVisible({ timeout: 15_000 });

    const dossierPut = page.waitForResponse(
      (r) =>
        r.request().method() === 'PUT' &&
        r.url().includes('/api/workshop2/articles/SS27/demo-ss27-02/dossier'),
      { timeout: 90_000 }
    );
    await page.getByTestId('workshop2-dossier-save-draft').click();
    const putRes = await dossierPut;
    expect(putRes.ok()).toBeTruthy();
  });

  test('W2: API dossier round-trip compositionLabelSpec steps 2–4', async ({ request }) => {
    const getRes = await request.get('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
    });
    expect(getRes.ok()).toBeTruthy();
    const body = (await getRes.json()) as {
      ok?: boolean;
      dossier?: { compositionLabelSpec?: Record<string, unknown> };
      version?: number;
    };
    expect(body.ok).toBe(true);
    const ts = Date.now();
    const patch = {
      careInstructionsSupplement: `e2e-api-care-${ts}`,
      labelGarmentSizeText: `e2e-api-size-${ts}`,
      draftTextManual: `e2e-api-draft-${ts}`,
    };
    const putRes = await request.put('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
      data: {
        dossier: {
          ...body.dossier,
          compositionLabelSpec: {
            ...(body.dossier?.compositionLabelSpec ?? {}),
            ...patch,
          },
        },
        baseVersion: body.version,
      },
    });
    expect(putRes.ok()).toBeTruthy();
    const get2 = await request.get('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
    });
    const body2 = (await get2.json()) as {
      dossier?: {
        compositionLabelSpec?: {
          careInstructionsSupplement?: string;
          labelGarmentSizeText?: string;
          draftTextManual?: string;
        };
      };
    };
    const spec = body2.dossier?.compositionLabelSpec;
    expect(spec?.careInstructionsSupplement).toBe(patch.careInstructionsSupplement);
    expect(spec?.labelGarmentSizeText).toBe(patch.labelGarmentSizeText);
    expect(spec?.draftTextManual).toBe(patch.draftTextManual);
  });

  test('W2: API dossier round-trip passportProductionBrief (3 поля)', async ({ request }) => {
    const getRes = await request.get('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
    });
    expect(getRes.ok()).toBeTruthy();
    const body = (await getRes.json()) as {
      ok?: boolean;
      dossier?: {
        passportProductionBrief?: {
          plannedLaunchCustomNote?: string;
          packagingAndLabelingNote?: string;
          weightAndDimensionsNote?: string;
        };
      };
      version?: number;
    };
    expect(body.ok).toBe(true);
    const ts = Date.now();
    const notes = {
      plannedLaunchCustomNote: `e2e-launch-${ts}`,
      packagingAndLabelingNote: `e2e-pack-${ts}`,
      weightAndDimensionsNote: `e2e-wgt-${ts}`,
    };
    const putRes = await request.put('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
      data: {
        dossier: {
          ...body.dossier,
          passportProductionBrief: {
            ...(body.dossier?.passportProductionBrief ?? {}),
            ...notes,
          },
        },
        baseVersion: body.version,
      },
    });
    expect(putRes.ok()).toBeTruthy();
    const get2 = await request.get('/api/workshop2/articles/SS27/demo-ss27-02/dossier', {
      headers: W2_DEV_HEADERS,
    });
    const body2 = (await get2.json()) as {
      dossier?: { passportProductionBrief?: typeof notes };
    };
    expect(body2.dossier?.passportProductionBrief?.plannedLaunchCustomNote).toBe(
      notes.plannedLaunchCustomNote
    );
    expect(body2.dossier?.passportProductionBrief?.packagingAndLabelingNote).toBe(
      notes.packagingAndLabelingNote
    );
    expect(body2.dossier?.passportProductionBrief?.weightAndDimensionsNote).toBe(
      notes.weightAndDimensionsNote
    );
  });

  test('W2: отправить ТЗ в чат артикула', async ({ page }) => {
    const res = await page.goto(
      '/brand/production/workshop2/c/SS27/a/demo-ss27-02?w2sec=general',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    const attachBtn = page.getByTestId('brand-w2-tz-attach-chat-btn');
    await expect(attachBtn).toBeVisible({ timeout: 60_000 });
    const attachPost = page.waitForResponse(
      (r) =>
        r.request().method() === 'POST' &&
        r.url().includes('/api/workshop2/articles/SS27/demo-ss27-02/attach-tz-to-chat'),
      { timeout: 30_000 }
    );
    await attachBtn.click();
    const postRes = await attachPost;
    expect(postRes.ok()).toBeTruthy();
    const attachJson = (await postRes.json()) as { ok?: boolean; attachmentUrl?: string };
    expect(attachJson.ok).toBeTruthy();
    expect(attachJson.attachmentUrl).toContain('export-tz-bundle');
  });

  test('W2: ссылка бренд → досье цеха с артикула', async ({ page }) => {
    const articleId = 'demo-ss27-02';
    const res = await page.goto(
      `/brand/production/workshop2/c/SS27/a/${articleId}?w2sec=general`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    const brandDossierChat = page.getByTestId('brand-dossier-article-chat-link');
    await expect(brandDossierChat).toBeVisible({ timeout: 60_000 });
    await expect(brandDossierChat).toHaveAttribute(
      'href',
      new RegExp(
        `/brand/messages\\?contextType=workshop2_article&contextId=SS27%3A${articleId}`
      )
    );
    const peer = page.getByTestId('platform-core-workspace-peer');
    await expect(peer).toBeVisible({ timeout: 60_000 });
    await expect(peer).toHaveAttribute('href', new RegExp(`/factory/production/dossier/${articleId}`));
    const peerHref = await peer.getAttribute('href');
    expect(peerHref).toBeTruthy();
    const peerRes = await page.goto(peerHref!, GOTO);
    expect(peerRes?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(new RegExp(`/factory/production/dossier/${articleId}`), {
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('mfr-dev-dossier-panel')
        .or(page.getByTestId('factory-dossier-core-chrome'))
    ).toBeVisible({
      timeout: 30_000,
    });
    const dossierChat = page
      .getByTestId('mfr-dev-dossier-article-chat-link')
      .or(page.getByTestId('factory-dossier-article-chat-link'));
    await expect(dossierChat).toBeVisible({ timeout: 30_000 });
    await expect(dossierChat).toHaveAttribute(
      'href',
      new RegExp(
        `/factory/messages\\?contextType=workshop2_article&contextId=SS27%3A${articleId}`
      )
    );
  });

  test('SS27: range planner — бюджеты из PostgreSQL (не partial)', async ({ page, request }) => {
    const res = await page.goto('/brand/range-planner?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page.getByTestId('brand-dev-range-panel').or(page.getByTestId('range-planner-core'))
    ).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-dev-range-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('range-planner-core-pg-badge')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('range-planner-core-demo-notice')).toHaveCount(0);
    await expect(page.getByTestId('range-planner-core-pg-article-count')).toContainText(
      'артикул',
      { timeout: 30_000 }
    );
    await expect(page.getByTestId('range-planner-tier-margin-input-core')).toBeVisible({
      timeout: 30_000,
    });
    const patchRes = await request.patch('/api/workshop2/collections/SS27/range-planner', {
      headers: W2_DEV_HEADERS,
      data: { tier: 'core', budget: 1_200_000, targetMargin: 58 },
    });
    expect(patchRes.ok()).toBeTruthy();
    const patchJson = (await patchRes.json()) as { ok?: boolean };
    expect(patchJson.ok).toBe(true);
  });

  test('cross-role: linesheets → checkout магазина', async ({ page }) => {
    test.setTimeout(120_000);
    const res = await page.goto('/brand/linesheets?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const checkoutLink = page
      .getByTestId('brand-sc-linesheets-shop-checkout-link')
      .or(page.getByTestId('brand-linesheet-to-shop-checkout'));
    await expect(checkoutLink).toBeVisible({ timeout: 30_000 });
    await expect(checkoutLink).toHaveAttribute('href', /\/shop\/b2b\/checkout\?collection=SS27/);
    const checkoutNav = page.waitForURL(/\/shop\/b2b\/checkout/, { timeout: 90_000 });
    await checkoutLink.click();
    await checkoutNav;
    await expect(
      page
        .getByTestId('shop-co-checkout-form')
        .or(page.getByTestId('shop-b2b-checkout-form'))
    ).toBeVisible({ timeout: 60_000 });
  });

  test('hub: матрица + компактные блоки ролей', async ({ page }) => {
    const res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-role-blocks')).toBeVisible();
    await expect(page.getByTestId('role-block-brand')).toBeVisible();
    await expect(page.getByTestId('hub-pillar-development')).toHaveCount(0);
    await page.getByTestId('role-block-brand').click();
    await expect(page.getByTestId('platform-core-business-overview')).toBeVisible();
    await expect(page.getByTestId('hub-pillar-development')).toBeVisible();
  });

  test('hub: матрица оценки → W2, showroom, досье, чат', async ({ page }) => {
    let res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('readiness-score-brand-development')).toBeVisible({
      timeout: 30_000,
    });
    await openReadinessWorkspaceFromScore(page, 'brand', 'development');
    await expect(page).toHaveURL(/w2col=SS27/, { timeout: 30_000 });

    res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await openReadinessWorkspaceFromScore(page, 'shop', 'sample_collection');
    await expect(page).toHaveURL(/\/shop\/b2b\/showroom/, { timeout: 30_000 });
    await expect(page.getByTestId('platform-core-list-chrome')).toBeVisible({
      timeout: 30_000,
    });

    res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await clickReadinessScoreExpand(page, 'manufacturer', 'order_production');
    await page.getByTestId('readiness-sub-manufacturer-order_production-2').click();
    await expect(page).toHaveURL(/\/factory\/production\/dossier\/demo-ss27-01/, {
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('mfr-dev-dossier-panel')
        .or(page.getByTestId('factory-dossier-core-chrome'))
    ).toBeVisible({
      timeout: 30_000,
    });

    res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await clickReadinessScoreExpand(page, 'brand', 'comms');
    await page.getByTestId('readiness-sub-brand-comms-0').click();
    await expect(page).toHaveURL(/\/brand\/messages.*B2B-DEMO-SHOP1-SS27/, {
      timeout: 30_000,
    });
    await expectWorkspacePillarStrip(page, page);
  });

  test('hub: role-block → столпы роли', async ({ page }) => {
    let res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await page.getByTestId('role-block-brand').click();
    await page.getByTestId('hub-pillar-sample_collection').getByRole('link').click();
    await expect(page).toHaveURL(/\/brand\/linesheets/, { timeout: 30_000 });

    res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await openReadinessWorkspaceFromScore(page, 'brand', 'development');
    await expect(page).toHaveURL(/w2col=SS27/, { timeout: 30_000 });

    res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await openReadinessWorkspaceFromScore(page, 'shop', 'sample_collection');
    await expect(page).toHaveURL(/\/shop\/b2b\/showroom/, { timeout: 30_000 });

    res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await page.getByTestId('role-block-shop').click();
    await page.getByTestId('hub-pillar-sample_collection').getByRole('link').click();
    await expect(page).toHaveURL(/\/shop\/b2b\/showroom/, { timeout: 30_000 });

    res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await page.getByTestId('role-block-shop').click();
    await page.getByTestId('hub-pillar-comms').getByRole('link').click();
    await expect(page).toHaveURL(/\/shop\/messages/, { timeout: 30_000 });
    await expectWorkspacePillarStrip(page, page);
  });

  test('hub: матрица → заказ, досье, handoff', async ({ page }) => {
    test.setTimeout(180_000);
    let res = await gotoPlatformHubAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const shopCoScore = page.getByTestId('readiness-score-shop-collection_order');
    await expect(shopCoScore).toBeVisible({ timeout: 30_000 });
    await shopCoScore.click();
    const shopOrderSub = page.getByTestId('readiness-sub-shop-collection_order-3');
    await expect(shopOrderSub).toBeVisible({ timeout: 30_000 });
    await shopOrderSub.click();
    await expect(page).toHaveURL(/\/shop\/b2b\/orders\/B2B-DEMO-SHOP1-SS27/, {
      timeout: 45_000,
    });
    await expect(page.getByTestId('platform-core-order-detail-chrome')).toBeVisible({
      timeout: 30_000,
    });

    res = await gotoPlatformHubAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const mfrDevScore = page.getByTestId('readiness-score-manufacturer-development');
    await expect(mfrDevScore).toBeVisible({ timeout: 30_000 });
    await openReadinessWorkspaceFromScore(page, 'manufacturer', 'development');
    await expect(page).toHaveURL(/\/factory\/production\/dossier\/demo-ss27-01/, {
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('mfr-dev-dossier-panel')
        .or(page.getByTestId('factory-dossier-core-chrome'))
    ).toBeVisible({
      timeout: 30_000,
    });

    res = await gotoPlatformHubAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const mfrOpScore = page.getByTestId('readiness-score-manufacturer-order_production');
    await expect(mfrOpScore).toBeVisible({ timeout: 30_000 });
    await openReadinessWorkspaceFromScore(page, 'manufacturer', 'order_production');
    await expect(page).toHaveURL(/\/factory\/production/, { timeout: 45_000 });
    await expect(page.getByTestId('platform-core-list-chrome').first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test('реестры заказов: list chrome (столпы 2–3 + 5)', async ({ page }) => {
    let res = await page.goto('/shop/b2b/orders', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const shopList = page.getByTestId('platform-core-list-chrome');
    await expect(shopList).toBeVisible({ timeout: 30_000 });
    await expect(shopList.getByTestId('platform-core-context-bar')).toBeVisible();
    await expectWorkspacePillarStrip(page, shopList);
    await expect(shopList.getByTestId('role-pillar-link-collection_order')).toBeVisible();
    await expect(shopList.getByTestId('platform-core-context-entity')).toContainText('Оптовый заказ');
    await expect(page.getByTestId('shop-b2b-order-row-B2B-DEMO-SHOP1-SS27')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-b2b-order-tracking-B2B-DEMO-SHOP1-SS27')).toBeVisible({
      timeout: 15_000,
    });

    res = await page.goto('/shop/b2b/orders?pillar=order_production&filter=in_production', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-registry-production-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('shop-op-registry-filter-in-production')
        .or(page.getByTestId('shop-b2b-filter-in-production'))
    ).toBeVisible();

    res = await page.goto(
      '/shop/b2b/orders?pillar=order_production&filter=in_production&order=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('shop-op-registry-focus-row')
        .or(page.getByTestId('shop-co-registry-focus-row'))
    ).toBeVisible({ timeout: 30_000 });

    res = await page.goto('/brand/b2b-orders', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const brandList = page.getByTestId('platform-core-list-chrome');
    await expect(brandList).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, brandList);
    await expect(page.getByTestId('brand-co-registry-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-co-registry-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-co-registry-invite-generate')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-co-registry-production-link')).toHaveAttribute(
      'href',
      /pillar=order_production.*filter=in_production|filter=in_production.*pillar=order_production/
    );
    await expect(page.getByTestId('brand-b2b-order-row-B2B-DEMO-SHOP1-SS27')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('brand-b2b-order-handoff-B2B-DEMO-SHOP1-SS27')
        .or(page.getByTestId('brand-b2b-order-tracking-B2B-DEMO-SHOP1-SS27'))
    ).toBeVisible({ timeout: 15_000 });

    res = await page.goto(
      '/brand/b2b-orders?pillar=order_production&filter=awaiting_handoff',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-op-registry-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-registry-production-context-strip')).toBeVisible({
      timeout: 30_000,
    });

    res = await page.goto(
      '/brand/b2b-orders?pillar=order_production&filter=in_production&order=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('brand-op-registry-focus-row')
        .or(page.getByTestId('brand-co-registry-focus-row'))
    ).toBeVisible({ timeout: 30_000 });

    res = await page.goto('/shop/b2b/orders', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-registry-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-co-registry-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-co-registry-matrix-link')).toHaveAttribute(
      'href',
      /collection=SS27/
    );
    await expect(page.getByTestId('shop-co-registry-tracking-link')).toHaveAttribute(
      'href',
      /\/shop\/b2b\/tracking/
    );
    await expect(page.getByTestId('shop-b2b-order-row-B2B-DEMO-SHOP1-SS27')).toBeVisible({
      timeout: 30_000,
    });
    const shopOrderId = 'B2B-DEMO-SHOP1-SS27';
    res = await page.goto(`/shop/b2b/orders/${encodeURIComponent(shopOrderId)}`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-detail-chat-link')).toBeVisible({ timeout: 30_000 });
    const shopChatHref = await page.getByTestId('shop-co-detail-chat-link').getAttribute('href');
    expect(shopChatHref).toContain(shopOrderId);
    res = await page.goto(shopChatHref!, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/contextType=b2b_order.*B2B-DEMO-SHOP1-SS27/, {
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-cm-banner')).toBeVisible({ timeout: 30_000 });

    res = await page.goto(`/brand/b2b-orders/${encodeURIComponent(shopOrderId)}`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-co-detail-chat-link')).toBeVisible({ timeout: 30_000 });
    const brandChatHref = await page.getByTestId('brand-co-detail-chat-link').getAttribute('href');
    expect(brandChatHref).toContain(shopOrderId);
    res = await page.goto(brandChatHref!, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/contextType=b2b_order.*B2B-DEMO-SHOP1-SS27/, {
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-cm-banner')).toBeVisible({ timeout: 30_000 });

    res = await page.goto('/shop/b2b/tracking', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-list-chrome')).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('shop-op-tracking-row-B2B-DEMO-SHOP1-SS27')
        .or(page.getByTestId('platform-core-tracking-B2B-DEMO-SHOP1-SS27'))
    ).toBeVisible({
      timeout: 30_000,
    });
    const reserveBadge = page.getByTestId('platform-core-tracking-reserve-B2B-DEMO-SHOP1-SS27');
    await expect(reserveBadge).toBeVisible({ timeout: 30_000 });
    await expect(reserveBadge).toContainText(
      /Резерв (на складе|ожидается)|WMS.*выключен|резерв недоступен/i
    );
    const trackingCalendar = page
      .getByTestId('shop-op-tracking-calendar-link-B2B-DEMO-SHOP1-SS27')
      .or(page.getByTestId('platform-core-tracking-calendar-B2B-DEMO-SHOP1-SS27'));
    await expect(trackingCalendar).toBeVisible({ timeout: 30_000 });
    await expect(trackingCalendar).toHaveAttribute('href', /b2b\/calendar.*order=B2B-DEMO-SHOP1-SS27/);
  });

  test('cross-role: переход между ролями через полосу столпов', async ({ page }) => {
    let res = await page.goto('/brand/core?pillar=collection_order', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-pillar-primary-cta')).toBeVisible({
      timeout: 30_000,
    });
    await clickCabinetPillar(page, 'sample_collection');
    await expect(page).toHaveURL(/pillar=sample_collection/, { timeout: 30_000 });
    await page.getByTestId('role-pillar-primary-cta').click();
    await expect(page).toHaveURL(/\/brand\/linesheets/, { timeout: 30_000 });

    res = await page.goto('/shop/core?pillar=collection_order', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('shop-co-cabinet-panel')
        .or(page.getByTestId('collection-order-pillar-card'))
    ).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId('role-pillar-primary-cta').click();
    await expect(page).toHaveURL(/\/shop\/b2b\/matrix/, { timeout: 30_000 });
    await expect(page.getByTestId('platform-core-list-chrome')).toBeVisible({
      timeout: 30_000,
    });

    res = await page.goto('/shop/b2b/orders', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await page.getByTestId('role-pillar-link-collection_order').click();
    await expect(page).toHaveURL(/\/shop\/b2b\/matrix/, { timeout: 30_000 });

    res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('readiness-score-manufacturer-order_production')).toBeVisible({
      timeout: 30_000,
    });
    await openReadinessWorkspaceFromScore(page, 'manufacturer', 'order_production');
    await expect(page).toHaveURL(/\/factory\/production/, { timeout: 30_000 });
  });

  test('hub: матрица → matrix и W2 из разделов', async ({ page }) => {
    let res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await clickReadinessScoreExpand(page, 'shop', 'collection_order');
    await page.getByTestId('readiness-sub-shop-collection_order-0').click();
    await expect(page).toHaveURL(/\/shop\/b2b\/matrix/, { timeout: 30_000 });
    await expect(page.getByTestId('platform-core-list-chrome')).toBeVisible({
      timeout: 30_000,
    });

    res = await gotoPlatformPageAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await openReadinessWorkspaceFromScore(page, 'brand', 'development');
    await expect(page).toHaveURL(/w2col=SS27/, { timeout: 30_000 });
  });

  test('личные кабинеты: навигация столпов слева + контент справа', async ({ page }) => {
    test.setTimeout(360_000);
    await page.setViewportSize({ width: 393, height: 812 });
    let res = await gotoRoleCoreCabinet(page, '/brand/core?collection=SS27');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-brand')).toBeVisible({ timeout: 30_000 });
    await expectCabinetPillarNav(page);
    await expect(page.getByTestId('role-core-pillar-nav-horizontal')).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });

    const GOTO_HEAVY = { waitUntil: 'domcontentloaded' as const, timeout: 120_000 };
    res = await page.goto('/brand/core', GOTO_HEAVY);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-brand')).toBeVisible({ timeout: 30_000 });
    await expectCabinetPillarNav(page);
    await expect(page.getByTestId('platform-core-context-bar')).toBeVisible();
    await expect(page.getByTestId('platform-core-context-entity')).toContainText('Разработка');
    await page.getByTestId('platform-core-context-entity').click();
    await expect(page).toHaveURL(/w2col=SS27/, { timeout: 30_000 });
    res = await page.goto('/brand/core', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-brand')).toBeVisible({ timeout: 30_000 });
    await expectCabinetPillarNav(page);
    await expect(page.getByTestId('role-core-pillar-panel')).toBeVisible();
    await clickCabinetPillar(page, 'sample_collection');
    await expect(page.getByTestId('role-pillar-primary-cta')).toBeVisible({
      timeout: 30_000,
    });
    await clickCabinetPrimaryCta(page);
    await expect(page).toHaveURL(/\/brand\/linesheets/, { timeout: 30_000 });
    res = await gotoRoleCoreCabinet(page, '/brand/core?pillar=order_production&collection=SS27');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await clickCabinetPrimaryCta(page);

    res = await page.goto('/shop/core', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-shop')).toBeVisible({ timeout: 30_000 });
    await expectCabinetPillarNav(page);
    await expect(page.getByTestId('role-pillar-development')).toHaveCount(0);
    res = await page.goto('/shop/core?pillar=development', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/pillar=sample_collection/, { timeout: 30_000 });
    res = await page.goto('/shop/core?pillar=sample_collection', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const showroomMini = page
      .getByTestId('shop-sc-cabinet-panel')
      .or(page.getByTestId('shop-showroom-mini'));
    await expect(showroomMini).toBeVisible({ timeout: 30_000 });
    await expect(showroomMini).toContainText('Витрина коллекции', { timeout: 30_000 });
    await expect(showroomMini).not.toContainText('Загрузка…', { timeout: 90_000 });
    const partnerRow = showroomMini
      .getByTestId('shop-sc-cabinet-partner')
      .or(showroomMini.getByTestId('shop-showroom-mini-partner'));
    await expect(partnerRow).toBeVisible({ timeout: 90_000 });
    await expect(showroomMini).toContainText(/\d+ арт\./, { timeout: 30_000 });
    if (await partnerRow.isVisible().catch(() => false)) {
      await expect(
        showroomMini
          .getByTestId('shop-sc-cabinet-partner-logo')
          .or(showroomMini.getByTestId('shop-showroom-mini-partner-logo'))
      ).toBeVisible();
    }
    await clickCabinetPrimaryCta(page);
    await expect(page).toHaveURL(/\/shop\/b2b\/showroom/, { timeout: 30_000 });

    for (let attempt = 0; attempt < 2; attempt++) {
      res = await page.goto('/factory/production/core', GOTO_HEAVY);
      if ((res?.status() ?? 599) < 500) break;
    }
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-manufacturer')).toBeVisible({
      timeout: 30_000,
    });
    await clickCabinetPillar(page, 'order_production');
    await expect(
      page
        .getByTestId('mfr-op-cabinet-panel')
        .or(page.getByTestId('order-production-pillar-card'))
    ).toBeVisible({
      timeout: 30_000,
    });
    await clickCabinetPrimaryCta(page);

    await expect(page.getByTestId('role-pillar-collection_order')).toHaveCount(0);
    await expect(page.getByTestId('role-pillar-sample_collection')).toHaveCount(0);
    res = await page.goto('/factory/production/core?pillar=collection_order', GOTO_HEAVY);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/pillar=development/, { timeout: 60_000 });
    res = await page.goto('/factory/production/core?pillar=sample_collection', GOTO_HEAVY);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/pillar=development/, { timeout: 30_000 });

    res = await gotoRoleCoreCabinet(page, '/factory/supplier/core?pillar=order_production');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-supplier')).toBeVisible({
      timeout: 60_000,
    });
    await page.getByTestId('role-pillar-primary-cta').click();
    await expect(page).toHaveURL(/\/factory\/production\/materials/, { timeout: 30_000 });
  });

  test('досье цеха: столп 4 на dossier/demo-ss27-01', async ({ page }) => {
    const res = await page.goto('/factory/production/dossier/demo-ss27-01', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('mfr-dev-dossier-panel')
        .or(page.getByTestId('factory-dossier-core-chrome'))
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('platform-core-context-bar')).toBeVisible();
    await expect(page.getByTestId('platform-core-context-entity')).toContainText('demo-ss27-01');
    await expectWorkspacePillarStrip(page, page);
    await expect(page.getByTestId('role-pillar-link-development')).toBeVisible();
    const skuStrip = page.getByTestId('factory-dossier-export-sku');
    await expect(skuStrip).toBeVisible({ timeout: 30_000 });
    await expect(skuStrip).toContainText('SKU в экспорте ТЗ:');
    await expect(skuStrip).not.toContainText('Тестовое изделие');
  });

  test('цех: cross-role development → бренд W2', async ({ page }) => {
    const res = await page.goto('/factory/production/core?pillar=development&collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const brandPeer = page.getByTestId('cross-role-demo-brand-development');
    await expect(brandPeer).toBeVisible({ timeout: 30_000 });
    await brandPeer.click();
    await expect(page).toHaveURL(/\/brand\/production\/workshop2.*w2col=SS27/, {
      timeout: 30_000,
    });
  });

  test('производство: навигация столпов на хабе', async ({ page }) => {
    const res = await page.goto('/factory/production', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const productionChrome = page.getByTestId('platform-core-list-chrome').first();
    await expect(productionChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, productionChrome);
    await expect(productionChrome.getByTestId('role-pillar-link-order_production')).toBeVisible();
  });

  test('поставщик: закупка + кабинет', async ({ page }) => {
    let res = await page.goto('/factory/supplier/core?pillar=order_production', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const supplierCabinet = page.getByTestId('role-core-cabinet-supplier');
    await expect(supplierCabinet).toBeVisible({ timeout: 30_000 });
    await expectCabinetPillarNav(page, supplierCabinet);
    await expect(cabinetPillarButton(page, 'order_production', supplierCabinet)).toBeVisible();
    await expect(
      page
        .getByTestId('sup-op-cabinet-panel')
        .or(page.getByTestId('supplier-procurement-pillar-card'))
    ).toBeVisible({
      timeout: 30_000,
    });
  });

  test('поставщик: BOM справочник (development)', async ({ page }) => {
    const devUrl =
      '/factory/production/materials?collection=SS27&article=demo-ss27-01&view=development';
    const res = await page.goto(devUrl, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('factory-materials-core')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('materials-supplier-reference')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('materials-bom-fill-rate')).toBeVisible();
    const priceJournal = page.getByTestId('materials-price-journal');
    const priceSnapshot = page.getByTestId('materials-price-history');
    const priceEmpty = page.getByTestId('materials-price-history-empty');
    const priceLoading = page.getByTestId('materials-price-journal-loading');
    await expect(
      priceJournal.or(priceSnapshot).or(priceEmpty).or(priceLoading)
    ).toBeVisible({ timeout: 30_000 });
  });

  test('поставщик: закупка — PATCH material-request (подтверждение поставки)', async ({
    page,
  }) => {
    const procurementUrl =
      '/factory/production/materials?collection=SS27&article=demo-ss27-01&view=procurement&po=PO-B2B-B2B-DEMO-SHOP1-SS27&order=B2B-DEMO-SHOP1-SS27&role=supplier';
    let res = await page.goto(procurementUrl, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('materials-procurement-view')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('materials-procurement-handoff-ready')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('materials-procurement-chain-badge')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('materials-procurement-chat-link')).toHaveCount(0);
    await expect(page.getByTestId('sup-op-procurement-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    const confirmBtn = page
      .getByTestId('sup-op-procurement-bulk-confirm')
      .or(page.getByTestId('materials-procurement-bulk-confirm'));
    const idempotentBadge = page
      .getByTestId('sup-op-procurement-idempotent-badge')
      .or(page.getByTestId('materials-procurement-idempotent-badge'));
    let confirmedDuringTest = false;
    if ((await idempotentBadge.count()) > 0) {
      await expect(idempotentBadge).toBeVisible({ timeout: 30_000 });
      await expect(confirmBtn).toBeDisabled();
      await expect(confirmBtn).toContainText('Поставка подтверждена');
    } else {
      await expect(confirmBtn).toBeEnabled({ timeout: 30_000 });
      const bulkWait = page.waitForResponse(
        (r) =>
          r.url().includes('/api/workshop2/supplier/material-request/bulk-confirm') &&
          r.request().method() === 'POST',
        { timeout: 60_000 }
      );
      await confirmBtn.click();
      const bulkRes = await bulkWait;
      expect(bulkRes.ok()).toBeTruthy();
      const bulkJson = (await bulkRes.json()) as { confirmed?: number };
      confirmedDuringTest = (bulkJson.confirmed ?? 0) > 0;
      await expect(confirmBtn).toContainText('Поставка подтверждена', { timeout: 30_000 });

      res = await page.goto(procurementUrl, GOTO);
      expect(res?.status() ?? 599).toBeLessThan(500);
      await expect(
        page
          .getByTestId('sup-op-procurement-idempotent-badge')
          .or(page.getByTestId('materials-procurement-idempotent-badge'))
      ).toBeVisible({
        timeout: 30_000,
      });
      await expect(
        page
          .getByTestId('sup-op-procurement-bulk-confirm')
          .or(page.getByTestId('materials-procurement-bulk-confirm'))
      ).toBeDisabled();
      await expect(page.getByTestId('sup-op-procurement-success-strip')).toBeVisible({
        timeout: 15_000,
      });
    }

    res = await page.goto('/shop/b2b/tracking', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const demoTracking = page
      .getByTestId('shop-op-tracking-row-B2B-DEMO-SHOP1-SS27')
      .or(page.getByTestId('platform-core-tracking-B2B-DEMO-SHOP1-SS27'));
    await expect(demoTracking).toBeVisible({ timeout: 60_000 });
    await expect(demoTracking.getByText('Поставщик подтвердил поставку материалов')).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page
        .getByTestId('shop-op-tracking-materials-badge-B2B-DEMO-SHOP1-SS27')
        .or(page.getByTestId('platform-core-tracking-materials-B2B-DEMO-SHOP1-SS27'))
    ).toBeVisible({ timeout: 30_000 });

    if (confirmedDuringTest) {
      res = await page.goto(
        '/brand/messages?contextType=b2b_order&contextId=B2B-DEMO-SHOP1-SS27',
        GOTO
      );
      expect(res?.status() ?? 599).toBeLessThan(500);
      await expect(
        page.getByText(/Поставщик подтвердил материалы по артикулу/).first()
      ).toBeVisible({
        timeout: 60_000,
      });
    }

    res = await page.goto('/factory/production/core?pillar=order_production', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const manufacturerCard = page
      .getByTestId('mfr-op-cabinet-panel')
      .or(page.getByTestId('order-production-pillar-card'));
    await expect(manufacturerCard).toBeVisible({ timeout: 60_000 });
    const manufacturerMaterialsStep = manufacturerCard.getByTestId(
      'platform-core-chain-step-materials_supplied'
    );
    await expect(manufacturerMaterialsStep).toBeVisible({ timeout: 60_000 });
    await expect(manufacturerMaterialsStep).toHaveAttribute('data-done', 'true', {
      timeout: 60_000,
    });

    res = await gotoRoleCoreCabinet(page, '/factory/supplier/core?pillar=order_production');
    expect(res?.status() ?? 599).toBeLessThan(500);
    const supplierSteps = page.getByTestId('sup-op-chain-steps');
    await expect(supplierSteps).toBeVisible({ timeout: 60_000 });
    const supplierMaterialsStep = supplierSteps.getByTestId(
      'platform-core-chain-step-materials_supplied'
    );
    await expect(supplierMaterialsStep).toBeVisible({ timeout: 60_000 });
    await expect(supplierMaterialsStep).toHaveAttribute('data-done', 'true', {
      timeout: 60_000,
    });
  });

  test('столп 2: образец → коллекция (linesheets + showroom)', async ({ page }) => {
    let res = await page.goto('/brand/linesheets', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const brandLinesheets = page.getByTestId('platform-core-list-chrome');
    await expect(brandLinesheets).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, brandLinesheets);
    await expect(brandLinesheets.getByTestId('platform-core-context-entity')).toContainText(
      'Весна–лето 2027'
    );
    await expect(brandLinesheets.getByTestId('role-pillar-link-sample_collection')).toBeVisible();

    res = await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-list-chrome')).toBeVisible({
      timeout: 30_000,
    });

    res = await page.goto('/brand/showroom', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const brandShowroom = page.getByTestId('platform-core-list-chrome');
    await expect(brandShowroom).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, brandShowroom);

    res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const shopShowroom = page.getByTestId('platform-core-list-chrome');
    await expect(shopShowroom).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, shopShowroom);
    await expect(
      page
        .getByTestId('shop-sc-showroom-collection-chip')
        .or(page.getByTestId('shop-showroom-core-collection'))
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(shopShowroom.getByTestId('platform-core-context-entity')).toContainText(
      'Весна–лето 2027'
    );
  });

  test('столп 3: matrix → retailers → linesheets', async ({ page }) => {
    let res = await page.goto('/shop/b2b/orders', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expectWorkspacePillarStrip(page, page);

    res = await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const matrixChrome = page.getByTestId('platform-core-list-chrome');
    await expect(matrixChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, matrixChrome);
    await expectWorkspacePillarStrip(page, matrixChrome);
    await expect(matrixChrome.getByTestId('platform-core-context-entity')).toContainText(
      'Оптовый заказ'
    );
    
    await expect(page.getByText(/Матрица заказа · SS27/)).toBeVisible({ timeout: 30_000 });

    res = await page.goto('/brand/retailers', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const retailersChrome = page.getByTestId('platform-core-list-chrome');
    await expect(retailersChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, retailersChrome);
    await expectWorkspacePillarStrip(page, retailersChrome);
    await expect(page.getByRole('tab', { name: 'Ритейлеры' })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('retailer-w2-badge-shop1')).toBeVisible({ timeout: 30_000 });

    res = await page.goto('/brand/b2b-orders', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expectWorkspacePillarStrip(page, page);
    await expectWorkspacePillarStrip(page, page);

    res = await page.goto('/brand/linesheets', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const linesheetsChrome = page.getByTestId('platform-core-list-chrome');
    await expect(linesheetsChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, linesheetsChrome);
    await expect(linesheetsChrome.getByTestId('platform-core-context-entity')).toContainText(
      'Весна–лето 2027'
    );
    await expect(
      page
        .getByTestId('brand-sc-linesheets-list')
        .or(page.getByTestId('brand-linesheets-core-list'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-sc-linesheets-panel')).toBeVisible({ timeout: 30_000 });
  });

  test('цепочка: pillar chrome на shop и brand order detail', async ({ page, request }) => {
    const chainApi = await request.get(
      '/api/workshop2/b2b/orders/B2B-DEMO-SHOP1-SS27/chain-status'
    );
    expect(chainApi.ok()).toBeTruthy();
    const chainJson = (await chainApi.json()) as {
      ok?: boolean;
      chain?: { handedOff?: boolean };
    };
    expect(chainJson.ok).toBe(true);
    const handedOff = chainJson.chain?.handedOff === true;

    let res = await page.goto('/shop/b2b/orders/B2B-DEMO-SHOP1-SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const shopChrome = page.getByTestId('platform-core-order-detail-chrome');
    await expect(shopChrome).toBeVisible({ timeout: 30_000 });
    await expect(shopChrome.getByTestId('platform-core-context-bar')).toBeVisible();
    await expect(shopChrome.getByTestId('platform-core-context-entity')).toContainText(
      'Оптовый заказ'
    );
    await expectWorkspacePillarStrip(page, shopChrome);
    await expect(
      page
        .getByTestId('platform-core-order-facts-loading')
        .or(page.getByTestId('platform-core-b2b-order-facts'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Live from Factory')).toHaveCount(0);
    if (handedOff) {
      await expect(page.getByTestId('shop-co-detail-context-strip')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId('shop-co-detail-production-link')).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByTestId('shop-co-chain-steps')).toBeVisible({ timeout: 30_000 });

      const prodContextRes = await page.goto(
        '/shop/b2b/orders/B2B-DEMO-SHOP1-SS27?pillar=order_production',
        GOTO
      );
      expect(prodContextRes?.status() ?? 599).toBeLessThan(500);
      await expect(page.getByTestId('platform-core-order-detail-chrome')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId('platform-core-shop-chain-steps')).toBeVisible({
        timeout: 30_000,
      });
      await expect(
        page
          .getByTestId('shop-co-chain-sse-live-badge')
          .or(page.getByTestId('shop-co-chain-poll-badge'))
          .first()
      ).toBeVisible({ timeout: 30_000 });
      await expect(
        page
          .getByTestId('shop-op-order-status-po-tracking-link')
          .or(page.getByTestId('shop-order-po-tracking-link'))
      ).toBeVisible({ timeout: 15_000 });
    }

    const brandChainResponse = page.waitForResponse(
      (r) =>
        r.url().includes('/b2b/orders/B2B-DEMO-SHOP1-SS27/chain-status') && r.ok(),
      { timeout: 60_000 }
    );
    res = await page.goto('/brand/b2b-orders/B2B-DEMO-SHOP1-SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await brandChainResponse;
    const brandChrome = page.getByTestId('platform-core-order-detail-chrome');
    await expect(brandChrome).toBeVisible({ timeout: 30_000 });
    await expect(brandChrome.getByTestId('platform-core-context-bar')).toBeVisible();
    await expectWorkspacePillarStrip(page, brandChrome);
    await expect(page.getByTestId('platform-core-b2b-order-facts')).toBeVisible({
      timeout: 30_000,
    });
    const brandChainCard = page
      .getByTestId('brand-co-chain-card')
      .or(page.getByTestId('brand-co-detail-chain-card'))
      .or(page.getByTestId('brand-order-chain-status-card'));
    await expect(brandChainCard).not.toHaveAttribute('data-chain-handoff', 'loading', {
      timeout: 30_000,
    });
    await expect(brandChainCard).toHaveAttribute(
      'data-chain-handoff',
      handedOff ? 'done' : 'pending',
      { timeout: 30_000 }
    );
    await expect(page.getByTestId('brand-co-chain-chat-link')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Календарь' }).first()).toBeVisible();
  });

  test('цепочка: chain-status API (4 шага)', async ({ request }) => {
    const wmsOn = await isInternalWmsEnabled(request);

    const readChain = async () => {
      const res = await request.get(`/api/workshop2/b2b/orders/${DEMO_ORDER}/chain-status`);
    expect(res.ok()).toBeTruthy();
      return (await res.json()) as {
      ok?: boolean;
        chain?: {
          steps?: Array<{ id: string; done: boolean }>;
          handedOff?: boolean;
          inventoryReserved?: boolean;
          inventoryReservedQty?: number;
          dossierDiff?: {
            dossierVersionAtHandoff?: number;
            dossierChangedSinceHandoff?: boolean;
          };
        };
      };
    };

    let json = await readChain();
    if (wmsOn && json.chain?.handedOff && !json.chain?.inventoryReserved) {
      const confirm = await request.post(
        `/api/brand/b2b/orders/${DEMO_ORDER}/confirm-order`,
        { data: {} }
      );
      expect(confirm.ok()).toBeTruthy();
      const handoff = await request.post(
        `/api/brand/b2b/orders/${DEMO_ORDER}/confirm-production-handoff`,
        { data: {} }
      );
      expect(handoff.ok()).toBeTruthy();
      json = await readChain();
    }

    expect(json.ok).toBe(true);
    const steps = json.chain?.steps ?? [];
    expect(steps.find((s) => s.id === 'shop_sent')?.done).toBe(true);
    expect(steps.find((s) => s.id === 'brand_confirmed')?.done).toBe(true);
    expect(steps.find((s) => s.id === 'production_po')?.done).toBe(true);
    expect(json.chain?.handedOff).toBe(true);
    if (json.chain?.dossierDiff?.dossierVersionAtHandoff != null) {
      expect(json.chain.dossierDiff.dossierVersionAtHandoff).toBeGreaterThan(0);
      // Serial suite правит досье до этого теста — diff может быть true (честно).
      expect(typeof json.chain.dossierDiff.dossierChangedSinceHandoff).toBe('boolean');
    }
    const inventoryStep = steps.find((s) => s.id === 'inventory_reserved');
    expect(inventoryStep).toBeTruthy();
    if (wmsOn) {
      expect(json.chain?.inventoryReserved).toBe(true);
      expect(inventoryStep?.done).toBe(true);
    }
  });

  test('цепочка: live WMS reserve на tracking и brand chain card', async ({ request, page }) => {
    const wmsOn = await isInternalWmsEnabled(request);
    test.skip(!wmsOn, 'WORKSHOP2_INTERNAL_WMS / PG required');

    const chainRes = await request.get(`/api/workshop2/b2b/orders/${DEMO_ORDER}/chain-status`);
    expect(chainRes.ok()).toBeTruthy();
    const chainJson = (await chainRes.json()) as {
      ok?: boolean;
      chain?: { inventoryReserved?: boolean; handedOff?: boolean };
    };
    expect(chainJson.ok).toBe(true);
    expect(chainJson.chain?.handedOff).toBe(true);
    expect(chainJson.chain?.inventoryReserved).toBe(true);

    let res = await page.goto('/shop/b2b/tracking', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const reserveBadge = page.getByTestId(`platform-core-tracking-reserve-${DEMO_ORDER}`);
    await expect(reserveBadge).toBeVisible({ timeout: 60_000 });
    await expect(reserveBadge).toContainText(/Резерв на складе/);

    const chainResponse = page.waitForResponse(
      (r) => r.url().includes('/chain-status') && r.ok(),
      { timeout: 60_000 }
    );
    res = await page.goto(`/brand/b2b-orders/${DEMO_ORDER}?pillar=order_production`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await chainResponse;
    await expect(page.getByTestId('brand-op-chain-status-card').or(page.getByTestId('brand-co-chain-card'))).toBeVisible({
      timeout: 30_000,
    });
    const inventoryStep = page.getByTestId('b2b-chain-step-inventory_reserved');
    await expect(inventoryStep).toBeVisible({ timeout: 30_000 });
    await expect(inventoryStep).toHaveAttribute('data-done', 'true');
  });

  test('цепочка: B2B confirm → production handoff queue', async ({ request, page }) => {
    const confirmRes = await request.post(
      '/api/brand/b2b/orders/B2B-DEMO-SHOP1-SS27/confirm-order',
      { data: {} }
    );
    expect(confirmRes.ok()).toBeTruthy();
    const handoffRes = await request.post(
      '/api/brand/b2b/orders/B2B-DEMO-SHOP1-SS27/confirm-production-handoff',
      { data: {} }
    );
    expect(handoffRes.ok()).toBeTruthy();
    const handoffJson = (await handoffRes.json()) as {
      ok?: boolean;
      productionOrderId?: string;
      status?: string;
    };
    expect(handoffJson.ok).toBe(true);
    expect(['confirmed', 'allocated']).toContain(handoffJson.status);
    expect(handoffJson.productionOrderId).toContain('PO-B2B-');

    const queueRes = await request.get(
      '/api/workshop2/factory/production-handoff-queue?factoryId=fact-1'
    );
    expect(queueRes.ok()).toBeTruthy();
    const queueJson = (await queueRes.json()) as {
      ok?: boolean;
      items?: Array<{ b2bOrderId: string; productionOrderId: string }>;
    };
    expect(queueJson.ok).toBe(true);
    expect(
      queueJson.items?.some((i) => i.b2bOrderId === 'B2B-DEMO-SHOP1-SS27')
    ).toBe(true);

    let res = await page.goto('/factory/production', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const handoffPanel = page.getByTestId('mfr-op-handoff-queue-panel');
    await expect(handoffPanel).toBeVisible({ timeout: 30_000 });
    await expect(handoffPanel.getByTestId('mfr-op-handoff-queue-registry-link')).toBeVisible({
      timeout: 15_000,
    });
    await expect(handoffPanel.getByText(/PO-B2B-B2B-DEMO-SHOP1-SS27/)).toBeVisible({
      timeout: 30_000,
    });
    const demoHandoffStatus = handoffPanel.getByTestId(
      'mfr-op-handoff-queue-status-B2B-DEMO-SHOP1-SS27'
    );
    if (await demoHandoffStatus.isVisible().catch(() => false)) {
      await expect(demoHandoffStatus).not.toHaveText(/^pending_erp$/);
    }

    res = await page.goto('/factory/production/orders', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('factory-production-orders-core')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('factory-production-order-row-B2B-DEMO-SHOP1-SS27')).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByTestId('factory-production-order-chain-B2B-DEMO-SHOP1-SS27')
    ).toBeVisible({ timeout: 30_000 });
    const statusBadge = page.getByTestId(
      'factory-production-order-status-B2B-DEMO-SHOP1-SS27'
    );
    await expect(statusBadge).toBeVisible({ timeout: 15_000 });
    await expect(statusBadge).not.toHaveText(/^pending_erp$/);
    await expect(
      page.getByTestId('factory-production-order-procurement-B2B-DEMO-SHOP1-SS27')
    ).toBeVisible();

    res = await page.goto(
      '/factory/production/orders?order=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('factory-production-orders-order-context-strip')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('factory-production-orders-focus-row')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('factory-production-orders-focus-row')).toHaveAttribute(
      'data-order',
      'B2B-DEMO-SHOP1-SS27'
    );
  });

  test('столп 5: messages → calendar (comms pillar)', async ({ page }) => {
    test.setTimeout(360_000);
    let res = await page.goto(
      '/brand/messages?order=B2B-DEMO-SHOP1-SS27&orderId=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/order=B2B-DEMO-SHOP1-SS27/);
    const brandMessagesChrome = page.getByTestId('platform-core-list-chrome');
    await expect(brandMessagesChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, brandMessagesChrome);
    const brandOrderBanner = page.getByTestId('brand-cm-banner');
    await expect(brandOrderBanner).toHaveCount(1);
    await expect(brandOrderBanner).toBeVisible({ timeout: 30_000 });
    await expect(brandOrderBanner).toContainText('B2B-DEMO-SHOP1-SS27');

    res = await page.goto(
      '/brand/calendar?order=B2B-DEMO-SHOP1-SS27&orderId=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    const brandCalendarChrome = page.getByTestId('platform-core-list-chrome');
    await expect(brandCalendarChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, brandCalendarChrome);
    await expect(page.getByTestId('brand-cm-banner')).toBeVisible({ timeout: 30_000 });
    const brandCalendarEvent = page.getByTestId(
      'calendar-b2b-event-b2b-handoff-B2B-DEMO-SHOP1-SS27'
    );
    await expect(brandCalendarEvent).toBeVisible({ timeout: 30_000 });
    await brandCalendarEvent.click();
    await expect(page.getByTestId('calendar-event-chat-button')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('calendar-event-chat-button').click();
    await expect(page).toHaveURL(/\/brand\/messages/, { timeout: 30_000 });
    await expect(page).toHaveURL(/B2B-DEMO-SHOP1-SS27/, { timeout: 30_000 });

    res = await page.goto(
      '/shop/b2b/calendar?order=B2B-DEMO-SHOP1-SS27&orderId=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    const shopCalendarChrome = page.getByTestId('platform-core-list-chrome');
    await expect(shopCalendarChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, shopCalendarChrome);
    await expect(page.getByTestId('shop-cm-banner')).toBeVisible({ timeout: 30_000 });
    const calendarEvent = page
      .getByText(/Отгрузка по заказу|Передача в производство|Материалы подтверждены/)
      .first();
    await expect(calendarEvent).toBeVisible({ timeout: 30_000 });
    await calendarEvent.click();
    await expect(page).toHaveURL(/\/shop\/messages/, { timeout: 30_000 });
    await expect(page).toHaveURL(/B2B-DEMO-SHOP1-SS27/, { timeout: 30_000 });

    res = await page.goto(
      '/shop/messages?order=B2B-DEMO-SHOP1-SS27&orderId=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/order=B2B-DEMO-SHOP1-SS27/);
    const shopMessagesChrome = page.getByTestId('platform-core-list-chrome');
    await expect(shopMessagesChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, shopMessagesChrome);
    await expect(page.getByTestId('shop-cm-banner')).toHaveCount(1);
    await expect(page.getByText(/B2B-DEMO-SHOP1-SS27/).first()).toBeVisible({ timeout: 30_000 });

    res = await page.goto('/factory/production/messages', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('factory-messages-core')).toBeVisible({ timeout: 30_000 });
    const factoryMessagesChrome = page.getByTestId('platform-core-list-chrome');
    await expect(factoryMessagesChrome).toBeVisible({ timeout: 30_000 });
    const factoryBanner = page.getByTestId('mfr-cm-banner');
    await expect(factoryBanner).toHaveCount(1);
    await expect(factoryBanner).toBeVisible({ timeout: 30_000 });
    await expect(factoryBanner).toHaveAttribute('data-variant', 'manufacturer');
    await expect(factoryBanner).toContainText('B2B-DEMO-SHOP1-SS27');

    res = await page.goto(
      '/factory/production/messages?order=B2B-DEMO-SHOP1-SS27&orderId=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/order=B2B-DEMO-SHOP1-SS27/);
    await expect(page.getByTestId('mfr-cm-banner')).toHaveCount(0);
    await expect(page.getByText(/B2B-DEMO-SHOP1-SS27/).first()).toBeVisible({ timeout: 30_000 });

    res = await page.goto(
      '/factory/supplier/messages?order=B2B-DEMO-SHOP1-SS27&orderId=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/order=B2B-DEMO-SHOP1-SS27/);
    await expect(page.getByTestId('factory-messages-core')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-cm-banner')).toHaveCount(0);
    await expect(page.getByText(/B2B-DEMO-SHOP1-SS27/).first()).toBeVisible({ timeout: 30_000 });

    res = await page.goto('/factory/production/calendar', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const factoryCalendarChrome = page.getByTestId('platform-core-list-chrome');
    await expect(factoryCalendarChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, factoryCalendarChrome);
    await expect(page.getByTestId('mfr-cm-banner')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-cm-banner')).toContainText(
      'B2B-DEMO-SHOP1-SS27'
    );

    res = await page.goto(
      '/factory/calendar?role=supplier&order=B2B-DEMO-SHOP1-SS27&orderId=B2B-DEMO-SHOP1-SS27',
      { waitUntil: 'domcontentloaded', timeout: 120_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/order=B2B-DEMO-SHOP1-SS27/);
    const supplierCalendarChrome = page.getByTestId('platform-core-list-chrome');
    await expect(supplierCalendarChrome).toBeVisible({ timeout: 120_000 });
    await expectWorkspacePillarStrip(page, supplierCalendarChrome);
    await expect(page.getByTestId('mfr-cm-banner')).toHaveCount(0);
    await expect(page.getByTestId('sup-cm-banner')).toHaveCount(0);
  });

  test('brand cabinet: mini-карточка → матрица магазина', async ({ page }) => {
    const res = await page.goto('/brand/core?pillar=sample_collection', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('brand-sc-cabinet-panel')
        .or(page.getByTestId('brand-sample-collection-mini'))
    ).toBeVisible({
      timeout: 30_000,
    });
    await page
      .getByTestId('brand-sc-audit-path-shop-matrix')
      .or(page.getByTestId('brand-sample-collection-mini-matrix'))
      .click();
    await expect(page).toHaveURL(/\/shop\/b2b\/matrix.*collection=SS27/, { timeout: 30_000 });
    await expect(
      page.getByTestId('shop-co-matrix-shell').or(page.getByTestId('shop-b2b-matrix-shell'))
    ).toBeVisible({ timeout: 30_000 });
  });

  test('cross-role: linesheets → матрица заказа магазина', async ({ page }) => {
    let res = await page.goto('/brand/linesheets?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('brand-sc-linesheets-list')
        .or(page.getByTestId('brand-linesheets-core-list'))
    ).toBeVisible({ timeout: 30_000 });
    await page
      .getByTestId('brand-sc-cross-matrix-open-shop-btn')
      .or(page.getByTestId('brand-sc-linesheets-shop-matrix-link'))
      .or(page.getByTestId('brand-linesheet-to-shop-matrix'))
      .click();
    await expect(page).toHaveURL(/\/shop\/b2b\/matrix.*collection=SS27/, { timeout: 30_000 });
    await expect(
      page.getByTestId('shop-co-matrix-shell').or(page.getByTestId('shop-b2b-matrix-shell'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('shop-co-matrix-row-demo-ss27-01')
        .or(page.getByTestId('shop-b2b-matrix-row-demo-ss27-01'))
    ).toBeVisible({
      timeout: 30_000,
    });
  });

  test('FW27: golden path W2 → showroom → matrix → order (внутри ролей)', async ({ page }) => {
    let res = await page.goto('/brand/production/workshop2?w2col=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const w2Chrome = page.getByTestId('platform-core-development-chrome');
    await expect(w2Chrome).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('platform-core-list-chrome')).toBeVisible();
    await expect(
      page.getByTestId('platform-core-list-chrome').getByTestId('platform-core-context-entity')
    ).toContainText(FW27_COLLECTION_LABEL, { timeout: 30_000 });

    res = await page.goto('/shop/b2b/showroom?collection=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const showroomChrome = page.getByTestId('platform-core-list-chrome');
    await expect(showroomChrome).toBeVisible({ timeout: 30_000 });
    await expect(showroomChrome.getByTestId('platform-core-context-entity')).toContainText(
      FW27_COLLECTION_LABEL,
      { timeout: 30_000 }
    );

    res = await page.goto('/shop/b2b/matrix?collection=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const matrixChrome = page.getByTestId('platform-core-list-chrome');
    await expect(matrixChrome).toBeVisible({ timeout: 30_000 });
    await expect(matrixChrome.getByTestId('platform-core-context-entity')).toContainText(
      FW27_COLLECTION_LABEL,
      { timeout: 30_000 }
    );

    res = await page.goto('/shop/b2b/orders/B2B-DEMO-SHOP1-FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const orderChrome = page.getByTestId('platform-core-order-detail-chrome');
    await expect(orderChrome).toBeVisible({ timeout: 30_000 });
    await expect(orderChrome.getByTestId('platform-core-context-entity')).toContainText(
      'Оптовый заказ'
    );
    await expectWorkspacePillarStrip(page, orderChrome);

    res = await page.goto('/factory/production/dossier/demo-fw27-01', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('mfr-dev-dossier-panel')
        .or(page.getByTestId('factory-dossier-core-chrome'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-dev-dossier-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('platform-core-context-entity')).toContainText('demo-fw27-01');
  });

  test('FW27: кабинет brand collection_order', async ({ page }) => {
    const chainFw27 = waitForChainOverview(page, { collectionId: 'FW27' });
    const res = await page.goto('/brand/core?collection=FW27&pillar=collection_order', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await chainFw27;
    await expect(page.getByTestId('role-core-cabinet-brand')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('platform-core-context-entity')).toContainText(
      FW27_COLLECTION_LABEL,
      { timeout: 30_000 }
    );
    await expectCabinetPillarNav(page);
    await expect(cabinetPillarButton(page, 'collection_order')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('role-pillar-primary-cta')).toHaveAttribute(
      'href',
      /B2B-DEMO-SHOP1-FW27/
    );
  });

  test('хвосты матрицы: pre-orders redirect, discover, catalog', async ({ page }) => {
    test.setTimeout(240_000);
    const GOTO_TAIL = { ...GOTO, timeout: 90_000 };
    let res = await page.goto('/brand/pre-orders', GOTO_TAIL);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/\/brand\/b2b-orders/, { timeout: 30_000 });
    await expect(page.getByTestId('brand-co-registry-panel')).toBeVisible({ timeout: 30_000 });

    res = await page.goto('/shop/b2b/discover', GOTO_TAIL);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const discoverChrome = page.getByTestId('platform-core-list-chrome');
    await expect(discoverChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, discoverChrome);

    res = await page.goto('/shop/b2b/partners/discover', GOTO_TAIL);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const partnersDiscoverChrome = page.getByTestId('platform-core-list-chrome');
    await expect(partnersDiscoverChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, partnersDiscoverChrome);

    res = await page.goto('/shop/b2b/partners', GOTO_TAIL);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const partnersChrome = page.getByTestId('platform-core-list-chrome');
    await expect(partnersChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, partnersChrome);

    res = await page.goto('/shop/b2b/partners/syntha-lab', GOTO_TAIL);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const partnerDetailChrome = page.getByTestId('platform-core-list-chrome');
    await expect(partnerDetailChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, partnerDetailChrome);

    res = await page.goto('/shop/b2b/catalog', GOTO_TAIL);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const catalogChrome = page.getByTestId('platform-core-list-chrome');
    await expect(catalogChrome).toBeVisible({ timeout: 30_000 });
    await expectWorkspacePillarStrip(page, catalogChrome);
  });

  test('столп 3: matrix → checkout → новый PG order (не B2B-DEMO-*)', async ({ page }) => {
    const articleId = 'demo-ss27-01';
    const publishedArticles = page.waitForResponse(
      (r) =>
        r.url().includes('/api/workshop2/collections/SS27/published-articles') && r.ok(),
      { timeout: 60_000 }
    );
    let res = await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await publishedArticles;
    await expect(
      page.getByTestId('shop-co-matrix-shell').or(page.getByTestId('shop-b2b-matrix-shell'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId(`shop-co-matrix-row-${articleId}`)
        .or(page.getByTestId(`shop-b2b-matrix-row-${articleId}`))
    ).toBeVisible({
      timeout: 30_000,
    });

    await page
      .getByTestId(`shop-co-matrix-qty-${articleId}-M`)
      .or(page.getByTestId(`shop-b2b-matrix-qty-${articleId}-M`))
      .fill('12');
    await expect(
      page
        .getByTestId('shop-co-matrix-to-checkout')
        .or(page.getByTestId('shop-b2b-matrix-to-checkout'))
    ).toBeEnabled({
      timeout: 15_000,
    });
    const cartUpsert = page.waitForResponse(
      (r) =>
        r.url().includes('/api/shop/b2b/cart/lines') &&
        r.request().method() === 'POST' &&
        (r.request().postData() ?? '').includes('"action":"upsert"'),
      { timeout: 60_000 }
    );
    await page
      .getByTestId('shop-co-matrix-to-checkout')
      .or(page.getByTestId('shop-b2b-matrix-to-checkout'))
      .click();
    const upsertRes = await cartUpsert;
    if (!upsertRes.ok()) {
      const upsertBody = await upsertRes.text().catch(() => '');
      throw new Error(`cart upsert failed: ${upsertRes.status()} ${upsertBody}`);
    }
    await expect(page).toHaveURL(/\/shop\/b2b\/checkout/, { timeout: 30_000 });
    await expect(page.getByTestId('shop-co-checkout-panel')).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('shop-co-checkout-form')
        .or(page.getByTestId('shop-b2b-checkout-form'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('shop-co-checkout-inventory-hold')
        .or(page.getByTestId('shop-b2b-checkout-inventory-hold'))
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page
        .getByTestId('shop-co-checkout-confirm')
        .or(page.getByTestId('shop-b2b-checkout-confirm'))
    ).toBeEnabled({ timeout: 30_000 });

    const checkoutApi = page.waitForResponse(
      (r) => {
        if (!r.url().includes('/api/shop/b2b/cart/lines') || r.request().method() !== 'POST') {
          return false;
        }
        const body = r.request().postData() ?? '';
        return body.includes('"action":"checkout"');
      },
      { timeout: 60_000 }
    );
    await page
      .getByTestId('shop-co-checkout-confirm')
      .or(page.getByTestId('shop-b2b-checkout-confirm'))
      .click();
    const checkoutRes = await checkoutApi;
    const checkoutJson = (await checkoutRes.json()) as {
      ok?: boolean;
      order?: { id?: string; status?: string };
      messageRu?: string;
    };
    if (!checkoutJson.ok) {
      throw new Error(
        `checkout failed: ${checkoutRes.status()} ${checkoutJson.messageRu ?? JSON.stringify(checkoutJson)}`
      );
    }
    const orderId = checkoutJson.order?.id ?? '';
    expect(orderId).toMatch(/^B2B-\d+$/);
    expect(orderId).not.toBe('B2B-DEMO-SHOP1-SS27');
    expect((checkoutJson.order as { status?: string } | undefined)?.status).toBe('submitted');

    await expect(page).toHaveURL(new RegExp(`/shop/b2b/orders/${orderId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), {
      timeout: 30_000,
    });
    await expect(page.getByTestId('platform-core-order-detail-chrome')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('platform-core-context-entity')).toContainText('Весна–лето 2027');
    await expect(page.getByTestId('platform-core-context-entity')).not.toContainText('B2B-DEMO');
    await expect(
      page
        .getByTestId('shop-co-detail-chat-link')
        .or(page.getByTestId('shop-order-detail-chat-link'))
    ).toBeVisible({ timeout: 30_000 });
  });
});
