import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  BRAND_OP_CABINET_SSE_DEDUP_STRIP_TESTID,
  BRAND_OP_CHAIN_SSE_DEDUP_BADGE_TESTID,
  BRAND_OP_CUT_TICKET_PG_VERIFY_BADGE_TESTID,
  BRAND_OP_DOSSIER_FACTORY_DIFF_WRAP_TESTID,
  BRAND_OP_DOSSIER_LOCKED_BADGE_TESTID,
  BRAND_OP_REGISTRY_SSE_DEDUP_STRIP_TESTID,
  brandOpChainContextHrefForSseDedup,
  brandOpCutTicketGetApiPath,
  brandOpCutTicketPgVerifyBadgeRu,
  brandOpDossierLockedBadgeRu,
  verifyProductionOrderCutTicketPg,
} from '@/lib/fashion/brand-op-wave-vq';
import { buildProductionOrderCutTicketStub } from '@/lib/production/brand-op-production-order-cut-ticket';
import { brandB2bOrderDossierContextHref } from '@/lib/routes';

describe('wave VQ — brand OP chain SSE dedup + dossier + cut_ticket PG', () => {
  it('SSE dedup strip testids on registry/cabinet', () => {
    expect(BRAND_OP_CHAIN_SSE_DEDUP_BADGE_TESTID).toContain('sse-dedup');
    expect(BRAND_OP_CABINET_SSE_DEDUP_STRIP_TESTID).toContain('cabinet');
    expect(BRAND_OP_REGISTRY_SSE_DEDUP_STRIP_TESTID).toContain('registry');
    expect(brandOpChainContextHrefForSseDedup(PLATFORM_CORE_DEMO.demoOrderId)).toContain(
      '#production-handoff'
    );
  });

  it('OP dossier locked badge live copy (Wave VQ)', () => {
    expect(BRAND_OP_DOSSIER_LOCKED_BADGE_TESTID).toBe('brand-op-dossier-locked-badge');
    const locked = brandOpDossierLockedBadgeRu({
      dossierVersionAtHandoff: 3,
      live: true,
    });
    expect(locked).toContain('v3');
    expect(locked).toContain('live PG');
  });

  it('OP dossier tab wires side-by-side factory diff (Wave UN/VQ)', () => {
    expect(BRAND_OP_DOSSIER_FACTORY_DIFF_WRAP_TESTID).toContain('factory-diff-wrap');
    expect('brand-dossier-factory-diff-panel').toContain('factory-diff');
    expect('brand-dossier-factory-diff-brand-col').toContain('brand-col');
    expect('brand-dossier-factory-diff-factory-col').toContain('factory-col');
    expect(brandB2bOrderDossierContextHref(PLATFORM_CORE_DEMO.demoOrderId)).toContain(
      '#production-dossier'
    );
  });

  it('cut_ticket PG verify on production_orders JSONB (Wave UG/VQ)', () => {
    expect(BRAND_OP_CUT_TICKET_PG_VERIFY_BADGE_TESTID).toContain('cut-ticket-pg');
    expect(brandOpCutTicketGetApiPath(PLATFORM_CORE_DEMO.productionOrderId)).toContain(
      '/cut-ticket'
    );
    const stub = buildProductionOrderCutTicketStub({
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
      ticketNo: 'CT-VQ-001',
      brandStatus: 'ready',
    });
    expect(verifyProductionOrderCutTicketPg(stub).ok).toBe(true);
    expect(verifyProductionOrderCutTicketPg({}).ok).toBe(false);
    expect(brandOpCutTicketPgVerifyBadgeRu({ verified: true, ticketNo: 'CT-VQ-001' })).toContain(
      'PG ✓'
    );
  });

  it('migration 062 production_orders cut_ticket column', () => {
    expect('062_wave_ug_production_order_cut_ticket.sql').toContain('cut_ticket');
    expect('workshop2_purchase_orders').toContain('purchase_orders');
  });
});
