import { NextRequest, NextResponse } from 'next/server';
import { buildPgContextualThreadsResponse } from '@/lib/server/pg-contextual-message-threads-handler';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

/** GET /api/factory/messages/threads — contextual PG threads для кабинета цеха. */
export async function GET(request: NextRequest) {
  const auth = await guardWorkshop2Route(request, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;
  return buildPgContextualThreadsResponse('factory', request);
}
