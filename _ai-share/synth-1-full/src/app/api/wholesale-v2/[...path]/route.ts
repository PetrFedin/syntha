import { getWholesaleV2Runtime } from '@/lib/server/wholesale-v2-runtime';
import { createWholesaleV2CoreRequest } from '@/lib/server/wholesale-v2-bff';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type RouteContext = { params: Promise<{ path?: string[] }> };

async function handle(request: Request, context: RouteContext): Promise<Response> {
  const { path = [] } = await context.params;
  const runtime = await getWholesaleV2Runtime();
  return runtime.fetchHandler(createWholesaleV2CoreRequest(request, path));
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
