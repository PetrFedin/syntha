/**
 * Wave 42/44: labeled fail-closed demo mode — journal-only ACK для investor demo.
 * Accepts: true | 1 | yes (case-insensitive).
 */
export function isWorkshop2InvestorDemoMode(
  env: Record<string, string | undefined> = process.env
): boolean {
  const v = String(env.WORKSHOP2_INVESTOR_DEMO_MODE ?? '')
    .trim()
    .toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

/** @deprecated prefer isWorkshop2InvestorDemoMode */
export const isWorkshop2InvestorDemoModeEnabled = isWorkshop2InvestorDemoMode;

/** Ops debug payload for GET /api/workshop2/investor-demo/env-check */
export function buildWorkshop2InvestorDemoEnvCheck(
  env: Record<string, string | undefined> = process.env
) {
  return {
    WORKSHOP2_INVESTOR_DEMO_MODE: env.WORKSHOP2_INVESTOR_DEMO_MODE ?? null,
    WORKSHOP2_UNIT_TESTS_PASSING: env.WORKSHOP2_UNIT_TESTS_PASSING ?? null,
    NEXT_PUBLIC_WORKSHOP2_INVESTOR_DEMO_MODE: env.NEXT_PUBLIC_WORKSHOP2_INVESTOR_DEMO_MODE ?? null,
    E2E: env.E2E ?? null,
    NEXT_DIST_DIR: env.NEXT_DIST_DIR ?? null,
    demoModeComputed: isWorkshop2InvestorDemoMode(env),
  };
}

export function hasWorkshop2KonturLiveCredentials(
  env: Record<string, string | undefined> = process.env
): boolean {
  const url = String(
    env.WORKSHOP2_KONTUR_DIADOC_URL ?? env.WORKSHOP2_KONTUR_EDO_API_URL ?? ''
  ).trim();
  const token = String(
    env.WORKSHOP2_KONTUR_DIADOC_TOKEN ?? env.WORKSHOP2_KONTUR_EDO_API_TOKEN ?? ''
  ).trim();
  return Boolean(url) && !url.includes('YOUR-') && Boolean(token);
}

export function hasWorkshop2MarkingLiveCredentials(
  env: Record<string, string | undefined> = process.env
): boolean {
  const url = String(env.WORKSHOP2_MARKING_API_URL ?? '').trim();
  const token = String(env.WORKSHOP2_MARKING_API_TOKEN ?? '').trim();
  return Boolean(url) && !url.includes('YOUR-') && Boolean(token);
}

export function shouldWorkshop2UseInvestorDemoJournalOnly(
  integration: 'edo' | 'marking',
  env: Record<string, string | undefined> = process.env
): boolean {
  if (!isWorkshop2InvestorDemoModeEnabled(env)) return false;
  if (integration === 'edo') return !hasWorkshop2KonturLiveCredentials(env);
  return !hasWorkshop2MarkingLiveCredentials(env);
}

export function buildWorkshop2InvestorDemoJournalId(
  prefix: string,
  collectionId: string,
  articleId: string
): string {
  return `${prefix}-${collectionId}-${articleId}-${Date.now()}`;
}
