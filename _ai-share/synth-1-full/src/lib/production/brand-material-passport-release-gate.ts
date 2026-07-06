/**
 * Wave TY: release gate — block linesheet/showroom publish until material passport certs ready.
 */
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { materialPassportCertsBlockRelease } from '@/lib/fashion/brand-material-passport-certs';

export const BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU =
  'Release gate: material passport не завершён — заполните certs/rollup перед publish в витрину.';

export const BRAND_RELEASE_GATE_PASSPORT_PG_UNAVAILABLE_RU =
  'Release gate: PostgreSQL недоступен — publish заблокирован в Platform Core (fail-closed).';

export const BRAND_RELEASE_GATE_PASSPORT_API_PATH = '/api/brand/merch/release-gate';

/** Wave UV · sample-collection scoped release gate check (pillar 2 publish). */
export const BRAND_SC_RELEASE_GATE_CHECK_API_PATH =
  '/api/brand/sample-collection/release-gate/check';

export type BrandMaterialPassportReleaseGateResult = {
  blocked: boolean;
  ready: boolean;
  messageRu: string;
  summary: { total: number; ready: number; blocked: number };
  storageMode?: string;
};

export function brandMaterialPassportReleaseGateMessageRu(summary: {
  total: number;
  ready: number;
  blocked: number;
}): string {
  if (summary.total === 0) {
    return 'Release gate: нет строк material passport — добавьте SKU в certs перед publish.';
  }
  return `${BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU} (${summary.ready}/${summary.total} готовы).`;
}

/** Fail-closed in Platform Core when PG/passport summary blocks release. */
export function evaluateBrandMaterialPassportReleaseGateFromSummary(input: {
  summary: { total: number; ready: number; blocked: number };
  releaseBlocked: boolean;
  storageMode?: string;
  pgUnavailable?: boolean;
}): BrandMaterialPassportReleaseGateResult {
  const corePgOnly = isPlatformCoreMode();
  if (corePgOnly && input.pgUnavailable) {
    return {
      blocked: true,
      ready: false,
      messageRu: BRAND_RELEASE_GATE_PASSPORT_PG_UNAVAILABLE_RU,
      summary: input.summary,
      storageMode: input.storageMode,
    };
  }
  const blocked =
    input.releaseBlocked || materialPassportCertsBlockRelease(input.summary);
  return {
    blocked,
    ready: !blocked,
    messageRu: blocked
      ? brandMaterialPassportReleaseGateMessageRu(input.summary)
      : `Material passport готов (${input.summary.ready}/${input.summary.total}).`,
    summary: input.summary,
    storageMode: input.storageMode,
  };
}
