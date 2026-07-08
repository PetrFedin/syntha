import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { buildOrderSectionCommsMessagesHref } from '@/lib/platform-core-comms-section-groups';
import { manufacturerCommsEntityThreadSupportsAttachTz } from '@/lib/fashion/factory-comms-entity-thread-attach-tz';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import {
  factoryMessagesB2bOrderContextHref,
  factoryMessagesWorkshop2ArticleContextHref,
  factoryProductionDossierContextHref,
  factoryProductionHandoffQueueHref,
  ROUTES,
} from '@/lib/routes';

export type ManufacturerCommsEntityThreadKind = 'handoff' | 'dossier' | 'qc' | 'sample';

export type ManufacturerCommsEntityThreadRow = {
  id: ManufacturerCommsEntityThreadKind;
  labelRu: string;
  summaryRu: string;
  messagesHref: string;
  contextHref: string;
  dossierTzHref: string;
  attachTzSupported: boolean;
  pillarRu: string;
};

export function buildManufacturerCommsEntityThreads(input?: {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  factoryId?: string;
}): ManufacturerCommsEntityThreadRow[] {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01';
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const factoryId = input?.factoryId?.trim() || PLATFORM_CORE_DEMO.factoryId;

  const thread = (
    id: ManufacturerCommsEntityThreadKind,
    labelRu: string,
    summaryRu: string,
    messagesHref: string,
    contextHref: string,
    pillarRu: string,
    dossierTzHref: string
  ): ManufacturerCommsEntityThreadRow => ({
    id,
    labelRu,
    summaryRu,
    messagesHref,
    contextHref,
    dossierTzHref,
    attachTzSupported: manufacturerCommsEntityThreadSupportsAttachTz(id),
    pillarRu,
  });

  const dossierTzHref = workshop2ArticleHref(collectionId, articleId, {
    w2pane: 'tz',
    w2sec: 'spec',
  });
  const sampleTzHref = workshop2ArticleHref(collectionId, articleId, { w2pane: 'sample' });

  const articleChat = factoryMessagesWorkshop2ArticleContextHref(collectionId, articleId, {
    role: 'manufacturer',
  });
  const orderChat = factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });

  return [
    thread(
      'handoff',
      'Handoff queue row',
      'Чат по B2B PO в очереди передачи (mfr-op-handoff-queue).',
      buildOrderSectionCommsMessagesHref({
        roleId: 'manufacturer',
        orderId,
        collectionId,
        sectionId: 'mfr-op-handoff-queue',
      }),
      factoryProductionHandoffQueueHref(orderId, { factoryId, collectionId }),
      'order_production',
      dossierTzHref
    ),
    thread(
      'dossier',
      'Shop-floor dossier',
      'Read-only ТЗ + bundle для линии.',
      `${articleChat}&q=${encodeURIComponent('Shop-floor dossier')}`,
      factoryProductionDossierContextHref(articleId, { collectionId, orderId }),
      'order_production',
      dossierTzHref
    ),
    thread(
      'qc',
      'QC gate',
      'Inspectorio AQL — brand ops ↔ цех.',
      `${orderChat}&q=${encodeURIComponent('QC gate checklist')}`,
      manufacturerHandoffFeatureHref('qc-gate', { factoryId, collectionId, orderId }),
      'order_production',
      dossierTzHref
    ),
    thread(
      'sample',
      'Sample queue',
      'W2 sample request до handoff.',
      `${articleChat}&q=${encodeURIComponent('Sample queue')}`,
      manufacturerHandoffFeatureHref('sample-queue', { factoryId, collectionId, orderId }),
      'development',
      sampleTzHref
    ),
  ];
}

export function manufacturerCommsInboxHref(): string {
  return `${ROUTES.factory.messages}?role=manufacturer&${PILLAR_CAPABILITY_FEATURE_PARAM}=inbox`;
}

export function manufacturerCommsEntitiesHref(): string {
  return `${ROUTES.factory.messages}?role=manufacturer&${PILLAR_CAPABILITY_FEATURE_PARAM}=entities`;
}
