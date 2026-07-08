/**
 * Wave VQ — brand OP chain SSE dedup, dossier locked/diff, cut_ticket PG verify.
 */
import { brandB2bOrderChainContextHref, brandB2bOrderDossierContextHref } from '@/lib/routes';
import type { ProductionOrderCutTicketStub } from '@/lib/production/brand-op-production-order-cut-ticket';
import { isProductionOrderCutTicketEmpty } from '@/lib/production/brand-op-production-order-cut-ticket';

export const BRAND_OP_CHAIN_SSE_DEDUP_BADGE_TESTID = 'brand-op-chain-sse-dedup-badge';
export const BRAND_OP_CABINET_SSE_DEDUP_STRIP_TESTID = 'brand-op-cabinet-sse-dedup-strip';
export const BRAND_OP_REGISTRY_SSE_DEDUP_STRIP_TESTID = 'brand-op-registry-sse-dedup-strip';
export const BRAND_OP_DOSSIER_LOCKED_BADGE_TESTID = 'brand-op-dossier-locked-badge';
export const BRAND_OP_DOSSIER_FACTORY_DIFF_WRAP_TESTID = 'brand-op-dossier-factory-diff-wrap';
export const BRAND_OP_CUT_TICKET_PG_VERIFY_BADGE_TESTID = 'brand-op-cut-ticket-pg-verify-badge';

export const BRAND_OP_CUT_TICKET_GET_API_SEGMENT =
  '/api/workshop2/manufacturer/production-orders/' as const;

export function brandOpChainSseDedupStripLeadRu(): string {
  return 'SSE chain-status — только на карточке цепочки (без дубля здесь).';
}

export function brandOpChainSseDedupChainLinkLabelRu(): string {
  return 'Цепочка заказа →';
}

export function brandOpDossierLockedBadgeRu(input: {
  dossierVersionAtHandoff?: number;
  live?: boolean;
}): string {
  const version = input.dossierVersionAtHandoff != null ? ` v${input.dossierVersionAtHandoff}` : '';
  const liveSuffix = input.live ? ' · live PG' : '';
  return `Зафиксировано${version} при передаче${liveSuffix}`;
}

export function brandOpCutTicketPgVerifyBadgeRu(input: {
  verified: boolean;
  ticketNo?: string;
}): string {
  if (!input.verified) return 'cut_ticket PG: не синхронизировано';
  return input.ticketNo
    ? `cut_ticket PG ✓ · ${input.ticketNo}`
    : 'cut_ticket PG ✓ · workshop2_purchase_orders';
}

export function verifyProductionOrderCutTicketPg(
  cutTicket: ProductionOrderCutTicketStub | Record<string, unknown> | null | undefined
): { ok: boolean; reasonRu: string } {
  if (isProductionOrderCutTicketEmpty(cutTicket)) {
    return { ok: false, reasonRu: 'cut_ticket пуст на PO.' };
  }
  const stub = cutTicket as ProductionOrderCutTicketStub;
  if (!stub.ticketNo?.trim()) {
    return { ok: false, reasonRu: 'Нет ticketNo в cut_ticket JSONB.' };
  }
  if (!stub.status?.trim() && !stub.statusLabelRu?.trim()) {
    return { ok: false, reasonRu: 'Нет status в cut_ticket JSONB.' };
  }
  return { ok: true, reasonRu: 'cut_ticket PG mirror валиден.' };
}

export function brandOpChainContextHrefForSseDedup(orderId: string): string {
  return `${brandB2bOrderChainContextHref(orderId)}#production-handoff`;
}

export function brandOpDossierContextHref(orderId: string): string {
  return brandB2bOrderDossierContextHref(orderId);
}

export function brandOpCutTicketGetApiPath(productionOrderId: string): string {
  return `${BRAND_OP_CUT_TICKET_GET_API_SEGMENT}${encodeURIComponent(productionOrderId)}/cut-ticket`;
}
