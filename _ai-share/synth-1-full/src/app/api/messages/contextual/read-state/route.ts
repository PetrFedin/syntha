import { NextRequest, NextResponse } from 'next/server';
import { parseBrandPgContextChatId } from '@/lib/brand/brand-messages-pg-threads';
import { resolveWorkshop2OrganizationId } from '@/lib/server/workshop2-api-context';
import { upsertWorkshop2ContextualReadState } from '@/lib/server/workshop2-contextual-read-state-repository';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

function resolveReaderId(req: NextRequest, bodyReaderId?: string): string | null {
  const fromBody = bodyReaderId?.trim();
  if (fromBody) return fromBody;
  const fromHeader =
    req.headers.get('x-w2-actor-id')?.trim() || req.headers.get('x-synth-actor-id')?.trim();
  return fromHeader || null;
}

/** POST /api/messages/contextual/read-state — server read receipt for PG contextual thread. */
export async function POST(request: NextRequest) {
  const auth = await guardWorkshop2Route(request, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as {
      contextType?: string;
      contextId?: string;
      chatId?: string;
      lastSeenMessageCount?: number;
      readerId?: string;
      organizationId?: string;
    };

    let contextType = body.contextType?.trim();
    let contextId = body.contextId?.trim();
    if ((!contextType || !contextId) && body.chatId?.trim()) {
      const parsed = parseBrandPgContextChatId(body.chatId.trim());
      if (parsed) {
        contextType = parsed.contextType;
        contextId = parsed.contextId;
      }
    }

    if (!contextType || !contextId) {
      return NextResponse.json(
        { error: 'Missing contextType/contextId or chatId' },
        { status: 400 }
      );
    }

    const readerId = resolveReaderId(request, body.readerId);
    if (!readerId) {
      return NextResponse.json({ error: 'Missing readerId' }, { status: 400 });
    }

    const lastSeen = Number(body.lastSeenMessageCount);
    if (!Number.isFinite(lastSeen) || lastSeen < 0) {
      return NextResponse.json({ error: 'Invalid lastSeenMessageCount' }, { status: 400 });
    }

    const organizationId = body.organizationId?.trim() || resolveWorkshop2OrganizationId(request);

    const record = await upsertWorkshop2ContextualReadState({
      organizationId,
      actorId: readerId,
      contextType,
      contextId,
      lastSeenMessageCount: lastSeen,
    });

    return NextResponse.json({ ok: true, readState: record });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
