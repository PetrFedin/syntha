import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import {
  integrationPlatformZ,
  orderImportRequestSchema,
} from '@/lib/integrations/spine/integration-external-ref.schema';
import {
  importWholesaleOrder,
  importWholesaleOrdersBatch,
} from '@/lib/integrations/spine/order-import.service';
import { isWholesaleImportPlatform } from '@/lib/integrations/spine/integration-platform';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';
import { resolveWorkshop2OrganizationId } from '@/lib/server/workshop2-api-context';

type RouteCtx = { params: Promise<{ platform: string }> };

/** POST /api/integrations/v1/:platform/orders/import */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  const { platform: platformRaw } = await ctx.params;

  const platformParsed = integrationPlatformZ.safeParse(platformRaw);
  if (!platformParsed.success || !isWholesaleImportPlatform(platformParsed.data)) {
    return NextResponse.json(
      {
        ok: false as const,
        error: {
          code: 'UNSUPPORTED_PLATFORM',
          message: 'Wholesale import not supported for platform',
        },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsed = orderImportRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'INVALID_BODY', message: parsed.error.message },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const platform = platformParsed.data;
  const dryRun = parsed.data.dryRun ?? false;
  const organizationId = resolveWorkshop2OrganizationId(req);

  let results;
  if (parsed.data.orders?.length) {
    results = importWholesaleOrdersBatch({
      platform,
      orders: parsed.data.orders,
      dryRun,
      organizationId,
    });
  } else if (parsed.data.externalOrderId) {
    results = [
      importWholesaleOrder({
        platform,
        externalOrderId: parsed.data.externalOrderId,
        raw:
          typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : undefined,
        dryRun,
        organizationId,
      }),
    ];
  } else {
    return NextResponse.json(
      {
        ok: false as const,
        error: {
          code: 'MISSING_ORDER_PAYLOAD',
          message: 'externalOrderId or orders[] required',
        },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  if (!dryRun) {
    const importedCount = results.filter((r) => r.wholesaleOrderId.trim().length > 0).length;
    enqueueSyncJob({ platform, kind: 'orders_import', resultCount: importedCount });
  }

  return NextResponse.json(
    {
      ok: true as const,
      data: { results },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
