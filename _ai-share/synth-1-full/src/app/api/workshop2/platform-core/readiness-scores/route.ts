import { NextRequest, NextResponse } from 'next/server';

import {
  buildWaveYzReadinessScoresExport,
  type WaveYzReadinessScoresExportPayload,
} from '@/lib/platform/wave-yz-cell-score-export';
import type { ReadinessScoreMode } from '@/lib/platform-core-readiness-audit';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

function parseMode(raw: string | null): ReadinessScoreMode {
  return raw === 'live' ? 'live' : 'static';
}

/** GET /api/workshop2/platform-core/readiness-scores?collectionId=SS27&mode=static|live */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const sp = req.nextUrl.searchParams;
  const collectionId = sp.get('collectionId')?.trim() || 'SS27';
  const mode = parseMode(sp.get('mode'));

  const exportPayload: WaveYzReadinessScoresExportPayload = buildWaveYzReadinessScoresExport(
    collectionId,
    { mode, liveChain: mode === 'live' }
  );

  return NextResponse.json({ ok: true, ...exportPayload });
}
