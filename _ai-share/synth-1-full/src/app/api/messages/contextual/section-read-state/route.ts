import { NextRequest, NextResponse } from 'next/server';
import { isCoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';
import {
  listPlatformCoreSectionReadKeys,
  markPlatformCoreSectionRead,
} from '@/lib/server/platform-core-section-read-state';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';

function resolveReaderId(req: NextRequest, fromBody?: string): string | null {
  const body = fromBody?.trim();
  if (body) return body;
  return (
    req.headers.get('x-w2-actor-id')?.trim() || req.headers.get('x-synth-actor-id')?.trim() || null
  );
}

function invalidOrderIdResponse(field: 'GET' | 'POST') {
  return NextResponse.json(
    {
      ok: false,
      messageRu:
        field === 'GET'
          ? 'Укажите wholesale orderId (B2B-DEMO-* или B2B-\\d+).'
          : 'orderId должен быть B2B-DEMO-* или B2B-\\d+.',
    },
    { status: 400 }
  );
}

/** GET — section read keys for order × actor (PG comms section-groups). */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() ?? '';
  const readerId = resolveReaderId(req, req.nextUrl.searchParams.get('readerId') ?? undefined);
  if (!orderId || !isPlatformCorePgB2bOrder(orderId)) {
    return invalidOrderIdResponse('GET');
  }
  if (!readerId) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите readerId.' }, { status: 400 });
  }

  const keys = await listPlatformCoreSectionReadKeys({
    actorId: readerId,
    orderId,
    organizationId: req.nextUrl.searchParams.get('organizationId')?.trim() || undefined,
  });
  return NextResponse.json({ ok: true, orderId, readerId, keys, count: keys.length });
}

/** POST — persist section visit (complements client localStorage). */
export async function POST(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await req.json()) as {
      orderId?: string;
      pillarId?: string;
      sectionId?: string;
      readerId?: string;
      organizationId?: string;
    };
    const orderId = body.orderId?.trim() ?? '';
    const pillarRaw = body.pillarId?.trim() ?? '';
    const sectionId = body.sectionId?.trim() ?? '';
    const readerId = resolveReaderId(req, body.readerId);

    if (!orderId || !isPlatformCorePgB2bOrder(orderId)) {
      return invalidOrderIdResponse('POST');
    }
    if (!pillarRaw || !isCoreHubPillarId(pillarRaw) || !sectionId) {
      return NextResponse.json(
        { ok: false, messageRu: 'Укажите pillarId и sectionId.' },
        { status: 400 }
      );
    }
    if (!readerId) {
      return NextResponse.json({ ok: false, messageRu: 'Укажите readerId.' }, { status: 400 });
    }

    const record = await markPlatformCoreSectionRead({
      actorId: readerId,
      orderId,
      pillarId: pillarRaw,
      sectionId,
      organizationId: body.organizationId?.trim() || undefined,
    });

    return NextResponse.json({ ok: true, readState: record });
  } catch {
    return NextResponse.json(
      { ok: false, messageRu: 'Некорректное тело запроса.' },
      { status: 400 }
    );
  }
}
