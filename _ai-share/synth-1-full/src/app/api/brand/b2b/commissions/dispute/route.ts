import { NextRequest, NextResponse } from 'next/server';

import {
  createBrandAgentRepCommissionDisputeServer,
  brandAgentRepCommissionDisputeStorageMode,
  listBrandAgentRepCommissionDisputesServer,
} from '@/lib/server/brand-agent-rep-commission-dispute-repository';

/** GET /api/brand/b2b/commissions/dispute — list brand oversight disputes (wave WX PG stub). */
export async function GET() {
  const disputes = await listBrandAgentRepCommissionDisputesServer();
  const storageMode = brandAgentRepCommissionDisputeStorageMode();
  return NextResponse.json({
    ok: true,
    disputes,
    storageMode,
    messageRu: `${disputes.length} спор(ов) · только просмотр магазина · ${storageMode}.`,
  });
}

/** POST /api/brand/b2b/commissions/dispute — brand read-only oversight stub (wave WX). */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const commissionId = String(body.commissionId ?? '').trim();
  const reasonRu = String(body.reasonRu ?? body.reason ?? '').trim();
  const repName = String(body.repName ?? '').trim();

  if (!commissionId || !reasonRu) {
    return NextResponse.json(
      { ok: false, messageRu: 'commissionId и reasonRu обязательны.' },
      { status: 400 }
    );
  }

  const dispute = await createBrandAgentRepCommissionDisputeServer({
    commissionId,
    reasonRu,
    repName: repName || null,
  });

  return NextResponse.json({
    ok: true,
    dispute,
    storageMode: brandAgentRepCommissionDisputeStorageMode(),
    messageRu: `Спор ${dispute.disputeId} принят · только просмотр магазина.`,
  });
}
