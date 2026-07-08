import { NextRequest, NextResponse } from 'next/server';

import { listWorkshop2BrandTenantRegistry } from '@/lib/production/workshop2-brand-tenant-registry';
import { listWorkshop2B2bOrdersAll } from '@/lib/server/workshop2-b2b-orders-repository';
import { listWorkshop2B2bInvoicesByTenantId } from '@/lib/server/workshop2-b2b-invoice-repository';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { buildWorkshop2B2bInvoiceHtmlUrl } from '@/lib/production/workshop2-b2b-invoice-stub';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** GET CSV export B2B orders scoped by tenantId (required). Wave 54: PG invoice mirror when DATABASE_URL. */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const tenantId = req.nextUrl.searchParams.get('tenantId')?.trim();
  if (!tenantId) {
    return NextResponse.json(
      {
        ok: false,
        error: 'tenantId_required',
        messageRu: 'Параметр tenantId обязателен для экспорта заказов.',
      },
      { status: 400 }
    );
  }

  const brandIds = new Set(
    listWorkshop2BrandTenantRegistry()
      .filter((b) => b.tenantId === tenantId)
      .map((b) => b.brandId)
  );
  if (brandIds.size === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: 'tenant_not_found',
        messageRu: `Tenant «${tenantId}» не найден в brand registry.`,
      },
      { status: 404 }
    );
  }

  const orders = (await listWorkshop2B2bOrdersAll()).filter((o) =>
    brandIds.has(o.brandId?.trim() || 'demo-brand')
  );

  const invoiceByOrder = new Map<string, { status: string; mode: string }>();
  const invoices = await listWorkshop2B2bInvoicesByTenantId(tenantId);
  for (const inv of invoices) {
    invoiceByOrder.set(inv.orderId, { status: inv.status, mode: inv.mode });
  }

  const header = [
    'orderId',
    'brandId',
    'tenantId',
    'totalRub',
    'status',
    'invoiceStatus',
    'invoiceMode',
    'invoiceStubUrl',
    'invoiceHtmlUrl',
    'updatedAt',
  ];
  const rows = orders.map((o) => {
    const inv = invoiceByOrder.get(o.id);
    return [
      escapeCsvCell(o.id),
      escapeCsvCell(o.brandId ?? 'demo-brand'),
      escapeCsvCell(tenantId),
      String(o.totalRub ?? 0),
      escapeCsvCell(o.status),
      escapeCsvCell(inv?.status ?? ''),
      escapeCsvCell(inv?.mode ?? ''),
      escapeCsvCell(buildWorkshop2B2bInvoiceHtmlUrl(o.id)),
      escapeCsvCell(
        invoices.find((i) => i.orderId === o.id)?.invoiceHtmlUrl ??
          buildWorkshop2B2bInvoiceHtmlUrl(o.id)
      ),
      escapeCsvCell(o.updatedAt),
    ].join(',');
  });

  const csv = [header.join(','), ...rows].join('\n');
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="workshop2-b2b-orders-${tenantId}.csv"`,
      'Cache-Control': 'no-store',
      'X-Workshop2-Export-Source': isWorkshop2PostgresEnabled() ? 'pg' : 'memory',
    },
  });
}
