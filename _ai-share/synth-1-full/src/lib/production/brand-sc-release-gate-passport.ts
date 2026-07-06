import {
  BRAND_SC_RELEASE_GATE_CHECK_API_PATH,
  type BrandMaterialPassportReleaseGateResult,
} from '@/lib/production/brand-material-passport-release-gate';

export { BRAND_SC_RELEASE_GATE_CHECK_API_PATH };

export type BrandScReleaseGateCheckResult = BrandMaterialPassportReleaseGateResult & {
  ok?: boolean;
  httpStatus?: number;
  apiPath?: string;
};

/** Client fetch for SC release gate — blocks linesheet/showroom publish until passport ready. */
export async function fetchBrandScReleaseGateCheck(
  collectionId: string
): Promise<BrandScReleaseGateCheckResult> {
  const res = await fetch(BRAND_SC_RELEASE_GATE_CHECK_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionId }),
    cache: 'no-store',
  });
  const json = (await res.json()) as BrandScReleaseGateCheckResult & {
    ok?: boolean;
    messageRu?: string;
  };
  return {
    blocked: json.blocked ?? res.status === 409,
    ready: json.ready ?? res.ok,
    messageRu: json.messageRu ?? '',
    summary: json.summary ?? { total: 0, ready: 0, blocked: 0 },
    storageMode: json.storageMode,
    ok: json.ok ?? res.ok,
    httpStatus: res.status,
    apiPath: json.apiPath ?? BRAND_SC_RELEASE_GATE_CHECK_API_PATH,
  };
}
