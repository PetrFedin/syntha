import { NextRequest, NextResponse } from 'next/server';
import { buildPgContextualThreadsResponse } from '@/lib/server/pg-contextual-message-threads-handler';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

/** GET /api/brand/messages/threads — агрегат contextual PG threads (RU main path). */
export async function GET(request: NextRequest) {
  const auth = await guardWorkshop2Route(request, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;
  return buildPgContextualThreadsResponse('brand', request);
}
