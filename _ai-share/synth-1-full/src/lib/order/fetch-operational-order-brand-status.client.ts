import { b2bV1SynthaActorRoleHeaders } from '@/lib/auth/b2b-v1-api-client-headers';
import { parseOperationalOrderV1DetailResponse } from '@/lib/order/operational-order-dto.schema';

/** GET v1 detail — статус бренда (PATCH `/operational-orders/:id/status`) для зеркала у shop. */
export async function fetchOperationalOrderBrandStatusMirror(
  orderId: string,
  actorRole: 'brand' | 'shop' = 'shop'
): Promise<string | null> {
  const id = orderId.trim();
  if (!id) return null;

  try {
    const res = await fetch(`/api/b2b/v1/operational-orders/${encodeURIComponent(id)}`, {
      headers: { ...b2bV1SynthaActorRoleHeaders(actorRole) },
      cache: 'no-store',
    });
    const parsed = parseOperationalOrderV1DetailResponse(await res.json());
    if (!parsed.success) return null;
    const status = parsed.data.data.order.status?.trim();
    return status || null;
  } catch {
    return null;
  }
}
