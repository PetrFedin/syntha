/** PO + order query on supplier OP comms / handoff tail hrefs (Wave TX). */

export function resolveSupplierOpProductionOrderId(
  orderId: string,
  productionOrderId?: string
): string {
  const explicit = productionOrderId?.trim();
  if (explicit) return explicit;
  const oid = orderId.trim();
  return oid ? `PO-B2B-${oid}` : '';
}

export function appendSupplierOpPoContextToHref(
  href: string,
  input: { orderId?: string; productionOrderId?: string }
): string {
  const orderId = input.orderId?.trim();
  if (!orderId) return href;
  const po = resolveSupplierOpProductionOrderId(orderId, input.productionOrderId);
  if (!po) return href;

  const hashIdx = href.indexOf('#');
  const hash = hashIdx >= 0 ? href.slice(hashIdx) : '';
  const pathQuery = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const qIdx = pathQuery.indexOf('?');
  const base = qIdx >= 0 ? pathQuery.slice(0, qIdx) : pathQuery;
  const sp = new URLSearchParams(qIdx >= 0 ? pathQuery.slice(qIdx + 1) : '');
  if (!sp.has('po')) sp.set('po', po);
  if (!sp.has('order') && !sp.has('orderId')) sp.set('order', orderId);
  const query = sp.toString();
  return query ? `${base}?${query}${hash}` : `${base}${hash}`;
}
