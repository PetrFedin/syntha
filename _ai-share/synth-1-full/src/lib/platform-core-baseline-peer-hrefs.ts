/**
 * Peer hrefs для brand/shop baseline UI — строковые литералы без import extended-routes.
 * Brand смотрит на factory PO/dossier как на peer, но baseline bundle не тянет extended module.
 */

/** Brand → PO в реестре цеха (peer, не cabinet manufacturer). */
export function brandOpFactoryProductionOrderPeerHref(
  orderId: string,
  opts?: { factoryId?: string }
): string {
  const sp = new URLSearchParams({ order: orderId });
  if (opts?.factoryId?.trim()) sp.set('factoryId', opts.factoryId.trim());
  return `/factory/production/orders?${sp.toString()}`;
}

/** Brand → досье артикула в цехе после dispatch образца. */
export function brandDevelopmentFactoryDossierPeerHref(
  articleId: string,
  opts?: { collectionId?: string }
): string {
  const base = `/factory/production/dossier/${encodeURIComponent(articleId)}`;
  const cid = opts?.collectionId?.trim();
  return cid ? `${base}?collection=${encodeURIComponent(cid)}` : base;
}
