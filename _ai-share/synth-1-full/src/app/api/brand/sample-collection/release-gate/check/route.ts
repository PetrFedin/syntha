import { NextRequest, NextResponse } from 'next/server';

import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  BRAND_SC_RELEASE_GATE_CHECK_API_PATH,
  BRAND_RELEASE_GATE_PASSPORT_API_PATH,
} from '@/lib/production/brand-material-passport-release-gate';
import { evaluateBrandMaterialPassportReleaseGateForCollection } from '@/lib/server/brand-material-passport-release-gate-server';

export const dynamic = 'force-dynamic';

/** POST — Wave UV: SC release gate — material passport must be complete before publish. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const collectionId =
    String(body.collectionId ?? req.nextUrl.searchParams.get('collection') ?? '').trim() ||
    PLATFORM_CORE_DEMO.collectionId;

  const gate = await evaluateBrandMaterialPassportReleaseGateForCollection({ collectionId });

  if (gate.blocked) {
    return NextResponse.json(
      {
        ok: false,
        blocked: true,
        ready: false,
        error: 'material_passport_release_gate',
        code: 'material_passport_release_gate',
        messageRu: gate.messageRu,
        summary: gate.summary,
        storageMode: gate.storageMode,
        apiPath: BRAND_SC_RELEASE_GATE_CHECK_API_PATH,
        merchApiPath: BRAND_RELEASE_GATE_PASSPORT_API_PATH,
      },
      { status: 409, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      blocked: false,
      ready: true,
      messageRu: gate.messageRu,
      summary: gate.summary,
      storageMode: gate.storageMode,
      apiPath: BRAND_SC_RELEASE_GATE_CHECK_API_PATH,
      merchApiPath: BRAND_RELEASE_GATE_PASSPORT_API_PATH,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
