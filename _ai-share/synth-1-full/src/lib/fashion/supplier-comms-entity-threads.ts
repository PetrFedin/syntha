import {
  PLATFORM_CORE_DEMO,
  factoryMaterialsProcurementHrefForDemo,
  getPlatformCoreDemo,
} from '@/lib/platform-core-hub-matrix';
import { buildOrderSectionCommsMessagesHref } from '@/lib/platform-core-comms-section-groups';
import { supplierCommsEntityThreadSupportsAttachTz } from '@/lib/fashion/factory-comms-entity-thread-attach-tz';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import {
  factorySupplierMessagesB2bOrderContextHref,
  factorySupplierMessagesWorkshop2ArticleContextHref,
  factorySupplierRfqInboxHref,
  ROUTES,
} from '@/lib/routes';

export type SupplierCommsEntityThreadKind = 'bom' | 'rfq' | 'handoff' | 'qc';

export type SupplierCommsEntityThreadRow = {
  id: SupplierCommsEntityThreadKind;
  labelRu: string;
  summaryRu: string;
  messagesHref: string;
  contextHref: string;
  dossierTzHref: string;
  attachTzSupported: boolean;
  pillarRu: string;
};

export function buildSupplierCommsEntityThreads(input?: {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
}): SupplierCommsEntityThreadRow[] {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01';
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const demo = {
    ...getPlatformCoreDemo(collectionId),
    demoArticleId: articleId,
    demoOrderId: orderId,
  };
  const baseMessages = factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId);
  const orderMessages = factorySupplierMessagesB2bOrderContextHref(orderId);

  const bomTzHref = workshop2ArticleHref(collectionId, articleId, {
    w2pane: 'tz',
    w2sec: 'material',
  });
  const specTzHref = workshop2ArticleHref(collectionId, articleId, { w2pane: 'tz', w2sec: 'spec' });

  const thread = (
    id: SupplierCommsEntityThreadKind,
    labelRu: string,
    summaryRu: string,
    messagesHref: string,
    contextHref: string,
    pillarRu: string,
    dossierTzHref: string
  ): SupplierCommsEntityThreadRow => ({
    id,
    labelRu,
    summaryRu,
    messagesHref,
    contextHref,
    dossierTzHref,
    attachTzSupported: supplierCommsEntityThreadSupportsAttachTz(id),
    pillarRu,
  });

  return [
    thread(
      'bom',
      'BOM · material line',
      'Строка BOM под PO — quote через чат.',
      `${baseMessages}&q=${encodeURIComponent('BOM material line')}`,
      `${ROUTES.factory.supplierMessages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=bom&collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`,
      'order_production',
      bomTzHref
    ),
    thread(
      'rfq',
      'Centric RFQ',
      'Brand RFQ → supplier award chain.',
      `${baseMessages}&q=${encodeURIComponent('Centric RFQ')}`,
      factorySupplierRfqInboxHref({ collectionId, articleId }),
      'development',
      specTzHref
    ),
    thread(
      'handoff',
      'Handoff · materials',
      'PO в procurement после brand handoff.',
      buildOrderSectionCommsMessagesHref({
        roleId: 'supplier',
        orderId,
        collectionId,
        sectionId: 'sup-op-handoff-read',
      }),
      factoryMaterialsProcurementHrefForDemo(demo, { role: 'supplier' }),
      'order_production',
      specTzHref
    ),
    thread(
      'qc',
      'QC evidence',
      'Material cert / inspection thread с брендом.',
      `${orderMessages}&q=${encodeURIComponent('QC evidence')}`,
      `${ROUTES.brand.productionOperations}?${PILLAR_CAPABILITY_FEATURE_PARAM}=qc-gate`,
      'order_production',
      specTzHref
    ),
  ];
}

export function supplierCommsEntitiesHref(collectionId?: string, articleId?: string): string {
  const cid = collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const aid = articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  return `${ROUTES.factory.supplierMessages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=entities&collection=${encodeURIComponent(cid)}&article=${encodeURIComponent(aid)}`;
}
